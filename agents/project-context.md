# URLHub Project Context

## Overview

URLHub is a personal link management platform.

The current version focuses on simplicity and stability rather than feature richness.

Current scope:

- One Hub per user.
- Custom aliases.
- Public Hub sharing.
- URL shortener.
- REST API.
- JWT Authentication.

## Project Philosophy

- Simplicity over abstraction.
- Backend owns business rules.
- Frontend adapts backend responses.
- Stable API contracts.
- Incremental evolution.
- Minimal dependencies.
- Explicit code over clever code.

## Architecture Decisions

The following decisions are intentional:

- One Hub per user (v1).
- Hubs contain Links.
- Links are first-class resources.
- Alias resolution is centralized.
- Public and authenticated flows share the same business logic whenever possible.
- The frontend consumes adapted objects instead of raw database models.

Do not propose architectural changes unless explicitly requested.
Assume these decisions are intentional.