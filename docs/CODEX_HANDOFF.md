# Codex Handoff — Projectline

**Last updated:** 2026-07-26

This is the continuation guide for Projectline. Read it completely before changing the repository.
The project is connected to Lovable: do not rewrite published Git history or force-push.

## Current state

Projectline contains:

- a completed Lovable-generated frontend prototype with separate client and vendor portals;
- existing mock data and simulated interactions;
- frontend route smoke tests;
- a small, separate Express/TypeScript API;
- Prisma with a local SQLite database, initial migration, and development seed;
- three unauthenticated read endpoints.

The frontend still uses `src/data/` and is **not connected to the API**. This is deliberate. Do not
remove mock data or change the frontend design/routes without a new explicit request.

## Frontend

The root npm package uses TanStack Start, TanStack Router, React 19, TypeScript, Tailwind CSS, Radix
UI, and the Lovable Vite configuration.

Routes:

```text
/
/login
/client/dashboard
/client/projects
/client/projects/:projectId
/client/documents
/client/notifications
/client/settings
/vendor/dashboard
/vendor/projects
/vendor/projects/:projectId
/vendor/documents
/vendor/notifications
/vendor/settings
/*
```

Key locations:

- `src/routes/` — file-based routes
- `src/components/layout/` — shared application shell
- `src/components/common/` — reusable presentation and interaction components
- `src/components/project/` — shared project-domain screens
- `src/data/types.ts` — frontend interfaces/status unions
- `src/data/*.ts` — mock records
- `src/lib/session.ts` — permissive demo-session placeholder
- `src/test/app-routes.test.tsx` — route smoke coverage

All visible mutations remain local simulations. Uploads, task moves, notifications, deliverable
actions, and login do not persist.

## Backend

The API is a separate npm package under `server/` using:

- Node.js 20+
- Express 5
- TypeScript
- Prisma 6
- SQLite
- Zod
- Vitest and Supertest

Key locations:

- `server/src/app.ts` — Express configuration
- `server/src/server.ts` — process startup/shutdown
- `server/src/config/env.ts` — validated environment
- `server/src/db/prisma.ts` — Prisma client
- `server/src/routes/` — health and project routes
- `server/src/middleware/` — consistent errors and 404s
- `server/prisma/schema.prisma` — eight requested MVP models
- `server/prisma/migrations/` — initial committed migration
- `server/prisma/seed.ts` — repeatable local seed
- `server/test/api.test.ts` — four API tests

Implemented endpoints:

```text
GET /api/health
GET /api/projects
GET /api/projects/:projectId
```

There is no authentication, role enforcement, project-membership enforcement, mutation API,
document upload, S3 integration, PostgreSQL, Redis, or background queue.

## Local setup

Frontend:

```sh
npm install
npm run dev
```

Backend:

```sh
cd server
npm install
```

Copy `server/.env.example` to `server/.env`, then:

```sh
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Default API address: `http://127.0.0.1:3001`.

Development seed accounts:

```text
client@example.com / password123
vendor@example.com / password123
```

The seed stores bcrypt hashes. These credentials are not connected to the frontend login yet.

## Validation commands

From the repository root:

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

From `server/`:

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm start
```

The current automated baseline is five passing frontend tests and four passing backend tests.

## Decisions made in this phase

- npm is the single package manager; root and backend lockfiles are committed.
- The unused dependency that caused npm peer resolution to fail was removed.
- Fast Refresh warnings were fixed by moving variant helpers out of component modules.
- Express and SQLite were selected for the smallest reliable internship/MVP foundation.
- API responses consistently wrap success data and error messages.
- The seed aligns project IDs and basic content with the frontend prototype where practical.
- Frontend/API integration was intentionally deferred.

## Known issues and constraints

- Frontend route guards and role selection are simulations.
- The API is unauthenticated and must remain local-only until authentication and membership checks
  exist.
- Some frontend mock aggregates are not organisation-scoped.
- Frontend and Prisma interfaces are separate and can drift.
- Document rows have metadata fields, but no files are stored.
- SQLite is local-development infrastructure, not a production decision.
- Dependency installation reports high-severity advisories in both npm packages. The environment
  did not authorise the registry audit needed to retrieve advisory details.
- The frontend build succeeds with non-fatal warnings from the upstream Lovable/Vite configuration.

## Recommended next phase

If requested, proceed in this order:

1. Resolve dependency advisories.
2. Add typed API response DTOs and a minimal fetch client.
3. Add React Query hooks for project list/detail reads.
4. Integrate project screens incrementally while keeping mock fallback data.
5. Implement bcrypt login, short-lived JWT access tokens, rotating refresh tokens, and logout.
6. Enforce `ProjectMember` checks and role-specific permissions.
7. Add mutations and document storage only after the read/auth path is tested.

Do not start those items as part of the completed foundation phase.
