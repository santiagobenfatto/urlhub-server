# URLHub

A URL shortener with a **Vite/React frontend** and **Express backend**. Users can create short links, organize them into hubs, and share public hub pages. Built with **Express 5**, **Turso (libSQL)**, and **Passport JWT** authentication.

## Architecture

The application runs as **two separate processes**:

| Service | Stack | Port |
|---------|-------|------|
| Frontend | Vite + React | `5173` |
| Backend | Express 5 + Turso | `3001` |

The backend exposes a REST API and a redirect endpoint. The frontend consumes the API and provides the user-facing hub pages.

### Short Link Format

Short links use two different base URLs depending on context:

| Entity | Format | Purpose |
|--------|--------|---------|
| **Hub** `short_link` | `{ORIGIN_URL}/{alias}` | Points to the **frontend** (public hub page) |
| **Link** `short_link` | `{BACKEND_URL}/{alias}` | Points to the **backend** (redirect endpoint) |

For example, with `ORIGIN_URL=http://localhost:5173` and `BACKEND_URL=http://localhost:3001`:
- A hub short link: `http://localhost:5173/aB3xYz`
- A link short link: `http://localhost:3001/aB3xYz`

### Backend Layers

The backend follows a **5-layer architecture** with strict separation of concerns:

```
Route → Controller → Service → Repository → DAO → Database
```

```
src/
├── app.js                    # Express app setup, middleware, server
├── container.js              # Dependency injection wiring
├── config/config.js          # Environment config (dotenv)
├── auth/index.js             # Passport JWT strategy (cookie extractor)
├── dao/
│   ├── db.config.js          # Turso client connection
│   └── mysql/                # Data access objects (raw SQL)
│       ├── users.mysql.js
│       ├── links.mysql.js
│       └── hubs.mysql.js
├── repositories/             # Thin delegation layer
│   ├── users.repository.js
│   ├── links.repository.js
│   └── hubs.repository.js
├── services/                 # Business logic, validation, ID generation
│   ├── users.service.js
│   ├── links.service.js
│   └── hubs.service.js
├── controllers/              # Request/response handling
│   ├── users.controller.js
│   ├── links.controller.js
│   ├── hubs.controller.js
│   └── redirect.controller.js # Alias-based redirect
├── routes/                   # Route definitions with auth & policy middleware
│   ├── main.router.js        # Base Router class (auth strategies, policies)
│   ├── api.v1.routes.js      # API v1 route aggregator
│   ├── users.routes.js
│   ├── links.routes.js
│   └── hubs.routes.js
├── errors/custom-errors.js   # Domain error classes
├── utils/
│   ├── generators.js         # ID and alias generators
│   ├── utils.js              # bcrypt hashing, JWT generation
│   ├── logger.js             # Winston logger + request middleware
│   └── passportStrategies.js # Strategy enum
├── sql/init.sql              # Database schema DDL
└── test/                     # Integration tests
    ├── setup.js              # Env setup (loads .env.test)
    ├── helpers/
    │   └── auth.js           # JWT token generator for tests
    ├── hubs.test.js
    ├── links.test.js
    └── users.test.js
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22+ (ESM) |
| Framework | Express 5 |
| Database | Turso (libSQL -- edge-ready SQLite) |
| Auth | Passport.js + JWT (cookie-based) |
| Logging | Winston (console + file, structured JSON) |
| Testing | Mocha + Chai + Supertest + Sinon |
| ID Generation | UUID v4 + nanoid |

## Database

Edge-hosted on **Turso**. Schema (`src/sql/init.sql`):

```
public_links                 # Public short links (no auth)
users     ──1:N── links      # Users own links
users     ──1:1── hubs       # Each user has one hub
hubs      ──1:N── hub_links  # Links organized inside hubs
links     ──1:N── hub_links  # Links can appear in hub_links
```

> **Note:** A hub is automatically created with the title "My Hub" when a new user registers.

### Push schema to Turso

```bash
turso db push --file ./src/sql/init.sql --db urlhubdb
```

### Migrating Existing Data

If you have existing data with `short_link` values pointing to the old URL scheme, run these commands to migrate:

```bash
turso db shell urlhubdb "UPDATE links SET short_link = REPLACE(short_link, 'http://localhost:5173', 'http://localhost:3001')"
turso db shell urlhubdb "UPDATE public_links SET short_link = REPLACE(short_link, 'http://localhost:5173', 'http://localhost:3001')"
turso db shell urlhubdb "UPDATE hubs SET short_link = REPLACE(short_link, 'http://localhost:3001', 'http://localhost:5173')"
```

This updates links to point to the backend and hubs to point to the frontend.

## API Endpoints

All protected endpoints require a JWT cookie (`auth_token`) obtained via login.

### Redirect

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:alias` | Looks up alias in both `links` and `public_links`, then **302 redirects** to the original URL |

### Users (`/api/v1/users`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/register` | -- | PUBLIC | Register a new user (hub auto-created) |
| POST | `/login` | -- | PUBLIC | Login, returns JWT cookie |
| POST | `/auth/verify` | -- | PUBLIC | Verify auth token validity |
| POST | `/logout` | JWT | USER | Clear auth cookie |
| DELETE | `/delete` | -- | ADMIN | Delete user by email |

### Links (`/api/v1/links`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | JWT | USER | Get all links for authenticated user |
| POST | `/` | JWT | USER | Create a new short link |
| POST | `/short` | -- | PUBLIC | Create a public short link |
| PATCH | `/migrate` | JWT | USER | Migrate a public link to the authenticated user |
| PUT | `/:linkId` | JWT | USER | Update a link (partial updates supported -- send only the fields you want to update) |
| DELETE | `/:linkId` | JWT | USER | Delete a link |

### Hubs (`/api/v1/hubs`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/public/:hubId` | -- | PUBLIC | Get public hub by ID (returns `{ name, links: [{ id, title, shortLink, icon }] }`) |
| GET | `/public/alias/:alias` | -- | PUBLIC | Get public hub by alias |
| POST | `/` | JWT | USER | Create a hub (one per user, auto-created on registration) |
| GET | `/` | JWT | USER | Get all hubs for authenticated user |
| GET | `/:hubId` | JWT | USER | Get hub by ID |
| PUT | `/:hubId` | JWT | USER | Update hub title/alias/short_link |
| DELETE | `/:hubId` | JWT | USER | Delete hub |
| POST | `/:hubId/links` | JWT | USER | Add a link to hub |
| DELETE | `/:hubId/links/:linkId` | JWT | USER | Remove a link from hub |
| GET | `/:hubId/links` | JWT | USER | Get all links in hub (ordered) |
| PUT | `/:hubId/links/:linkId/order` | JWT | USER | Update link order in hub |

## Auth

JWT tokens are stored in **httpOnly cookies**. The Passport JWT strategy extracts the token from `req.cookies` and attaches the user payload to `req.user`.

```
Set-Cookie: auth_token=<jwt>; Max-Age=3600; HttpOnly; Secure; SameSite=None
```

Supported roles: `ADMIN`, `USER`, `PUBLIC` (unauthenticated).

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [urlhub.vercel.app](https://urlhub.vercel.app) |
| Backend | Render | `urlhub.dev` (custom domain) |

## Getting Started

### Prerequisites

- Node.js 22+
- A [Turso](https://turso.tech) database (or local libSQL)
- npm

### Setup

```bash
# Clone and install
git clone <repo>
cd urlhub-server
npm install

# Configure environment
cp .env.dev .env   # or create .env.prod for production
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `TURSO_DB_URL` | Turso database URL (libsql://...) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `ORIGIN_URL` | Frontend URL (e.g. `http://localhost:5173`) |
| `BACKEND_URL` | Backend URL (e.g. `http://localhost:3001`) |
| `PRIVATE_KEY` | JWT signing secret |
| `COOKIE_TOKEN` | Cookie name for JWT (optional) |
| `PORT` | Server port (default: 3001) |
| `LOG_LEVEL` | Winston log level: error, warn, info, http, debug (default: info) |

### Run

```bash
# Backend (this repo)
npm run dev      # Development with nodemon
npm start        # Start server

# Frontend (separate repo/process)
# Runs on port 5173 via Vite dev server
```

## Testing

Integration tests use **Mocha + Chai + Supertest + Sinon** with stubbed services. The test environment loads `.env.test` via `src/test/setup.js`.

```bash
npm test                   # Run once (30 tests)
npm run test:watch         # Run in watch mode
```

**Test coverage (30 tests):**

| Suite | Tests | What's covered |
|-------|-------|----------------|
| Hubs | 10 | CRUD hubs + hub_links, auth guard, not-found errors |
| Links | 11 | CRUD links, public short links, auth guard, validation |
| Users | 9 | Register, login, logout, duplicate/user-not-found/password errors, auth guard |

Tests validate the full HTTP pipeline (routes -> middleware -> controllers -> response formatting) without requiring a real database. Each test stubs the relevant service method using sinon and restores after each case.

## Scripts

```bash
npm run dev        # Development server with hot reload
npm start          # Production server
npm test           # Run integration tests (30 tests)
npm run test:watch # Run tests in watch mode
```

## Dependencies

| Package | Purpose |
|---------|---------|
| express 5 | Web framework |
| @libsql/client | Turso/libSQL database client |
| passport + passport-jwt | Authentication |
| jsonwebtoken | JWT signing and verification |
| bcrypt | Password hashing |
| winston | Logging (console + file, levels, JSON output) |
| nanoid + uuid | ID and alias generation |
| cookie-parser | Cookie parsing |
| cors | Cross-origin support |
| dotenv | Environment configuration |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| mocha | Test runner |
| chai | Assertion library |
| supertest | HTTP integration testing |
| sinon | Method stubbing and mocking |

## License

ISC -- (c) santiagobenfatto
