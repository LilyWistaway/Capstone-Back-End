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
