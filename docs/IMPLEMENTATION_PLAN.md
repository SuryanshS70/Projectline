# Projectline Repository Audit and Implementation Plan

- **Audit date:** 2026-07-26
- **Scope:** Existing frontend prototype and recommended backend/integration plan only
- **Implementation status:** No backend or frontend behavior was implemented during this audit

## 1. Executive summary

Projectline is a TanStack Start, React 19, TypeScript, Tailwind CSS, and shadcn/Radix frontend
prototype. It has separate client and vendor route trees, a shared responsive application shell,
shared project-domain components, and in-memory mock data under `src/data/`.

The prototype compiles and its production build succeeds. All declared routes responded when
served by the development server. TypeScript checking passes. Linting does not pass because of one
Prettier error in `src/data/types.ts`; ESLint also reports six non-blocking Fast Refresh warnings in
shared UI primitive files.

The application has no API client, database, persistent domain state, real authentication,
server-enforced tenant boundaries, or object storage. The `QueryClient` is configured but unused by
domain screens. Most mutations are local `useState` changes or toast-only simulations.

The most important pre-backend risks are:

1. Protected routes are publicly reachable, role is inferred from the URL, and project-detail
   loaders do not validate organisation membership.
2. Several dashboards, notification feeds, and the client document repository read unscoped global
   arrays, which mixes mock records belonging to different organisations.
3. Upload controls collect visibility and version information but do not pass those values to
   consumers; repository-level upload dialogs do not add uploaded documents to their lists.
4. The mock dates are stale as of the audit date, so dashboards understate overdue work.
5. Dependency installation is not reproducible in the current environment: the repository tracks a
   Bun lockfile, Bun is unavailable, and a normal npm install fails peer dependency resolution.

The recommended backend is a separate NestJS application using Node.js, PostgreSQL, Prisma, short
lived JWT access tokens, rotating refresh tokens, centralised RBAC plus tenant/resource checks, and
private S3-compatible object storage. The frontend should be integrated domain by domain while the
mock data remains available as a development fallback until each domain is complete.

## 2. Audit scope and repository inventory

The audit covered:

- Repository configuration, Lovable metadata, README, Bun lockfile metadata, and the complete
  `docs/CODEX_HANDOFF.md`.
- TanStack Start entry points, generated route tree, root shell, route layouts, and all client and
  vendor route modules.
- All domain interfaces and mock-data modules.
- Layout, common, project, and shadcn/Radix UI components.
- Navigation configuration, demo session storage, route placeholders, and role selection.
- Upload, preview, download, delete, notification, settings, deliverable, request, and task
  simulations.
- Error middleware, SSR error handling, styling, lint, TypeScript, Vite, and build configuration.
- Development-server route responses, dependency installation, type checking, linting, and the
  production build.

The repository contained 104 tracked files at the start of the audit. `docs/IMPLEMENTATION_PLAN.md`
and `docs/CHANGELOG.md` did not previously exist. Generated dependencies and build outputs are not
part of the final documentation-only change.

## 3. Current frontend architecture

### 3.1 Runtime and framework

- **Framework:** TanStack Start with TanStack Router file-based routing.
- **UI:** React 19, Tailwind CSS 4, shadcn-style components backed by Radix UI.
- **Bundler:** Vite through `@lovable.dev/vite-tanstack-config`.
- **SSR/deployment target:** Nitro, currently defaulting to a Cloudflare module build.
- **Language:** TypeScript with `strict: true` and `noEmit: true`.
- **Server entry:** `src/server.ts` wraps the TanStack Start server entry and normalises catastrophic
  SSR errors.
- **Request middleware:** `src/start.ts` adds an error middleware and restores TanStack Start CSRF
  middleware for server functions.
- **Data fetching:** `QueryClient` and `QueryClientProvider` are configured in `src/router.tsx` and
  `src/routes/__root.tsx`, but no domain component currently uses React Query.
- **Notifications:** `sonner` toasts mounted at the root.
- **Styling:** global Tailwind theme tokens in `src/styles.css`; the product screens use a light,
  slate-based visual system.

### 3.2 Application composition

```text
src/routes/__root.tsx
  QueryClientProvider
  global metadata, styles, error and not-found UI
  Outlet
  Toaster
    |
    +-- /login
    |
    +-- src/routes/_app.tsx (pathless layout)
          derives coarse role from the URL
          AppShell
            Sidebar
            Topbar
            Outlet
              client screens
              vendor screens
```

`AppShell`, `Sidebar`, and `Topbar` are shared by both portals. Project workspaces compose common
components such as `ProjectOverview`, `MilestonesList`, `DeliverablesList`, `ProjectDocuments`, and
`ProjectActivity`, with role-specific tabs passed through props rather than duplicated page
implementations.

### 3.3 Shared component groups

- `src/components/layout/`: responsive application shell, desktop/mobile navigation, top bar.
- `src/components/common/`: headers, metrics, badges, progress, user/file presentation, filters,
  tabs, tables, activity, empty/loading states, and upload simulation.
- `src/components/project/`: project overview, milestones, tasks, deliverables, documents, updates,
  activity, and client requests.
- `src/components/ui/`: shadcn/Radix primitives. Many scaffolded primitives are currently unused by
  the product UI and should not be removed as part of backend work.

### 3.4 Error handling

- Root route error and 404 components provide generic recovery UI.
- `src/lib/lovable-error-reporting.ts` forwards browser errors to Lovable editor hooks when present.
- `src/lib/error-capture.ts` captures server errors and preserves cause chains.
- There is no domain/API error shape, retry policy, or central authentication refresh handling yet.

## 4. Existing routes

TanStack Router is the routing framework. It must not be replaced with React Router.

| URL                           | Route file                                       | Current behavior                                                                                             |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `/`                           | `src/routes/index.tsx`                           | Redirects to `/login`.                                                                                       |
| `/login`                      | `src/routes/login.tsx`                           | Visual email/password form and two demo-role buttons. Normal form submission always selects the client demo. |
| `/client/dashboard`           | `src/routes/_app/client/dashboard.tsx`           | Client summary, project list, activity, deadlines, and documents from mock arrays.                           |
| `/client/projects`            | `src/routes/_app/client/projects/index.tsx`      | Projects filtered to the demo client's organisation.                                                         |
| `/client/projects/:projectId` | `src/routes/_app/client/projects/$projectId.tsx` | Project tabs; checks only that an ID exists, not that the current organisation may view it.                  |
| `/client/documents`           | `src/routes/_app/client/documents.tsx`           | Search/filter/sort/view controls and simulated preview/upload.                                               |
| `/client/notifications`       | `src/routes/_app/client/notifications.tsx`       | Role-wide notification groups and local read state.                                                          |
| `/client/settings`            | `src/routes/_app/client/settings.tsx`            | Uncontrolled profile inputs, preference switches, toast-only save.                                           |
| `/vendor/dashboard`           | `src/routes/_app/vendor/dashboard.tsx`           | Vendor metrics, assignments, activity, and milestones from mock arrays.                                      |
| `/vendor/projects`            | `src/routes/_app/vendor/projects/index.tsx`      | Projects filtered to the demo vendor's organisation.                                                         |
| `/vendor/projects/:projectId` | `src/routes/_app/vendor/projects/$projectId.tsx` | Vendor workspace; checks only that an ID exists.                                                             |
| `/vendor/documents`           | `src/routes/_app/vendor/documents.tsx`           | Vendor-project document filtering and simulated actions.                                                     |
| `/vendor/notifications`       | `src/routes/_app/vendor/notifications.tsx`       | Role-wide notification groups and local read state.                                                          |
| `/vendor/settings`            | `src/routes/_app/vendor/settings.tsx`            | Reuses the client settings component with the vendor demo user.                                              |

Development-server smoke testing returned:

- `307` for `/`, as expected for the login redirect.
- `200` for every declared client and vendor route above, including representative dynamic project
  routes.
- `404` for an unknown route.

No declared route was broken at the HTTP/SSR smoke-test level. Route access control is incomplete,
however, and is a critical integration requirement.

## 5. Existing data models

All current frontend contracts are in `src/data/types.ts`.

| Interface/type       | Current important fields                                                         | Backend compatibility notes                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Role`               | `"client" \| "vendor"`                                                           | Portal mode only; not sufficient for the required six-role RBAC model.                                                                                             |
| `Organisation`       | `id`, `name`, `type`, `industry`                                                 | Add timestamps/status; use memberships rather than a single user role.                                                                                             |
| `User`               | `id`, `name`, `email`, `role`, `organisationId`, `title`, `avatarUrl?`           | API can initially project a primary membership into this shape. Never return password fields.                                                                      |
| `Project`            | org IDs, status, completion, dates, contacts, phase, risk, budget, health, notes | `budget` is display text and should become amount/currency in storage. `nextMilestone` is denormalised text. Clarify whether notes are client-visible or internal. |
| `Milestone`          | project, owner, due date, status, progress, `dependencies[]`                     | Use a milestone dependency join table instead of a database array.                                                                                                 |
| `Task`               | project, optional milestone, assignee, priority, due date, status                | Add timestamps and optimistic-concurrency/version metadata.                                                                                                        |
| `Deliverable`        | project, due date, submission status, approval status, version, feedback         | `approvalStatus` currently mixes work and review lifecycle states; define an explicit state machine before migration.                                              |
| `DocumentRecord`     | project, name/type/size, uploader/date, version, category, approval, visibility  | Split document identity from immutable document versions and storage objects.                                                                                      |
| `ProjectUpdate`      | project, content, author, status, attachment flag                                | Replace attachment boolean with actual document/version relationships.                                                                                             |
| `ActivityEntry`      | project, kind, actor, summary, created date                                      | Add structured `metadata`, request ID, and immutable audit semantics.                                                                                              |
| `NotificationRecord` | kind, body, read, optional project, `audience: Role`                             | Persist per user, not per coarse portal role. Add read timestamp and delivery state.                                                                               |
| `ClientRequest`      | project, requester, priority, dates, status, optional milestone                  | Add timestamps, assignee/response fields, and optional document links.                                                                                             |

Models required by the handoff but absent from the frontend contracts include organisation
memberships, project memberships, document versions, refresh sessions, invitations, comments,
notification preferences, password reset tokens, and upload intents.

### 5.1 Mock data volume and integrity

| Entity           | Count |
| ---------------- | ----: |
| Organisations    |     4 |
| Users            |     8 |
| Projects         |     4 |
| Milestones       |    19 |
| Tasks            |    13 |
| Deliverables     |     9 |
| Documents        |    12 |
| Project updates  |     7 |
| Activity entries |    15 |
| Notifications    |    10 |
| Client requests  |     5 |

An automated referential-integrity pass found no duplicate IDs, missing referenced organisations,
projects, users, milestones, or cross-project milestone dependencies.

The time-based data is stale as of 2026-07-26:

- 7 non-completed milestones have past due dates.
- 12 non-completed tasks have past due dates.
- 6 non-approved deliverables have past due dates.
- `prj-cloud` is still `on_track` although its expected end date was 2026-07-15.

These are mock-data consistency findings only; the mock files were intentionally not changed.

## 6. Mock-data locations

| File                         | Purpose                                    | Main consumers                                                           |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `src/data/types.ts`          | Shared frontend domain contracts           | All data and domain components                                           |
| `src/data/organisations.ts`  | Client/vendor organisations and lookup     | Shell, settings, projects, dashboards                                    |
| `src/data/users.ts`          | Users, lookups, `demoClient`, `demoVendor` | Session, shell, project components                                       |
| `src/data/projects.ts`       | Four projects and org helper selectors     | Dashboards, lists, detail loaders                                        |
| `src/data/milestones.ts`     | Milestones and project selector            | Dashboards, project tabs, task board                                     |
| `src/data/tasks.ts`          | Vendor task records                        | Vendor dashboard and task board                                          |
| `src/data/deliverables.ts`   | Deliverables and project selector          | Dashboards and project tabs                                              |
| `src/data/documents.ts`      | Documents, visibility, approval            | Dashboards, repositories, project tabs                                   |
| `src/data/updates.ts`        | Project update feed                        | Client project updates tab                                               |
| `src/data/activity.ts`       | Activity feed and recent activity helper   | Both dashboards and project activity                                     |
| `src/data/notifications.ts`  | Role-audience notification records         | Top bar and notification screens                                         |
| `src/data/clientRequests.ts` | Client-to-vendor requests                  | Vendor project requests tab                                              |
| `src/data/index.ts`          | Barrel exports                             | Available for future adapters; most screens import domain files directly |

Mock data should remain in place until the corresponding API domain passes integration tests. It
should eventually be placed behind typed repository/query adapters so switching between mock and
API sources does not require page-level rewrites.

## 7. Current state-management approach

- Domain data is imported as module-level arrays.
- View state, filters, dialogs, notifications, task transitions, and temporary uploaded documents
  use component-local `useState`.
- Derived lists use `useMemo` in some screens.
- Demo session state is serialised to `localStorage` by `src/lib/session.ts`.
- No context owns authenticated user state.
- No global domain store is present.
- React Query is provided at the root but is not used for loaders, queries, mutations, caching,
  invalidation, or optimistic updates.
- No state is synchronised between the top bar and page-local notification state. Marking a
  notification read does not update the static unread badge in `Topbar`.

Recommended direction: use TanStack Query for server state and a small authentication provider for
session/bootstrap state. Continue using component-local state for transient UI state. A separate
client state library is not currently necessary.

## 8. Existing errors, incomplete behavior, and technical debt

### 8.1 Critical before production integration

1. **No authentication guard.** `src/routes/_app.tsx` allows direct navigation to every client and
   vendor URL. It does not call `getSession()`.
2. **Role comes from the URL.** A user can select either portal by changing the path. UI role is not
   an authorisation decision.
3. **No project ownership check.** Both dynamic project loaders call only `getProjectById()`. For
   example, a client from `org-c1` can open an `org-c2` project ID, and the equivalent issue exists
   across vendor organisations.
4. **Cross-organisation aggregate data.**
   - Client pending approvals, deadlines, latest documents, activity, document filters, and
     notifications are not consistently scoped to `demoClient.organisationId`.
   - Client documents show every `client_visible` document, including records for the other client
     organisation.
   - Vendor task/deliverable metrics, upcoming milestones, activity, and notifications are not
     consistently scoped to `demoVendor.organisationId`.
   - `recentActivity()` uses the same four-project list for both roles.
5. **Potential note visibility ambiguity.** The same `project.notes` value is labelled "Internal
   notes" for vendors and "Important notes" for clients. The backend contract needs separate,
   explicit visibility semantics.

These issues are acceptable only in a non-production mock prototype. Backend checks must be the
source of truth; hiding UI elements is not sufficient.

### 8.2 Incomplete simulations

1. The main login form accepts any values and always selects the client demo. "Forgot password" has
   no action.
2. `getSession()` casts unvalidated local storage JSON. `currentUser()` ignores the stored `userId`
   and chooses a hard-coded demo user from the stored coarse role.
3. The top-bar search input is inert.
4. Profile fields and notification switches are not submitted or persisted.
5. Deliverable upload, submit, review, and download controls show toasts but do not change state.
6. Client-request response, document download, and most preview/version actions are toast-only.
7. Vendor document "Version history" displays a "Replaced version" toast rather than history.
8. Vendor document delete shows success but does not remove a row.
9. Notification changes are page-local and reset on refresh.
10. Task changes are page-local and reset on refresh; unchecking a completed task always changes it
    to `in_progress`, not its previous status.
11. Project tabs are local UI state and are not represented in the URL, so a selected tab cannot be
    deep-linked or restored.

### 8.3 Upload-specific findings

1. `UploadZone` simulates progress with `setInterval`; there is no server, storage, checksum, MIME,
   size, or malware validation.
2. The selected `visibility` is never included in `onUploaded`.
3. The visible version input is uncontrolled and never included in `onUploaded`.
4. File extensions are cast to `DocumentType` without an allow-list.
5. Removing an uploading item does not cancel its interval or prevent its completion callback.
6. Intervals are not cleaned up when the component unmounts.
7. The client and vendor repository dialogs provide no `onUploaded` callback, so successful
   simulated uploads do not appear in those document lists.
8. `ProjectDocuments` hard-codes every added document to `client_visible`, hard-codes uploader IDs,
   and starts every version at 1.

### 8.4 Data and presentation inconsistencies

1. Mock dates no longer match "due this week", "upcoming", or "on track" labels as of the audit.
2. Client project detail describes a project as `Delivered by ${project.currentPhase}`; the value is
   a phase, not a vendor.
3. `Deliverable.approvalStatus` represents both production progress and approval results, while
   `submissionStatus` overlaps it.
4. `Project.budget` is formatted text, which cannot support calculations, currency validation, or
   reliable sorting.
5. Notifications target a coarse role rather than a user or organisation membership.
6. User roles are only `client` or `vendor`, while the required permission model has
   `client_admin`, `client_member`, `vendor_admin`, `vendor_pm`, `vendor_member`, and
   `system_admin`.

### 8.5 Tooling and dependency findings

1. The repository tracks `bun.lock`, but Bun is unavailable in the audit environment and README
   instructions use npm.
2. Normal `npm install` fails with `ERESOLVE` around `@hookform/resolvers`, `@typeschema/valibot`,
   and incompatible Valibot peer ranges.
3. `npm install --legacy-peer-deps` succeeds but bypasses strict peer resolution and resolves from
   package ranges rather than the tracked Bun lockfile.
4. Installation reported 5 high-severity vulnerabilities. Advisory details could not be retrieved
   because the registry audit request was not permitted to send the dependency tree externally.
5. Installation warns that `recharts@2.15.4` is on an inactive major line and that
   `tsconfck@3.1.6` is deprecated.
6. There is no `typecheck` script and no test script in `package.json`.
7. Lint fails on the formatting of `DeliverableStatus` in `src/data/types.ts`.
8. Six `react-refresh/only-export-components` warnings exist in UI primitive files.
9. Build warnings report a now-redundant `vite-tsconfig-paths` plugin and an ignored
   `inlineDynamicImports` option. Because Lovable owns the Vite wrapper, these should be addressed
   through an approved Lovable configuration update rather than by duplicating plugins.
10. Many scaffolded UI primitives and several direct dependencies are unused by product screens.
    Avoid cleanup until after backend integration to prevent unrelated frontend churn.

## 9. Recommended backend architecture

Use **NestJS** rather than unstructured Express for the first implementation. The required
authentication, refresh-token rotation, RBAC, tenant scoping, validation, uploads, background jobs,
and audit logging benefit from modules, guards, interceptors, dependency injection, and testable
service boundaries.

Recommended stack:

- Node.js 20+; align local development and deployment on one supported LTS release.
- NestJS REST API.
- PostgreSQL 15+.
- Prisma ORM and migration tooling.
- JWT access tokens plus rotating opaque refresh tokens.
- Private S3-compatible storage such as AWS S3, Cloudflare R2, or MinIO.
- Redis and BullMQ for virus scanning, thumbnail/preview jobs, and notification fanout.
- OpenAPI generated from DTOs.
- Structured JSON logs with request IDs; add OpenTelemetry before production.

Keep the backend deployable independently from the existing Lovable frontend.

## 10. Recommended backend folder structure

Do not move or rewrite the existing `src/` frontend. Add the backend as a sibling package:

```text
backend/
  package.json
  tsconfig.json
  nest-cli.json
  .env.example
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    main.ts
    app.module.ts
    config/
      configuration.ts
      env.schema.ts
    common/
      auth/
        current-user.decorator.ts
        jwt-auth.guard.ts
        permissions.guard.ts
        project-access.guard.ts
      decorators/
      errors/
      filters/
      interceptors/
      logging/
      pagination/
      validation/
    database/
      database.module.ts
      prisma.service.ts
      transaction.service.ts
    modules/
      auth/
      users/
      organisations/
      projects/
      memberships/
      milestones/
      tasks/
      deliverables/
      documents/
      uploads/
      client-requests/
      updates/
      comments/
      activity/
      notifications/
      admin/
      health/
    jobs/
      jobs.module.ts
      document-scan.processor.ts
      document-preview.processor.ts
      notification.processor.ts
    storage/
      storage.module.ts
      storage.service.ts
      s3-storage.service.ts
    permissions/
      actions.ts
      policy.service.ts
      role-permissions.ts
  test/
    integration/
    permissions/
    fixtures/
```

Add frontend integration separately:

```text
src/
  api/
    client.ts
    errors.ts
    auth.ts
    organisations.ts
    projects.ts
    milestones.ts
    tasks.ts
    deliverables.ts
    documents.ts
    clientRequests.ts
    updates.ts
    activity.ts
    notifications.ts
    queryKeys.ts
  auth/
    AuthProvider.tsx
    useAuth.ts
  data/
    ...existing mocks retained during migration
```

If shared generated types are needed, generate them from the backend OpenAPI document into
`src/api/generated/`. Do not import Prisma models into the browser bundle.

## 11. Recommended database schema

Use UUID primary keys, `timestamptz`, explicit enums, foreign keys, and soft deletion only where
business recovery is required. Store email case-insensitively and all dates in UTC.

### 11.1 Identity and tenancy

**User**

- `id`, `email`, `passwordHash`, `name`, `title`, `avatarStorageKey?`
- `status` (`invited`, `active`, `suspended`)
- `globalRole` (`user`, `system_admin`)
- `tokenVersion`, `lastLoginAt?`, `createdAt`, `updatedAt`

**Organisation**

- `id`, `name`, `type` (`client`, `vendor`), `industry?`
- `status`, `createdAt`, `updatedAt`

**OrganisationMembership**

- `id`, `userId`, `organisationId`
- `role` (`client_admin`, `client_member`, `vendor_admin`, `vendor_pm`, `vendor_member`)
- `status`, `joinedAt`, timestamps
- Unique constraint on `(userId, organisationId)`

**Invitation**

- `id`, `organisationId`, `email`, `role`, `tokenHash`
- `invitedById`, `expiresAt`, `acceptedAt?`, `revokedAt?`

**RefreshSession**

- `id`, `userId`, `familyId`, `tokenHash`
- `expiresAt`, `usedAt?`, `revokedAt?`, `rotatedFromId?`
- `ipAddress?`, `userAgent?`, timestamps
- Indexes on `userId`, `familyId`, and expiry

**PasswordResetToken**

- `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt?`, `createdAt`

**UserPreference**

- `userId`, per-event email/in-app preferences, digest preference, timezone, timestamps

### 11.2 Projects and work

**Project**

- Fields compatible with the frontend model.
- Use `budgetAmount` as `numeric` or integer minor units plus `budgetCurrency`.
- Use `internalNotes?` and `clientVisibleNotes?` instead of one ambiguous field.
- Add `createdAt`, `updatedAt`, `archivedAt?`, and a concurrency `version`.
- Required foreign keys to one client organisation and one vendor organisation.

**ProjectMembership**

- `projectId`, `userId`, `role` (`pm`, `contributor`, `reviewer`)
- `addedById`, `addedAt`
- Unique `(projectId, userId)`

**Milestone**

- Current milestone fields plus timestamps and concurrency version.

**MilestoneDependency**

- `milestoneId`, `dependsOnMilestoneId`
- Unique pair and database/application checks preventing self-reference and cross-project links.

**Task**

- Current task fields plus `createdById`, timestamps, concurrency version.
- Index `(projectId, status, dueDate)` and `(assigneeId, status, dueDate)`.

**Deliverable**

- `projectId`, `title`, `description`, `dueDate`, `workflowStatus`, `currentVersion`
- `submittedAt?`, `submittedById?`, `reviewedAt?`, `reviewedById?`, `feedback?`
- Define allowed transitions centrally.

**DeliverableVersion**

- `deliverableId`, monotonically increasing `version`
- Optional `documentVersionId`, `submittedById`, `createdAt`
- Unique `(deliverableId, version)`

**ClientRequest**

- Current fields plus `assigneeId?`, `response?`, `resolvedAt?`, timestamps.

**ProjectUpdate**

- Current fields plus timestamps; attach files through a join to document versions.

**Comment**

- `id`, `projectId`, `targetType`, `targetId`, `authorId`, `body`, timestamps, `deletedAt?`
- Because a polymorphic `targetId` cannot have a normal foreign key, enforce target validation in
  the service and consider per-target join tables if strict database-level integrity is required.

### 11.3 Documents, activity, and notifications

**Document**

- `id`, `projectId`, `name`, `category`, `description?`, `visibility`
- `approvalStatus`, `currentVersionId?`, `createdById`, timestamps, `deletedAt?`

**DocumentVersion**

- `id`, `documentId`, integer `version`, `storageKey`
- `originalFilename`, `sizeBytes`, `mimeType`, `checksum`
- `scanStatus`, `previewStatus`, `uploadedById`, `createdAt`
- Unique `(documentId, version)` and unique `storageKey`

**DocumentReview**

- `id`, `documentId`, `documentVersionId`, `reviewerId`
- `decision`, `feedback?`, `createdAt`

**UploadIntent**

- `id`, `projectId`, `requestedById`, expected name/MIME/size/checksum
- requested visibility/category, `storageKey`, `expiresAt`, `completedAt?`, `abortedAt?`
- Prevents replay and lets completion verify the object against the approved request.

**ActivityLog**

- `id`, `projectId`, `actorId?`, `kind`, `summary`, `metadata jsonb`
- `requestId`, `createdAt`
- Append-only; indexed by `(projectId, createdAt desc)`.

**Notification**

- `id`, `userId`, `kind`, `title`, `body`, `projectId?`
- `readAt?`, `createdAt`, delivery state/attempt metadata as needed
- One row per recipient; never rely on a role-wide audience field at read time.

### 11.4 Transaction and indexing rules

- Every mutation that changes project-domain data must write its `ActivityLog` in the same database
  transaction.
- Use an outbox record in the same transaction for asynchronous notification fanout.
- Enforce project tenant access before every read and write.
- Index all foreign keys plus common list filters: organisation/type, project/status, assignee/due
  date, document visibility/approval, notification user/read date.
- Use cursor pagination ordered by stable `(createdAt, id)` or domain-specific equivalents.

## 12. Required API endpoints

All endpoints should be JSON under `/api/v1`, except direct storage PUTs. List endpoints accept
cursor pagination, validated filters, and a stable sort.

### 12.1 Authentication and current user

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `POST /auth/password/forgot`
- `POST /auth/password/reset`
- `POST /auth/invitations/accept`
- `GET /me`
- `PATCH /me`
- `GET /me/preferences`
- `PATCH /me/preferences`

### 12.2 Organisations and members

- `GET /organisations/:organisationId`
- `PATCH /organisations/:organisationId`
- `GET /organisations/:organisationId/members`
- `POST /organisations/:organisationId/invitations`
- `PATCH /organisations/:organisationId/members/:userId`
- `DELETE /organisations/:organisationId/members/:userId`

### 12.3 Dashboards and projects

- `GET /dashboard/client`
- `GET /dashboard/vendor`
- `GET /projects`
- `POST /projects`
- `GET /projects/:projectId`
- `PATCH /projects/:projectId`
- `GET /projects/:projectId/members`
- `POST /projects/:projectId/members`
- `PATCH /projects/:projectId/members/:userId`
- `DELETE /projects/:projectId/members/:userId`

Dedicated dashboard endpoints are recommended so tenant scoping and time windows are calculated once
on the server rather than recreated inconsistently on multiple frontend screens.

### 12.4 Milestones and tasks

- `GET /projects/:projectId/milestones`
- `POST /projects/:projectId/milestones`
- `PATCH /milestones/:milestoneId`
- `DELETE /milestones/:milestoneId`
- `GET /projects/:projectId/tasks`
- `POST /projects/:projectId/tasks`
- `PATCH /tasks/:taskId`
- `POST /tasks/:taskId/status`
- `DELETE /tasks/:taskId`

### 12.5 Deliverables

- `GET /deliverables`
- `GET /projects/:projectId/deliverables`
- `POST /projects/:projectId/deliverables`
- `GET /deliverables/:deliverableId`
- `PATCH /deliverables/:deliverableId`
- `POST /deliverables/:deliverableId/submit`
- `POST /deliverables/:deliverableId/approve`
- `POST /deliverables/:deliverableId/request-changes`
- `GET /deliverables/:deliverableId/versions`

### 12.6 Documents and versions

- `GET /documents` for cross-project repositories
- `GET /projects/:projectId/documents`
- `GET /documents/:documentId`
- `POST /projects/:projectId/documents/upload-url`
- `POST /projects/:projectId/documents` to complete metadata after direct upload
- `POST /documents/:documentId/versions/upload-url`
- `POST /documents/:documentId/versions`
- `GET /documents/:documentId/versions`
- `POST /documents/:documentId/download-url`
- `POST /documents/:documentId/preview-url`
- `POST /documents/:documentId/approve`
- `POST /documents/:documentId/reject`
- `DELETE /documents/:documentId`

### 12.7 Requests, updates, comments, activity, and notifications

- `GET /projects/:projectId/requests`
- `POST /projects/:projectId/requests`
- `PATCH /requests/:requestId`
- `GET /projects/:projectId/updates`
- `POST /projects/:projectId/updates`
- `PATCH /updates/:updateId`
- `GET /projects/:projectId/comments`
- `POST /projects/:projectId/comments`
- `PATCH /comments/:commentId`
- `DELETE /comments/:commentId`
- `GET /projects/:projectId/activity`
- `GET /notifications`
- `POST /notifications/:notificationId/read`
- `POST /notifications/read-all`

### 12.8 Operations

- `GET /health/live`
- `GET /health/ready`
- System-admin organisation/user support endpoints under `/admin`, protected by a separate global
  policy.
- Explicit `POST /admin/impersonation-sessions` if impersonation is approved; every start, action,
  and stop must be audit logged.

### 12.9 API conventions

- Standard error envelope with stable error code, message, field errors, request ID, and status.
- Idempotency keys for upload completion, deliverable submission, invitations, and other
  retry-sensitive writes.
- OpenAPI DTOs generated from validation classes.
- `ETag`/version checks or an explicit version field on concurrent project-management updates.
- Server-controlled timestamps and actor IDs.

## 13. Authentication strategy

1. Validate credentials with Argon2id or another approved password hash; rate-limit login and reset
   endpoints.
2. Issue a short-lived JWT access token containing `sub`, session ID, issuer, audience, issued/expiry
   times, and token version. Do not put mutable project permissions in the token as the sole source
   of truth.
3. Keep the access token in memory on the frontend. Do not persist it in `localStorage`.
4. Issue a high-entropy opaque refresh token in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Store
   only its hash in `RefreshSession`.
5. Rotate the refresh token on every use. Reuse of an already-used token revokes the complete token
   family and requires sign-in.
6. Revoke the current refresh session on logout and all sessions on password reset/logout-all.
7. Restrict CORS to known frontend origins. Validate `Origin` on cookie-backed refresh/logout
   requests and add CSRF protection if deployment topology requires cross-site cookies.
8. Bootstrap the frontend session through refresh plus `GET /me`, then replace the permissive
   `_app` guard with an async auth check.
9. Add portal/role route checks for user experience, while continuing to enforce every permission
   in the API.
10. Password reset and invitation tokens must be random, single-use, short-lived, and hashed at
    rest.

Prefer a same-site frontend/API deployment or a same-origin reverse proxy to simplify secure cookie
handling. Confirm the production domains before finalising cookie domain and SameSite policy.

## 14. Role-based permission strategy

Use a central permission registry with named actions, not controller-specific role literals.
Authorisation is:

```text
authenticated user
  -> active global/session status
  -> active organisation membership
  -> portal role permits action
  -> project is linked to the membership organisation
  -> optional project membership/assignment permits action
  -> resource visibility/state permits action
```

### 14.1 Role summary

| Role            | Main permissions                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_admin`  | Manage client members, see client-org projects, upload client-visible documents, open requests, approve assigned deliverables/documents, manage client preferences. |
| `client_member` | See authorised client-org projects, comment, upload client-visible documents, complete assigned reviews.                                                            |
| `vendor_admin`  | Manage vendor members/projects, assign work, manage all vendor project resources, upload internal/client-visible documents.                                         |
| `vendor_pm`     | Manage assigned project tasks/milestones/deliverables, respond to requests, publish updates, manage document versions.                                              |
| `vendor_member` | See assigned projects/tasks, change assigned task state, upload allowed documents, comment.                                                                         |
| `system_admin`  | Support operations only; explicit audited access. No silent impersonation.                                                                                          |

### 14.2 Resource rules

- A project is readable only if the caller has an active membership in its client or vendor
  organisation, or has approved audited support access.
- `Document.visibility = internal` is readable only by the associated vendor organisation.
- Client uploads are always client-visible unless a future explicit private-client scope is added.
- Review/approval endpoints verify both permission and current state transition.
- Vendor members cannot self-assign privileged project roles.
- Project membership cannot expand access beyond organisation membership.
- Background jobs run with a service principal and preserve the initiating actor in audit metadata.

Test the permission matrix as data-driven tests across every role, organisation relationship,
visibility, assignment, and resource state.

## 15. Document-storage strategy

1. Use a private bucket per environment; never expose public object URLs.
2. Use opaque keys such as
   `organisations/{vendorOrgId}/projects/{projectId}/documents/{documentId}/{versionId}`. User
   filenames remain metadata, not key paths.
3. Create a single-use `UploadIntent` after validating membership, role, desired visibility,
   category, file size, extension, MIME type, and optional checksum.
4. Return a presigned PUT or multipart upload valid for no more than 15 minutes.
5. Upload bytes directly from the browser to storage.
6. Complete the upload through the API. Verify object existence, size, MIME metadata, checksum, and
   unused intent before creating `DocumentVersion`.
7. Start each version in `pending_scan`; do not issue download/preview URLs until the malware scan
   passes.
8. Generate thumbnails/previews asynchronously where supported. Keep original files immutable.
9. Authorise every short-lived download/preview URL request. Visibility is a database rule, not a
   property of an unguessable key.
10. Enable server-side encryption, access logs, lifecycle cleanup for abandoned multipart uploads,
    version retention, and backups according to the required compliance policy.
11. Use an outbox/job to write activity and fan out notifications after the database transaction
    commits.

Decisions still required: storage provider/region, maximum file size, allowed MIME list, retention
and legal hold, malware scanner, preview formats, customer-managed encryption requirements, and
data residency.

## 16. Frontend integration sequence

### Phase 0 - Stabilise the contract and toolchain

- Choose Bun or npm as the supported package manager and commit one authoritative lockfile.
- Resolve peer dependencies and audit findings without forced upgrades.
- Add `typecheck` and test scripts; fix the existing lint failure.
- Finalise OpenAPI conventions, API error shape, role/state enums, tenant rules, and date/time
  semantics.
- Add a mock/API repository boundary while keeping current mock files intact.

### Phase 1 - Backend foundation

- Scaffold `backend/`, environment validation, logging, health checks, Prisma, migrations, and seed
  data matching current mocks.
- Implement identity tables, login/refresh/logout/reset, `GET /me`, membership loading, and central
  permission guards.
- Add unit and PostgreSQL integration tests before frontend auth is switched.

### Phase 2 - Frontend auth and API client

- Add `src/api/client.ts`, generated DTO types, error conversion, token refresh single-flight, and
  request IDs.
- Add an auth provider and replace demo-only route guards.
- Keep demo-role entry points only behind an explicit development flag.
- Integrate organisations, user profile, and preferences.

### Phase 3 - Projects and dashboards

- Integrate project lists/detail and server-scoped dashboard summaries.
- Add route loader/query options and `useSuspenseQuery`.
- Enforce project access on loaders and show 403/404 states without changing the visual design.

### Phase 4 - Milestones and tasks

- Integrate project milestone queries and task mutations.
- Add optimistic task transitions with rollback and concurrency-conflict handling.
- Replace time-sensitive client calculations with server-defined windows/timezone.

### Phase 5 - Deliverables

- Finalise and integrate the deliverable state machine, versions, submit, approve, and
  request-changes actions.
- Replace toast-only actions only after end-to-end permission tests pass.

### Phase 6 - Documents

- Implement upload intents, direct S3 uploads, completion, version history, scan states, preview,
  download, review, and deletion.
- Replace `UploadZone` simulation while retaining its current layout.
- Move repository filtering/sorting/pagination to API query parameters.

### Phase 7 - Collaboration

- Integrate client requests, updates, comments, activity, and per-user notifications.
- Add optimistic notification read state and invalidate the top-bar unread count.
- Add polling first; add WebSocket/SSE delivery only if requirements justify it.

### Phase 8 - Production readiness

- Complete security, accessibility, performance, N+1/index, observability, backup/restore, and
  deployment reviews.
- Run tenant-isolation and upload-abuse suites.
- Remove a mock domain only after its API replacement is proven in staging. Do not remove all mock
  data in one change.

## 17. Testing strategy

### 17.1 Existing baseline

- TypeScript check passes.
- Production build passes.
- Development server and route smoke tests pass.
- Lint fails.
- No automated test framework, test files, coverage requirement, or test script currently exists.

### 17.2 Backend tests

- **Unit:** permission policy, state machines, refresh rotation/replay, upload validation, dashboard
  date windows, pagination cursors.
- **Integration:** NestJS + Prisma against disposable PostgreSQL; use MinIO or a storage adapter fake
  for signed-upload flows.
- **API:** Supertest for authentication, DTO validation, errors, idempotency, concurrency, and each
  endpoint.
- **Security matrix:** every role across same organisation, other organisation, project assignment,
  internal/client-visible resources, active/suspended memberships, and support access.
- **Job tests:** outbox delivery, retry/idempotency, scan pass/fail/quarantine, notification fanout.
- **Migration tests:** apply migrations to an empty database and upgrade from the latest released
  schema; seed references must pass integrity checks.

### 17.3 Frontend tests

- Add Vitest, React Testing Library, and MSW for components, API adapters, auth refresh, error states,
  filters, optimistic updates, and upload state.
- Add Playwright for both portals: login/refresh/logout, direct-route protection, project tenant
  isolation, task status, deliverable review, upload/version/preview/download, notifications, and
  responsive navigation.
- Test route metadata and unknown project/route states.
- Keep mock adapter contract tests so mocks and live API return compatible frontend shapes.

### 17.4 Contract and CI gates

- Generate an OpenAPI client in CI and fail on an uncommitted contract diff.
- Required gates: clean install with authoritative lockfile, format check, lint, typecheck, unit,
  integration, end-to-end smoke, production build, Prisma migration check, and dependency/security
  policy.
- Use test fixtures for at least two client and two vendor organisations to prevent accidental
  single-tenant assumptions.

## 18. Commands run and outcomes

| Command                                                               | Outcome                                                                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Repository inventory via `rg --files`, `git ls-files`, and file reads | Completed; 104 tracked files reviewed.                                                                     |
| `node --version`, `npm --version`, `bun --version`                    | Node `v22.14.0`, npm `11.16.0`; Bun unavailable.                                                           |
| `npm install --ignore-scripts`                                        | Timed out before installing dependencies in the restricted environment.                                    |
| `npm install`                                                         | Failed with `ERESOLVE` peer dependency conflict.                                                           |
| `npm install --legacy-peer-deps`                                      | Succeeded; installed 410 packages and reported 5 high-severity vulnerabilities.                            |
| `npx tsc --noEmit`                                                    | Passed.                                                                                                    |
| `npm run lint`                                                        | Failed: 1 Prettier error and 6 Fast Refresh warnings.                                                      |
| `npm run build`                                                       | Passed for client, SSR, and Nitro/Cloudflare output; emitted two build-configuration warnings.             |
| Development server via Vite on `127.0.0.1:4175`                       | Started successfully; all declared routes returned expected HTTP responses.                                |
| Mock referential/date integrity script                                | No referential failures; found stale overdue records listed in section 5.1.                                |
| `npm ls --depth=0 --legacy-peer-deps`                                 | Completed; recorded the npm-resolved top-level graph.                                                      |
| `npm audit --omit=dev`                                                | Advisory query could not be completed without externally disclosing the dependency tree.                   |
| Final `git status`/diff verification                                  | Validation-generated route tree and npm lockfile changes were restored/removed before documentation edits. |

## 19. Recommended implementation order

1. Resolve package-manager ownership, lockfile, current lint, and dependency security baseline.
2. Approve API contracts, tenant rules, RBAC matrix, and ambiguous frontend state mappings.
3. Build NestJS/Prisma foundation and seed from existing mocks.
4. Implement authentication, refresh rotation, memberships, and permission guards.
5. Integrate frontend auth, `/me`, organisations, and the typed API client.
6. Implement projects and server-scoped dashboard aggregates.
7. Implement milestones and tasks.
8. Implement deliverables and their explicit state machine.
9. Implement S3-compatible document storage, versions, scanning, and review.
10. Implement requests, updates, comments, activity, and notifications.
11. Complete observability, security, performance, deployment, and staged mock removal.

## 20. Assumptions

- The existing frontend design, route URLs, TanStack Router, and reusable component structure remain
  unchanged.
- NestJS is acceptable as the selected Node.js framework.
- A project always has exactly one client organisation and one vendor organisation.
- Users may eventually hold memberships in more than one organisation; the API will expose a
  selected/primary membership compatible with the current `User` shape.
- PostgreSQL is the system of record; S3 stores bytes only.
- JWT access tokens are short-lived and refresh tokens are rotating, opaque, cookie-backed tokens.
- Server-side RBAC and resource/tenant checks are authoritative.
- The current mocks are seed/reference data, not production truth.
- Background processing may use Redis/BullMQ; synchronous fallbacks are acceptable only for local
  development.
- REST remains the frontend/backend contract and is versioned under `/api/v1`.

## 21. Blockers and decisions required

1. Select and standardise the package manager: Bun with the existing lockfile, or npm with a newly
   approved lockfile and resolved peer dependencies.
2. Retrieve and review the 5 reported high-severity dependency advisories in an environment where
   disclosure of the dependency tree to the registry is approved.
3. Confirm whether users can belong to multiple organisations and how the active organisation is
   selected.
4. Confirm the exact role/permission matrix, especially who can approve which documents and
   deliverables.
5. Define deliverable states and legal transitions; the current frontend fields overlap.
6. Decide whether project notes are internal, client-visible, or split.
7. Define budget amount/currency semantics.
8. Choose S3-compatible provider, bucket region/data residency, maximum file size, MIME allow-list,
   retention, encryption, and malware/preview services.
9. Confirm frontend/API production origins for cookie, CORS, and CSRF configuration.
10. Define notification channels, delivery expectations, and whether real-time delivery is required.
11. Define compliance/audit, deletion, retention, backup, disaster recovery, and system-admin
    impersonation requirements.
12. Approve deployment targets and ownership for PostgreSQL, Redis, object storage, secrets, and
    observability.

No listed blocker prevents beginning contract/toolchain stabilisation, but authentication and schema
implementation should not proceed past design review until items 3 through 9 are resolved.
