# Codex Handoff — Projectline

**Last updated:** 2026-07-26

Read this file completely before continuing. Projectline is connected to Lovable; do not rewrite
published Git history or force-push.

## Current implementation

Phase 3 is complete. Projectline now has:

- real email/password login against seeded bcrypt hashes;
- eight-hour HS256 JWT access tokens;
- `/api/auth/login`, `/api/auth/me`, and `/api/auth/logout`;
- Bearer-token middleware;
- client/vendor frontend route protection;
- project membership enforcement;
- API-backed client/vendor project lists and project detail;
- frontend session restoration and logout;
- focused backend and frontend tests.

The implementation intentionally has no refresh tokens, token blacklist, Redis, S3, complex RBAC,
document upload backend, project mutations, or real-time features.

## Run locally

Frontend:

```sh
npm install
```

Optionally copy the root `.env.example` to `.env.local`:

```env
VITE_API_URL=http://localhost:3001
```

Start:

```sh
npm run dev
```

Frontend URL: `http://localhost:5173`

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

API URL: `http://localhost:3001`

Development credentials:

```text
client@example.com / password123
vendor@example.com / password123
```

## Authentication design

`server/src/routes/auth.ts` verifies credentials with bcrypt and returns a token plus:

```text
id
name
email
role
organisationName
```

Password hashes are never returned. Tokens use HS256, the user ID JWT subject, `JWT_SECRET`, and an
eight-hour expiry.

`server/src/middleware/authenticate.ts`:

1. reads `Authorization: Bearer <token>`;
2. verifies the signature and expiry;
3. loads the current user;
4. attaches safe user data to `request.user`;
5. returns 401 on failure.

Logout is stateless. The endpoint acknowledges the request and the frontend deletes its local JWT.
Previously issued tokens are not revoked server-side.

Frontend token/session code:

- `src/lib/session.ts`
- `src/lib/api.ts`
- `src/lib/auth.ts`

Local-storage JWT persistence is an explicit internship-MVP compromise.

## Route protection

The pathless `src/routes/_app.tsx` layout restores the session before rendering.

- Unauthenticated users go to `/login`.
- `CLIENT` users may use `/client/*`.
- `VENDOR` users may use `/vendor/*`.
- Wrong-portal navigation redirects to the user's own dashboard.
- The sidebar role switch was removed.
- Demo login buttons fill credentials; they cannot choose a database role.

## Project access

`GET /api/projects` and `GET /api/projects/:projectId` require authentication and filter through
`ProjectMember`.

Project detail returns 404 for both unassigned and nonexistent IDs.

Current seed memberships:

```text
client@example.com
  prj-portal
  prj-erp

vendor@example.com
  prj-portal
  prj-mobile
```

## Frontend data sources

API-backed:

- login/current user;
- portal role protection;
- `/client/projects`;
- `/client/projects/:projectId`;
- `/vendor/projects`;
- `/vendor/projects/:projectId`;
- overview, milestones, tasks, deliverables, and client-request data inside those details.

Still mock-driven:

- dashboard project panels/metrics;
- documents and uploads;
- notifications;
- activity and updates;
- settings;
- document/update/activity project tabs.

Do not delete `src/data/`; active screens still depend on it.

## Project UI behavior

React Query loads project lists and details. Query keys include the authenticated user ID to avoid
cross-account cache reuse.

`src/lib/api.ts` converts Prisma uppercase enum strings to the existing lowercase UI status values.
Project task, deliverable, and client-request displays are read-only.

Loading uses `ListSkeleton`; errors and empty results use `EmptyState`.

## Validation baseline

Frontend:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Current frontend baseline: 11 passing tests.

Backend:

```sh
cd server
npm run lint
npm run typecheck
npm run test
npm run build
```

Current backend baseline: 13 passing tests.

The existing Prisma migration remains valid. Run `npm run prisma:seed` after pulling this phase so
the updated membership set replaces Phase 2's all-project memberships.

## Known limitations

- JWTs are stored in local storage.
- No refresh tokens or server-side logout revocation exist.
- Authentication-aware SSR is not implemented.
- Projects are read-only.
- Dashboard project summaries still use mocks.
- Documents, uploads, notifications, activity, and settings remain mock-driven.
- SQLite is for local MVP development.
- High-severity dependency advisories remain unresolved.

## Next work

Only continue when requested. The smallest useful next phase would connect dashboard project
summaries to the existing authenticated queries, then add explicitly required mutations or document
uploads one domain at a time.

Do not add enterprise infrastructure or unrelated frontend features.
