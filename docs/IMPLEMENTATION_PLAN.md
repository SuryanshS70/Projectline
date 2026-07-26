# Projectline Implementation Plan

- **Last updated:** 2026-07-26
- **Current phase:** JWT authentication, project access, and read-only frontend integration
- **MVP stack:** React/TanStack Start; Node.js, Express, TypeScript, Prisma, and SQLite
- **Phase 3 status:** Complete

## 1. Current outcome

Projectline now supports an end-to-end authenticated project-viewing flow:

1. A seeded client or vendor signs in with email and password.
2. The backend verifies the bcrypt password and issues an eight-hour JWT.
3. The frontend stores the token locally and restores the session through `/api/auth/me`.
4. Protected routes allow only the portal matching the backend user role.
5. Project endpoints filter by `ProjectMember`.
6. Client and vendor project lists/details load read-only data through the API.

The existing frontend design and route paths are preserved. Document uploads, notifications,
activity, project updates, settings, dashboard aggregates, and project mutations are outside this
phase and continue to use mocks or simulations.

## 2. Frontend architecture

- **Framework:** TanStack Start with TanStack Router file-based routing
- **UI:** React 19, Tailwind CSS 4, shadcn-style components, and Radix UI
- **Language:** Strict TypeScript
- **Server data:** React Query for authenticated project list/detail reads
- **Authentication state:** Small external store using `useSyncExternalStore`
- **Token persistence:** Browser local storage for this internship MVP
- **API client:** One typed fetch client in `src/lib/api.ts`
- **Environment:** `VITE_API_URL`, defaulting to `http://localhost:3001`

The store tracks the current user, token-derived session state, authentication loading state, and
whether the user is authenticated. No Redux or additional state-management package was added.

## 3. Frontend routes and protection

| Route                         | Data source                                               | Access                                     |
| ----------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `/`                           | Auth store                                                | Redirects to login or the user's dashboard |
| `/login`                      | Auth API                                                  | Public                                     |
| `/client/dashboard`           | Mixed mocks/current user                                  | Client only                                |
| `/client/projects`            | Project API                                               | Client only                                |
| `/client/projects/:projectId` | Project API plus remaining document/update/activity mocks | Client only                                |
| `/client/documents`           | Mocks                                                     | Client only                                |
| `/client/notifications`       | Mocks                                                     | Client only                                |
| `/client/settings`            | Mocks                                                     | Client only                                |
| `/vendor/dashboard`           | Mixed mocks/current user                                  | Vendor only                                |
| `/vendor/projects`            | Project API                                               | Vendor only                                |
| `/vendor/projects/:projectId` | Project API plus remaining document/activity mocks        | Vendor only                                |
| `/vendor/documents`           | Mocks                                                     | Vendor only                                |
| `/vendor/notifications`       | Mocks                                                     | Vendor only                                |
| `/vendor/settings`            | Mocks                                                     | Vendor only                                |

Unauthenticated protected navigation redirects to `/login`. A client entering a vendor path is
redirected to `/client/dashboard`; a vendor entering a client path is redirected to
`/vendor/dashboard`.

Protected routes are client-rendered because this MVP stores the JWT in browser local storage.

## 4. Frontend authentication flow

- `src/lib/session.ts` reads, writes, and clears the access token.
- `src/lib/api.ts` sends JSON, adds the Bearer token, normalises API enum values, and throws
  consistent `ApiError` objects.
- `src/lib/auth.ts` performs login, session restoration, logout, and invalid-token cleanup.
- The pathless `_app` route awaits session restoration and enforces the portal role.
- The login page submits real credentials.
- Client/vendor demo buttons fill development credentials but do not choose a role.
- Sidebar and top-bar identity details come from `/api/auth/me`.
- A 401 response clears the frontend session; the protected layout redirects to login.

JWT storage is intentionally simple. A production deployment should use a more defensive token
strategy, but refresh tokens are not part of this MVP.

## 5. Current backend structure

```text
server/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  src/
    config/env.ts
    db/prisma.ts
    middleware/
      authenticate.ts
      error-handler.ts
      not-found.ts
    routes/
      auth.ts
      health.ts
      projects.ts
    types/express.d.ts
    app.ts
    auth.ts
    server.ts
  test/api.test.ts
```

The implementation remains deliberately small: route handlers use Prisma directly where there is
no reusable business logic.

## 6. Authentication API

| Method | Endpoint           | Access       | Behavior                                                           |
| ------ | ------------------ | ------------ | ------------------------------------------------------------------ |
| `POST` | `/api/auth/login`  | Public       | Verifies email/bcrypt password and returns JWT plus safe user data |
| `GET`  | `/api/auth/me`     | Bearer token | Returns ID, name, email, role, and organisation name               |
| `POST` | `/api/auth/logout` | Bearer token | Acknowledges stateless logout                                      |

Tokens:

- use HS256;
- store the user ID in the JWT subject;
- expire after eight hours;
- are verified against `JWT_SECRET`;
- are accepted only from `Authorization: Bearer <token>`.

No password hash is returned. Invalid credentials use the same message for unknown email and wrong
password.

Logout does not revoke an already issued token. The browser removes it locally; no blacklist,
refresh-token table, or Redis dependency exists.

## 7. Project access control

Both project endpoints require authentication:

| Method | Endpoint                   | Behavior                                                      |
| ------ | -------------------------- | ------------------------------------------------------------- |
| `GET`  | `/api/projects`            | Returns projects with a membership for the authenticated user |
| `GET`  | `/api/projects/:projectId` | Returns one assigned project and its requested relations      |

Prisma filters through `Project.members.some.userId`. Project detail returns 404 for both missing
and unassigned IDs so inaccessible project existence is not disclosed.

The seed now creates these memberships:

- Client Ava: Customer Portal Redesign and ERP Data Migration
- Vendor Jamal: Customer Portal Redesign and Mobile Application Development

## 8. Project API data

Project summaries include:

- ID, name, description;
- status, health, and completion percentage;
- start/end dates;
- client and vendor names.

Project detail additionally includes Prisma relations for:

- milestones;
- tasks;
- deliverables;
- client requests.

The frontend API client maps Prisma's uppercase enum values to the existing lowercase UI status
contracts. No generated SDK or large DTO layer was introduced.

## 9. Project frontend integration

API-backed routes no longer import project, milestone, task, deliverable, or client-request mock
modules.

Project lists preserve the existing card grid, badges, progress bars, dates, and organisation
labels. Project details preserve the tab layout. The following tabs use API relations:

- Overview
- Milestones
- Tasks (vendor)
- Deliverables
- Client requests (vendor)

Task, deliverable, and request controls are read-only. The Documents, Updates, and Activity tabs
continue to use their existing mocks.

Loading uses `ListSkeleton`. Empty and API error cases use `EmptyState`. A project 404 is described
as missing or not assigned.

## 10. Database schema

No Phase 3 schema migration was required. The current Prisma models remain:

- `User`
- `Project`
- `ProjectMember`
- `Milestone`
- `Task`
- `Deliverable`
- `Document`
- `ClientRequest`

The existing migration remains valid. Only seed membership records changed.

## 11. Testing status

Backend tests: 13 focused Supertest cases covering:

- health;
- correct login;
- wrong password and unknown email;
- missing, valid, and invalid authentication;
- protected project listing;
- client/vendor membership filtering;
- unassigned project denial;
- assigned project detail relations;
- unknown API routes.

Frontend tests: 11 Vitest/React Testing Library cases covering:

- root, login, and not-found rendering;
- valid client and vendor login redirects;
- invalid-login feedback;
- unauthenticated route protection;
- client/vendor wrong-portal redirects;
- API-backed project list;
- API-backed project detail.

Manual browser verification also covers both login flows, assigned lists, detail views, wrong-portal
redirects, logout, and browser-console errors.

## 12. Remaining mock data

Keep the files under `src/data/`. They are still used by:

- client/vendor dashboard project summaries and metrics;
- documents and uploads;
- notifications;
- activity feeds;
- project updates;
- settings;
- document/update/activity tabs inside project detail.

Mock project-domain imports were removed only from the four API-backed project routes and the shared
relation components they render.

## 13. Technical debt and MVP limitations

- Local-storage JWTs are accessible to browser JavaScript.
- There are no refresh tokens or server-side token revocation.
- Protected rendering is client-side rather than cookie-aware SSR.
- Project endpoints are read-only and unpaginated.
- Dashboard aggregates can differ from API membership/data.
- Settings still display mock profile fields.
- Documents, notifications, activity, and uploads are not persisted.
- SQLite is for local MVP use.
- Dependency installs continue to report high-severity advisories.
- The Vite build has non-fatal upstream configuration warnings.

## 14. Recommended next MVP work

Only proceed when explicitly requested:

1. Resolve dependency advisories.
2. Replace dashboard project summaries/metrics with the existing authenticated project queries.
3. Connect settings to the current user where useful.
4. Add the minimum required project mutations with membership checks.
5. Add document upload/storage in its own phase.
6. Connect notifications/activity only when backend models and endpoints are required.

Do not add refresh-token rotation, Redis, S3, complex RBAC, or speculative enterprise
infrastructure for this internship MVP.
