# Backend API Audit — v1

**Date:** 2026-08-07
**Repository:** `urlhub-server`
**Branch:** `dev`
**Scope:** Backend only (frontend repository intentionally **not** inspected)
**Status:** Baseline reference for future backend improvements — no application code was modified as part of this audit.

---

## 1. Current API Conventions

### Base path and routing

- All REST endpoints are mounted under `/api/v1` (`src/routes/api.v1.routes.js`).
- The alias resolver runs at the root: `GET /:alias` (`src/app.js:44`).
- Deprecated/unregistered routes (commented out in route files): `POST /links/short`, `PATCH /links/migrate`.

### Success responses

- Success envelope: `{ message, data }` sent as HTTP `200` via `res.sendSuccess(...)` (`src/routes/main.router.js:30`).
- `sendSuccess` accepts the full object, e.g. `sendSuccess({ message: '...', data: ... })`.
- Documented exception: `GET /:alias` returns the resolved entity directly (no envelope).

### Error responses

- `sendClientError(message)` → `400 { error: message }` (`main.router.js:31`)
- `sendUnauthorized` → `401 { error }`; `sendForbidden` → `403 { error }`; `sendNotFound` → `404 { error }`; `sendServerError` → `500 { error }` (`main.router.js:32-35`)
- Passport JWT failure → `401 { error: <passport info>, message: 'User cannot set on passport.' }` (`main.router.js:71-74`)
- Some controllers return not-found as `404` via raw `res.status(404).json({ error })` instead of the helpers (`hubs.controller.js:59,78,98`).
- Controllers mix two payload styles: plain string (`sendClientError('Incomplete values')` → `{ error: 'Incomplete values' }`) and object (`sendClientError({ error, message })` → `{ error: { ... }, message }`).

### Authentication & authorization

- Passport JWT strategy; token extracted from cookie `auth_token` (httpOnly, `secure`, `sameSite=None`, 1h `maxAge`).
- Route strategies: `'NOTHING'` (no auth), `'JWT'` (Passport JWT). Policies: `['PUBLIC']`, `['USER']`, `['ADMIN']`.
- `req.user` is the full DB row attached by Passport (includes `hashed_pass` — the JWT payload is generated from the full row).
- `permissions` map: `PUBLIC` → `GET, POST`; `USER`/`ADMIN` → all methods.
- **Important:** the policies middleware reads `user.role.toUpperCase()` *before* the null check on `user` (`main.router.js:92-94`); a missing `req.user` throws instead of returning 403.

### Architecture

```
Route → Controller → Service → Repository → DAO → Turso (libSQL)
```

- Controllers: thin request/response handling, validation, error mapping.
- Services: business logic, existence checks, ID/alias generation, domain errors.
- DAOs: raw SQL only; domain errors (`DatabaseError`, `ElementNotFound`, `UserNotFound`, etc.).
- No new dependencies should be added to satisfy conventions.

### libSQL ResultSet caveat

`connection.execute(...)` returns a `ResultSet` object (`{ columns, rows, rowsAffected, lastInsertRowid }`). DAOs must return `result.rows` / `result.rows[0]` — several DAOs currently return the raw `ResultSet` (see §5).

---

## 2. Summary

| Metric | Value |
|--------|-------|
| Live endpoints audited | 23 (6 users / 4 links / 12 hubs / 1 root alias) |
| Compliant (`✅`) | 14 |
| Partial (`⚠️`) | 6 |
| Non-compliant (`❌`) | 3 |
| Tests (full suite) | 29 passing / 15 failing (pre-existing; unchanged by this audit) |

Legacy (non-live) routes: `POST /links/short`, `PATCH /links/migrate` (commented out); `GET /hubs/public/alias/:alias` (deprecated but still registered).

---

## 3. Compliant Endpoints (`✅`)

Envelope `{ message, data }` with meaningful `data` (no raw ResultSet leakage).

| Method | Route | Auth | Request body | Success response | Source |
|--------|-------|------|--------------|------------------|--------|
| POST | `/users/register` | PUBLIC | `{ first_name, email_register, password, nickname }` | `200 { message, data: { id } }` (hub auto-created) | `users.controller.js:56` |
| POST | `/users/logout` | JWT · USER | — | `200 { message: 'Logout successful', data: null }` (clears cookie) | `users.controller.js:97` |
| PATCH | `/users/update` | JWT · USER | `{ nickname, first_name, email, password? }` | `200 { message, data: { id, first_name, last_name, nickname, email, role } }` | `users.controller.js:78` |
| DELETE | `/users/delete` | JWT · USER | — (deletes `req.user.email`) | `200 { message, data: null }` | `users.controller.js:124` |
| GET | `/links` | JWT · USER | — | `200 { message, data: link[] }` | `links.controller.js:13` |
| POST | `/links` | JWT · USER | `{ title, big_link, icon?, alias? }` | `200 { message, data: link }` (RETURNING row) | `links.controller.js:67` |
| GET | `/hubs/public/:hubId` | PUBLIC | — | `200 { message, data: { name, first_name, nickname, links: [...] } }` | `hubs.controller.js:75` |
| GET | `/hubs/public/alias/:alias` | PUBLIC | — | `200 { message, data: { name, ... } }` (deprecated) | `hubs.controller.js:95` |
| GET | `/hubs` | JWT · USER | — | `200 { message, data: hub[] }` (adds `short_link`) | `hubs.controller.js:40` |
| GET | `/hubs/:hubId` | JWT · USER | — | `200 { message, data: hub }` | `hubs.controller.js:56` |
| POST | `/hubs` | JWT · USER | `{ title }` | `200 { message, data: hub }` (RETURNING row) | `hubs.controller.js:25` |
| PUT | `/hubs` | JWT · USER | `{ links: [{ id, ... }] }` | `200 { message, data: hub_links[] }` (reorder) | `hubs.controller.js:220` |
| POST | `/hubs/:hubId/links` | JWT · USER | `{ link_id, order_index? }` | `200 { message, data: hub_link }` (RETURNING row) | `hubs.controller.js:168` |
| GET | `/hubs/:hubId/links` | JWT · USER | — | `200 { message, data: hub_links[] }` | `hubs.controller.js:200` |

---

## 4. Partial Endpoints (`⚠️`)

Envelope present but `data` leaks the raw libSQL `ResultSet`, or the returned user shape is inconsistent with the rest of the API.

| Method | Route | Auth | Issue |
|--------|-------|------|-------|
| POST | `/users/login` | PUBLIC | `data` shape `{ id, first_name, last_name, nickname, email }` — **missing `role`**, inconsistent with `/users/update` | `users.service.js:25-31` |
| POST | `/users/auth/verify` | JWT · USER | `data` shape `{ id, first_name, nickname, email, role }` — **missing `last_name`**, inconsistent with login/update | `users.controller.js:106` |
| DELETE | `/links/:linkId` | JWT · USER | `data` = raw libSQL `ResultSet` | `links.mysql.js:135-145` |
| DELETE | `/hubs/:hubId` | JWT · USER | `data` = raw libSQL `ResultSet` | `hubs.mysql.js:62-72` |
| DELETE | `/hubs/:hubId/links/:linkId` | JWT · USER | `data` = raw libSQL `ResultSet` | `hubs.mysql.js:110-120` |
| PUT | `/hubs/:hubId/links/:linkId/order` | JWT · USER | `data` = raw libSQL `ResultSet` | `hubs.mysql.js:191-201` |

---

## 5. Non-compliant Endpoints (`❌`)

| Method | Route | Auth | Issue |
|--------|-------|------|-------|
| GET | `/:alias` | PUBLIC | Returns the resolved entity directly via `res.status(200).json(result)` — **no `{ message, data }` envelope**. README documents a **302 redirect** to the original URL, but the implementation returns JSON `{ type, ... }`. Contract mismatch between docs and behavior. | `alias.controller.js:20`, `app.js:44` |
| PUT | `/links/:linkId` | JWT · USER | `data` = raw libSQL `ResultSet`; `allowedFields` only `title, icon, alias` — `big_link` and `short_link` cannot be updated | `links.mysql.js:76-102` |
| PUT | `/hubs/:hubId` | JWT · USER | `data` = raw libSQL `ResultSet`; `short_link` update accepted by controller but ignored by DAO SQL | `hubs.mysql.js:50-60` |

---

## 6. Remaining Inconsistencies

1. **User entity shape drift** — Three different shapes for the same entity:
   - login → `{ id, first_name, last_name, nickname, email }` (no `role`)
   - verify → `{ id, first_name, nickname, email, role }` (no `last_name`)
   - update → `{ id, first_name, last_name, nickname, email, role }`
2. **libSQL `ResultSet` leakage** — 6 endpoints expose `{ columns, rows, rowsAffected, lastInsertRowid }` as `data`: `PUT /links/:linkId`, `DELETE /links/:linkId`, `PUT /hubs/:hubId`, `DELETE /hubs/:hubId`, `DELETE /hubs/:hubId/links/:linkId`, `PUT /hubs/:hubId/links/:linkId/order`. Services return the DAO's raw result instead of adapted rows/IDs.
3. **Non-uniform error response shapes** — Mix of string payloads (`{ error: 'Incomplete values' }`) and object payloads (`{ error: { message }, message }`, e.g. login not-found). Clients must handle two different `error` types.
4. **Inconsistent not-found status codes** — `400` via `sendClientError` for links/hubs mutations, but `404` via raw `res.status(404).json` for public hub getters and `getHubById`.
5. **README drift** — Documents as active: `POST /links/short` and `PATCH /links/migrate` (both commented out); `DELETE /users/delete` as `ADMIN` (actual: `JWT · USER`, self-delete); `auth/verify` as `PUBLIC` (actual: `JWT · USER`); `GET /:alias` as 302 redirect (actual: JSON). README also references stale test counts and a `redirect.controller.js` that no longer exists (real file: `alias.controller.js`).
6. **Missing `short_link` on links** — Hubs responses compute `short_link` (`hubs.service.js:39-42`), but links are returned raw with no `short_link` field, despite the README defining `links.short_link = {BACKEND_URL}/{alias}`.
7. **Ownership gaps** — Mutations are keyed only by entity ID, not scoped to `req.user.id`: `PUT/DELETE /links/:linkId`, `PUT/DELETE /hubs/:hubId`, `DELETE /hubs/:hubId/links/:linkId`, `PUT /hubs/:hubId/links/:linkId/order`. Any authenticated user can modify another user's resource if they know/guess the UUID. (`PUT /hubs` reorder is the exception — it resolves the hub from `req.user.id`.)
8. **Naming drift** — `email_register` used in request bodies (register/login) vs `email` in the DB and `req.user`; controllers use both spellings depending on context (`users.controller.js:10,37,68,116`).
9. **Dead code & latent bugs** —
   - `deleteByEmailRegister` DAO checks `result.affectedRows` but libSQL ResultSet exposes `rowsAffected` → the check is always `0` and `UserNotFound` is always thrown (`users.mysql.js:141`).
   - `users.mysql.js:96` returns `result.rows[0]` for an INSERT without `RETURNING` (always `undefined`).
   - Unused imports in `alias.service.js` (`newId`, `shortAlias`, `validateUrl`, `config`, `ElementAlreadyExists`, `logger`).
   - Large commented-out blocks across routes, controllers, and DAOs (public links, migration).
10. **Duplicate error handling** — `applyCallbacks` in `main.router.js:102-110` wraps every callback in try/catch returning `500 { error }`, while controllers also catch and emit `sendServerError`; the `sendUnauthorized`/`sendForbidden`/`sendNotFound` helpers exist but are barely used.

---

## 7. Suggested Future Improvements (not implemented)

Prioritized for a future pass:

1. **Canonical user shape** — Adopt a single response adapter (`{ id, first_name, last_name, nickname, email, role }`) used by login, verify, and update.
2. **Stop leaking libSQL `ResultSet`** — DAO/service returns `rows[0]`, `rows`, or `{ id }` (plus `rowsAffected` checks) instead of the raw result; return `data: null` for idempotent deletes.
3. **Fix `deleteByEmailRegister`** — Use `rowsAffected === 0` and re-throw `UserNotFound` out of the catch (or keep existence check in service).
4. **Unify error responses** — Pick one style (string vs object) for `sendClientError`; align not-found to a single status (prefer `404` with `{ error }`).
5. **Reconcile README with the API contract** — Remove/annotate dead routes, correct roles and status codes, and document the actual `GET /:alias` JSON behavior (or implement the documented redirect).
6. **Add `short_link` to link responses** — Compute `{BACKEND_URL}/{alias}` in the links service, mirroring hubs.
7. **Enforce ownership** — Scope every link/hub mutation to `req.user.id`; return `404` (not `403`) for cross-user access to avoid ID enumeration.
8. **Normalize naming** — Pick one identifier for the email field across request bodies, services, and controllers.
9. **Reduce dead code** — Remove deprecated routes, commented blocks, and unused imports; consider a dedicated `redirect.controller.js` if the redirect behavior is intended.
10. **Fix `policies` null guard** — Check `user` before reading `user.role` (`main.router.js:92-94`).

---

*This document is the baseline for future backend improvements. All classifications reflect the repository state on 2026-08-07.*
