# Projectline Implementation Plan

- **Last updated:** 2026-07-26
- **Current phase:** Frontend stabilisation and simple backend foundation
- **MVP stack:** React/TanStack Start frontend; Node.js, Express, TypeScript, Prisma, and SQLite
- **Phase status:** Complete

## 1. Scope and outcome

This phase preserved the Lovable-generated frontend design, route structure, and mock data. It
repaired the npm dependency and lint setup, added frontend route smoke tests, and created a small
read-only Express API backed by a seeded SQLite database.

The frontend has deliberately not been connected to the API. Authentication, authorisation,
project mutations, document uploads, object storage, PostgreSQL, and production deployment are
outside this phase.

## 2. Current frontend architecture

- **Framework:** TanStack Start with TanStack Router file-based routing
- **UI:** React 19, Tailwind CSS 4, shadcn-style components, and Radix UI
- **Language:** TypeScript with strict checking
- **Build:** Vite through the Lovable TanStack configuration
- **Application shell:** Shared responsive shell, sidebar, top bar, page headers, status components,
  forms, dialogs, and project-domain components
- **Data access:** Components import in-memory data from `src/data/`
- **Server state preparation:** A React Query client exists at the application root but is not used
  by domain screens yet
- **Mutations:** Local `useState`, `localStorage`, timers, and toast simulations
- **Authentication placeholder:** `src/lib/session.ts` stores a demo role locally; protected layouts
  do not enforce a real session

The visual frontend and all mock-data behavior remain intact.

## 3. Existing frontend routes

| Route                         | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `/`                           | Landing redirect/entry                  |
| `/login`                      | Simulated login and demo-role selection |
| `/client/dashboard`           | Client dashboard                        |
| `/client/projects`            | Client project list                     |
| `/client/projects/:projectId` | Client project workspace                |
| `/client/documents`           | Client document repository              |
| `/client/notifications`       | Client notifications                    |
| `/client/settings`            | Client settings                         |
| `/vendor/dashboard`           | Vendor dashboard                        |
| `/vendor/projects`            | Vendor project list                     |
| `/vendor/projects/:projectId` | Vendor project workspace                |
| `/vendor/documents`           | Vendor document repository              |
| `/vendor/notifications`       | Vendor notifications                    |
| `/vendor/settings`            | Vendor settings                         |
| `*`                           | Not-found page                          |

Frontend route smoke tests cover `/`, `/login`, both dashboards, and an unknown route.

## 4. Existing frontend data models

`src/data/types.ts` defines the prototype interfaces and status unions for:

- organisations and users;
- projects and project members;
- milestones and tasks;
- deliverables and documents;
- project updates and activity entries;
- notifications and client requests.

These frontend interfaces are not generated from Prisma and should remain independent until the API
contract is introduced. Several frontend-only presentation fields do not map one-to-one to the
initial database schema.

## 5. Mock-data locations

All existing mock data remains under `src/data/`:

```text
activity.ts
clientRequests.ts
deliverables.ts
documents.ts
index.ts
milestones.ts
notifications.ts
organisations.ts
projects.ts
tasks.ts
types.ts
updates.ts
users.ts
```

Mock data remains the frontend's source of truth during this phase.

## 6. Current state-management approach

- Imported module-level arrays supply domain data.
- Component state handles filters, dialogs, upload progress, task movement, and notification state.
- `localStorage` records the selected demo role.
- Sonner displays simulated success/error feedback.
- React Query is configured but has no project queries or mutations.
- There is no persistent cache, shared domain store, or API client.

The next phase should add a small typed API client and React Query hooks without rewriting the
existing components.

## 7. Frontend stabilisation completed

- Removed the unused `@hookform/resolvers` dependency that caused npm peer-resolution failures.
- Standardised the repository on npm with a root `package-lock.json`.
- Removed the stale Bun lockfile and Bun-only install configuration.
- Added `typecheck`, `format`, `format:check`, and `test` scripts.
- Fixed the existing `DeliverableStatus` Prettier failure.
- Split component-variant helpers from React component modules to satisfy Fast Refresh lint rules.
- Added Vitest, React Testing Library, and jsdom.
- Added five frontend route smoke tests.

No routes, page layouts, mock records, or visible product flows were redesigned.

## 8. Current backend architecture

The backend is a separate npm package under `server/`.

```text
server/
  prisma/
    migrations/
      20260725220413_init/
        migration.sql
    migration_lock.toml
    schema.prisma
    seed.ts
  src/
    config/
      env.ts
    db/
      prisma.ts
    middleware/
      error-handler.ts
      not-found.ts
    routes/
      health.ts
      projects.ts
    app.ts
    server.ts
  test/
    api.test.ts
  .env.example
  eslint.config.js
  package.json
  package-lock.json
  prisma.config.ts
  tsconfig.json
  tsconfig.build.json
  vitest.config.ts
```

Responsibilities are intentionally small:

- `app.ts` creates the Express application and middleware pipeline.
- `server.ts` owns process startup and shutdown.
- `config/env.ts` validates environment variables with Zod.
- `db/prisma.ts` owns the Prisma client.
- route files contain only the three requested read endpoints.
- middleware provides consistent 404, validation, and unexpected-error responses.

## 9. Database schema

SQLite is the current local MVP database. Prisma defines only these requested models:

| Model           | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `User`          | Seeded client/vendor identities and bcrypt password hashes |
| `Project`       | Project summary and status                                 |
| `ProjectMember` | User-to-project membership                                 |
| `Milestone`     | Project milestone and progress                             |
| `Task`          | Project work item with optional milestone                  |
| `Deliverable`   | Submission and approval state                              |
| `Document`      | File metadata placeholder                                  |
| `ClientRequest` | Client-to-vendor request                                   |

Simple enums cover role, project status/health, milestone status, task status/priority, submission
status, approval status, and request status.

The initial migration is committed. The idempotent seed recreates two users, four projects, eight
memberships, eight milestones, eight tasks, eight deliverables, and five client requests.

## 10. Implemented API endpoints

| Method | Endpoint                   | Behavior                                                                      |
| ------ | -------------------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/api/health`              | Confirms API and database connectivity                                        |
| `GET`  | `/api/projects`            | Returns all seeded projects                                                   |
| `GET`  | `/api/projects/:projectId` | Returns one project plus milestones, tasks, deliverables, and client requests |

Success responses use `{ "success": true, "data": ... }`. Errors use
`{ "success": false, "error": { "message": "..." } }`.

No authentication is required in this phase.

## 11. Authentication strategy for a later phase

Authentication is intentionally not implemented yet. The recommended MVP sequence is:

1. Add a login endpoint that verifies the seeded bcrypt hash.
2. Issue a short-lived JWT access token.
3. Store a rotating refresh token as a hashed database record and send its raw value only through a
   secure, HTTP-only cookie.
4. Add refresh and logout endpoints.
5. Replace the permissive frontend session placeholder only after endpoint tests pass.

Do not place access or refresh tokens in `localStorage`.

## 12. Role and permission strategy for a later phase

Use two roles initially: `CLIENT` and `VENDOR`. Authentication middleware should identify the user;
project middleware should then require a matching `ProjectMember` row. Role checks alone are not
enough because both roles can belong to multiple organisations or projects.

The server must enforce membership for every project-scoped read or mutation before the frontend is
connected. Client/vendor-specific mutation rules can then be added endpoint by endpoint.

## 13. Document-storage strategy for a later phase

The current `Document` model stores metadata only, and no upload endpoint exists. A later phase can:

1. Add an object-storage adapter with an S3-compatible implementation.
2. Keep objects private and persist only opaque object keys, not public URLs.
3. Validate file type/size and project membership before issuing an upload.
4. Use short-lived presigned upload/download URLs.
5. Add malware scanning and immutable audit events before production use.

Local disk uploads and S3 integration are not part of this foundation.

## 14. Frontend integration sequence

1. Define shared response DTOs for the three project endpoints.
2. Add one small fetch client configured by a frontend API base URL.
3. Add React Query hooks for the project list and project detail.
4. Integrate `/client/projects` behind a temporary mock/API development switch.
5. Integrate the client project detail and verify empty/loading/error states.
6. Integrate equivalent vendor views.
7. Add authentication and membership enforcement before exposing any non-development deployment.
8. Add mutations one domain at a time; remove a mock dataset only after its replacement is tested.

## 15. Testing strategy

Current automated coverage:

- Frontend: five Vitest/React Testing Library route smoke tests.
- Backend: Supertest tests for health, project list, missing project, and unknown route.
- Static checks: separate ESLint and TypeScript checks for frontend and backend.
- Build checks: separate frontend and backend production builds.

Next-phase tests should add authenticated authorization matrices, invalid-token cases, project
membership isolation, API contract tests, query loading/error UI states, and database-isolated
mutation tests.

## 16. Technical debt

- Frontend login and protected routes remain simulations.
- Frontend aggregates can expose unscoped mock data across organisations.
- Mock mutations disappear on refresh.
- Upload dialogs do not persist files or all collected metadata.
- Frontend and Prisma data contracts can drift.
- Seed dates are fixed and some are already past due.
- The current API has no pagination, authentication, request logging, rate limiting, or project
  membership checks.
- SQLite is unsuitable for the expected multi-user production workload.
- Root and backend installs report high-severity dependency advisories. Exact advisories were not
  retrieved because registry audit access was not authorised in this environment.
- The Vite build reports upstream configuration warnings about redundant tsconfig paths and
  `inlineDynamicImports`; the build still succeeds.

## 17. Assumptions and blockers

Assumptions:

- Node.js 20+ and npm are the supported local toolchain.
- SQLite is acceptable for the internship/MVP foundation.
- `http://127.0.0.1:5173` is the default local frontend origin.
- Seeded credentials are development-only and will never be deployed unchanged.
- Existing frontend mock data remains until incremental API integration is requested.

Blockers:

- Dependency advisory details and safe upgrade recommendations require an authorised `npm audit`
  registry request.
- Production authentication, object storage, and hosting requirements have not been selected.
- The database is currently local SQLite; a production move to PostgreSQL will require a new
  migration and deployment decision.

## 18. Recommended implementation order after this phase

1. Review and resolve dependency advisories.
2. Add API DTOs, a frontend fetch client, and project React Query hooks.
3. Integrate read-only project lists/details while retaining mock fallback data.
4. Implement login, refresh, logout, and JWT verification.
5. Enforce project membership and client/vendor permissions.
6. Add project-domain mutations with validation and audit records.
7. Add private document storage.
8. Move to PostgreSQL and add deployment/observability controls when the MVP requires production
   hosting.

Stop here for the current phase: no frontend/API integration or additional product behavior is
authorised.
