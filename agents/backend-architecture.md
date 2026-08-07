# Backend Architecture

URLHub follows a layered architecture.

Request Flow:

Routes
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
DAO
    ↓
Database

Responsibilities

## Routes

- Define endpoints.
- Apply middlewares.
- Delegate to controllers.

## Controllers

- Receive HTTP requests.
- Validate basic request structure.
- Call services.
- Return HTTP responses.
- No business logic.

## Services

- Business rules.
- Orchestrate repositories.
- Perform validations.
- Throw domain errors.

## Repositories

- Isolate data access.
- Translate database operations.
- No business logic.

## DAO

- Database-specific implementation.
- SQL statements.
- Persistence only.

## General Principles

- One responsibility per layer.
- Keep methods focused.
- Prefer composition over duplication.
- Avoid leaking database details outside repositories.