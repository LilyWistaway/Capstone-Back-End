# Wistaway Mini – Backend

## Overview

This repository contains the backend API for **Wistaway Mini**, a discovery-first travel application focused on curated lodging properties and intent-based playlists.

The backend is responsible for:

- user authentication and authorization
- data persistence and access control
- business logic for playlists, lodging properties, and saved links
- enforcing ownership and permissions server-side

This API is intentionally designed to support discovery and organization _before_ booking.

---

## Tech Stack

- Node.js
- Express
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt
- Render (deployment)

---

## Code Standards & Conventions

This project follows consistent conventions to keep the codebase readable, predictable, and easy to review.

### General Principles

- Prefer clarity over cleverness
- Keep functions small and single-purpose
- Avoid premature abstraction
- Delete unused code instead of commenting it out

---

### Naming Conventions

**Files & Folders**

- Use `camelCase` for folders and non-component files
- Use descriptive, explicit names (avoid abbreviations)

**Variables**

- Use `camelCase`
- Use nouns for values and data structures
  - `user`, `playlist`, `lodgingProperty`

**Functions**

- Use `camelCase`
- Use verbs that describe behavior
  - `createPlaylist`
  - `addLinkToPlaylist`

---

### Formatting & Style

- Remove unused imports, variables, and console logs
- Keep consistent spacing and indentation within files
- Use early returns to reduce nesting where possible

---

### Comments & Documentation

- Prefer self-documenting code over comments
- Add brief (1–2 sentence) comments for:
  - route handlers
  - middleware
  - utility functions
- Do not restate what the code already makes obvious

---

## Environment Variables

Environment variables are stored in a `.env` file (not committed).

Required variables:

```env
DATABASE_URL=
JWT_SECRET=
NODE_ENV=development
```

---

## File & Component Overview

### `src/app.js`

Configures the Express application, including middleware, routes, error handling, and the health check endpoint.

### `src/server.js`

Starts the Express server and binds it to the configured port.

### `src/routes/auth.js`

Implements user registration, login, and a protected endpoint for retrieving the currently authenticated user using JWTs.

### `src/routes/playlists.js`

Implements all playlist-related endpoints, including user-owned playlist CRUD and adding/removing external inspiration links.

### `src/middleware/requireAuth.js`

Protects routes by verifying a JWT from the Authorization header and attaching the authenticated user to the request.

### `src/utils/auth.js`

Handles JWT creation and verification logic used by authentication routes and middleware.

### `src/db/pool.js`

Initializes the PostgreSQL connection pool using the DATABASE_URL environment variable.

### `src/db/query.js`

Provides a reusable helper for executing parameterized SQL queries against the database.

### `db/schema.sql`

Defines all database tables, relationships, and constraints used by the application.

### `db/seed.sql`

Populates the database with initial sample data for development and testing.
