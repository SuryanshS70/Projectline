# Changelog

All notable Projectline changes should be documented in this file. This changelog covers Codex-led
repository work and does not replace Git history or Lovable's project history.

## 2026-07-26 - Basic mutations, local documents, and final MVP integration

### Added

- Added authenticated, membership-filtered task and milestone PATCH endpoints.
- Added direct deliverable ready/submission/approval/change-request actions with role checks.
- Added client-request list/create/update endpoints and the `COMPLETED` request status.
- Added Multer-backed local document upload with generated filenames, allowed-type validation, and
  a 10 MB limit.
- Added authenticated document list, download, and permanent delete endpoints.
- Added `GET /api/dashboard` with client/vendor metrics, assigned projects, milestones, and latest
  documents.
- Added a shared API-backed document repository for both portals.
- Added six focused frontend tests and 25 focused backend tests.

### Changed

- Connected task status, milestone progress/status, deliverable actions, and client requests to the
  API.
- Added a client-request tab to client project detail.
- Replaced simulated uploads in project tabs and both document repositories.
- Replaced dashboard metrics, project panels, milestones, and latest documents with backend data.
- Added a shared, unsubmitted portal deliverable to the seed for the vendor/client review demo.
- Removed document version, visibility, approval, simulated preview, and simulated upload controls
  that were not persisted.
- Updated README, implementation plan, and handoff documentation for the completed MVP.

### Fixed

- Downgraded the root ESLint development dependency from 10 to 9.39.5 so a clean `npm install`
  satisfies `eslint-plugin-react-hooks` without legacy peer-resolution flags.

### Preserved

- Existing Express/TypeScript/Prisma/SQLite/JWT stack.
- Existing route paths, visual system, project cards, tabs, tables, badges, and layout.
- Mock notifications, activity feeds, project updates, settings, and advanced reporting.

### Validation

- Backend suite: 38 tests passing.
- Frontend suite: 17 tests passing.
- Prisma schema is valid and SQLite reports no pending schema migration.
- Multer installation reports the existing eight high-severity backend advisories.

## 2026-07-26 - Authentication, project access, and frontend integration

### Added

- Added bcrypt-backed `POST /api/auth/login`, authenticated `GET /api/auth/me`, and stateless
  `POST /api/auth/logout`.
- Added eight-hour HS256 JWT access tokens and small Bearer-token authentication middleware.
- Added safe current-user response types; password hashes are never returned.
- Added a typed frontend API client configured by `VITE_API_URL`.
- Added a small external authentication store with login, local JWT persistence, session
  restoration, invalid-token cleanup, and logout.
- Added client/vendor protected-route redirects based on the authenticated backend role.
- Added React Query loading for client/vendor project lists and project detail.
- Added frontend loading, empty, API-unavailable, and missing/unassigned project states.
- Added nine backend authentication/access tests, bringing the backend suite to 13 tests.
- Added eight frontend authentication/project-integration tests, bringing the frontend suite to 11
  tests.
- Added a root `.env.example` for the frontend API URL.

### Changed

- Protected both project endpoints and filtered them through `ProjectMember`.
- Standardised project-detail denial on 404 for both missing and unassigned IDs.
- Changed seed memberships so the client and vendor each receive two appropriate projects.
- Replaced project-domain mock imports in the four client/vendor project list/detail routes.
- Updated project overview, milestone, task, deliverable, and client-request components to render
  read-only API data.
- Updated sidebar/top-bar identity details to use the authenticated user.
- Changed login demo buttons to fill credentials instead of simulating role selection.
- Removed the simulated sidebar role switch.
- Updated README, implementation plan, and handoff documentation for the Phase 3 flow.

### Preserved

- Existing visual design, route paths, cards, tabs, badges, and progress displays.
- Mock-driven dashboards, documents, uploads, notifications, activity, updates, and settings.
- Existing Prisma models and initial migration; no schema change was required.

### Validation

- Backend lint, typecheck, build, and 13 tests pass.
- Frontend lint, typecheck, build, and 11 tests pass.
- Prisma migration remains in sync and the updated seed succeeds.
- Manual browser verification passed for client/vendor login, assigned project lists, project
  detail, wrong-portal redirects, and logout with no browser console errors.
- Backend installation continues to report eight high-severity dependency advisories.

## 2026-07-26 - Frontend fixes and simple backend foundation

### Added

- Added npm scripts for frontend type checking, formatting, and Vitest execution.
- Added five React Testing Library route smoke tests covering the entry route, login, client
  dashboard, vendor dashboard, and unknown routes.
- Added a separate `server/` Express and TypeScript package with Zod environment validation, CORS,
  JSON middleware, consistent error responses, and graceful process shutdown.
- Added a Prisma SQLite schema for `User`, `Project`, `ProjectMember`, `Milestone`, `Task`,
  `Deliverable`, `Document`, and `ClientRequest`.
- Added and applied the initial database migration.
- Added a repeatable seed with two bcrypt-hashed development users, four projects, memberships,
  milestones, tasks, deliverables, and client requests.
- Added `GET /api/health`, `GET /api/projects`, and `GET /api/projects/:projectId`.
- Added four Supertest API tests covering health, project listing, a missing project, and an unknown
  route.
- Added backend development, build, start, typecheck, lint, test, migration, and seed scripts.
- Replaced the generic Lovable README with local frontend/backend setup and limitation notes.

### Fixed

- Removed the unused `@hookform/resolvers` dependency that prevented a normal npm install.
- Configured the frontend development script to use port 5173 directly, avoiding npm 11's
  forwarding of Vite flags as npm configuration.
- Fixed the `DeliverableStatus` formatting error.
- Removed React Fast Refresh lint warnings by separating reusable variant definitions from React
  component exports and keeping internal hooks private.
- Prevented the frontend Vitest configuration from collecting backend API tests.

### Changed

- Standardised the repository on npm with root and backend lockfiles; removed stale Bun package
  manager files.
- Updated `docs/IMPLEMENTATION_PLAN.md` from the earlier enterprise recommendation to the current
  Express/SQLite MVP foundation and incremental next-phase sequence.
- Updated `docs/CODEX_HANDOFF.md` to describe the implemented backend and explicitly record that the
  frontend still uses mock data.
- Preserved all existing frontend routes, visual design, mock data, and simulated product
  interactions.

### Validation and known issues

- Frontend lint, typecheck, five tests, and production build pass.
- Backend lint, typecheck, four API tests, and TypeScript production build pass.
- The migration and seed complete successfully against local SQLite.
- Root installation reports five high-severity advisories; backend installation reports eight.
  Advisory details remain unknown because the environment did not authorise the external registry
  audit request.
- The frontend production build retains non-fatal warnings from the upstream Lovable/Vite
  configuration.

## 2026-07-26 - Repository audit and implementation planning

### Added

- Added `docs/IMPLEMENTATION_PLAN.md` with:
  - current frontend architecture and complete route inventory;
  - existing TypeScript models, mock-data locations, and state-management approach;
  - repository validation results and identified frontend/tooling debt;
  - recommended NestJS, PostgreSQL, Prisma, JWT/refresh-token, RBAC, and S3 architecture;
  - proposed backend folder structure and database schema;
  - required REST endpoints, authentication, permissions, and document-storage strategies;
  - frontend integration and testing sequences;
  - assumptions, blockers, commands run, and recommended implementation order.

### Audit findings

- Confirmed all declared routes respond under the Vite development server.
- Confirmed TypeScript checking and the production build pass.
- Recorded the current lint failure: one Prettier error and six Fast Refresh warnings.
- Recorded npm's strict peer-resolution failure and the successful legacy-peer dependency install.
- Recorded five high-severity vulnerability notices reported during installation; advisory details
  remain pending an approved registry audit.
- Verified mock-data foreign-key references and found no missing references or duplicate IDs.
- Recorded stale milestone, task, deliverable, and project dates.
- Documented missing authentication/tenant enforcement, unscoped aggregate mock data, non-persistent
  mutations, and incomplete upload simulations.

### Changed

- Documentation only. No frontend behavior, route, interface, mock data, dependency, or backend code
  was changed.
