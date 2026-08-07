# Backend Rules

## Architecture

- Respect the current layered architecture.
- Controllers must remain thin.
- Business logic belongs in Services.
- Data access belongs in Repositories.
- Repositories must not contain business logic.

## API

- Preserve existing API contracts unless explicitly requested.
- Prefer REST conventions.
- Use PATCH for partial updates.
- Keep request and response payloads simple.
- Do not introduce unnecessary nested objects.

## Database

- Keep database access inside repositories only.
- Avoid duplicating queries.
- Respect existing table structure unless the task explicitly requires schema changes.

## Validation

- Validate user input before executing business logic.
- Return meaningful HTTP status codes.
- Keep error responses consistent with the current project.

## Code Style

- Follow the existing naming conventions.
- Prefer explicit code over unnecessary abstractions.
- Reuse existing utilities.
- Do not introduce helper classes unless there is a clear benefit.

## Dependencies

- Do not add new dependencies unless explicitly requested.

## Planning

If backend changes require frontend updates, clearly specify:

- Endpoint
- HTTP method
- Request payload
- Response payload

Do not implement frontend work.