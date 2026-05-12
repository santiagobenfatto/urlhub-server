# URLHub Server

A URL shortener API built with **Express 5**, **Turso (libSQL)**, and **Passport JWT** authentication. Users can create short links, organize them into hubs, and manage their collections through a secure REST API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22+ (ESM) |
| Framework | Express 5 |
| Database | Turso (libSQL — edge-ready SQLite) |
| Auth | Passport.js + JWT (cookie-based) |
| Logging | Winston (console + file, structured JSON) |
| Testing | Mocha + Chai + Supertest + Sinon |
| ID Generation | UUID v4 + nanoid |

## Architecture

The project follows a **5-layer architecture** with strict separation of concerns:

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
│   └── hubs.controller.js
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

### Data Flow

1. **Route** matches the HTTP method + path and applies auth/policy middleware
2. **Middleware chain** authenticates via Passport JWT and verifies user role
3. **Request logger** records method, path, status, duration, and userId for every request
4. **Controller** extracts input (`req.body`, `req.params`, `req.user`), validates, delegates to service
5. **Service** executes business logic (existence checks, ID generation, alias creation), logs domain events
6. **Repository** delegates to the DAO (enables swapping data sources)
7. **DAO** executes raw parameterized SQL against Turso

## Database

Edge-hosted on **Turso**. Schema (`src/sql/init.sql`):

```
users     ──1:N── links      # Users own links
users     ──1:1── hubs       # Each user has one hub
hubs      ──1:N── hub_links  # Links organized inside hubs
links     ──1:N── hub_links  # Links can appear in hub_links
```

### Push schema to Turso

```bash
turso db push --file ./src/sql/init.sql --db urlhubdb
```

## API Endpoints

All protected endpoints require a JWT cookie (`auth_token`) obtained via login.

### Users (`/api/v1/users`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/register` | — | PUBLIC | Register a new user |
| POST | `/login` | — | PUBLIC | Login, returns JWT cookie |
| POST | `/login/auth/verify` | — | PUBLIC | Verify auth token validity |
| POST | `/logout` | JWT | USER | Clear auth cookie |
| DELETE | `/delete` | — | ADMIN | Delete user by email |

### Links (`/api/v1/links`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/` | JWT | USER | Get all links for authenticated user |
| POST | `/` | JWT | USER | Create a new short link |
| POST | `/short` | — | PUBLIC | Create a public short link |
| PUT | `/:linkId` | JWT | USER | Update a link |
| DELETE | `/:linkId` | JWT | USER | Delete a link |

### Hubs (`/api/v1/hubs`)

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/` | JWT | USER | Create a hub (one per user) |
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

Environment variables (`.env.dev`):

| Variable | Description |
|----------|-------------|
| `TURSO_DB_URL` | Turso database URL (libsql://...) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `ORIGIN_URL` | Allowed CORS origin (e.g. `http://localhost:5173`) |
| `PRIVATE_KEY` | JWT signing secret |
| `COOKIE_TOKEN` | Cookie name for JWT (optional) |
| `PORT` | Server port (default: 3001) |
| `LOG_LEVEL` | Winston log level: error, warn, info, http, debug (default: info) |

### Run

```bash
npm run dev      # Development with nodemon
npm start        # Start server
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
| Links | 10 | CRUD links, public short links, auth guard, validation |
| Users | 12 | Register, login, logout, duplicate/user-not-found/password errors, auth guard |

Tests validate the full HTTP pipeline (routes → middleware → controllers → response formatting) without requiring a real database. Each test stubs the relevant service method using sinon and restores after each case.

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

ISC — © santiagobenfatto
