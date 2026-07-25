# Codex Handoff — Projectline

> **Scope disclaimer:** The current repository contains a completed frontend prototype only. It does not contain a production backend, database, real authentication, persistent storage, or functional API integration. Codex is responsible for implementing these systems while preserving the existing frontend design and routes.

This document is the source of truth for continuing this project. The frontend is complete and functional with mock data. Codex should read this file end-to-end before making any changes.

---

## 1. Current Implementation

### Pages completed

- `/login` — email/password (visual only), Remember me, Forgot link, plus two demo role buttons that route to the correct dashboard.
- `/client/dashboard` — welcome, 4 metric cards, project status list, recent activity, upcoming deadlines, latest documents.
- `/client/projects` — card grid of all client projects.
- `/client/projects/:projectId` — project workspace with tabs: Overview, Milestones, Deliverables, Documents, Updates, Activity.
- `/client/documents` — cross-project repository with search, filters, sort, table/card toggle, preview drawer, upload dialog.
- `/client/notifications` — grouped notifications, read/unread state, mark-all-as-read.
- `/client/settings` — profile + notification preferences.
- `/vendor/dashboard` — vendor-focused metrics, assigned projects, activity, upcoming milestones.
- `/vendor/projects` — card grid of assigned projects.
- `/vendor/projects/:projectId` — vendor workspace with tabs: Overview, Tasks, Milestones, Deliverables, Documents, Client Requests, Activity.
- `/vendor/documents` — cross-project vendor documents with visibility, status, type filters.
- `/vendor/notifications` — vendor-audience notifications, grouped and mark-as-read.
- `/vendor/settings` — same shell as client settings, bound to vendor user.

### Reusable components

Located under `src/components/`:

- `layout/` — `AppShell`, `Sidebar`, `Topbar` (mobile drawer via shadcn `Sheet`).
- `common/` — `PageHeader`, `MetricCard`, `StatusBadge`, `RoleBadge`, `ProgressBar`, `FileTypeIcon`, `UserAvatar`, `EmptyState`, `ListSkeleton`, `ActivityFeed`, `FilterToolbar`, `UploadZone`, `DocumentTable`, `ResponsiveTabs`.
- `project/` — `ProjectOverview`, `MilestonesList`, `DeliverablesList`, `ProjectDocuments`, `ProjectUpdates`, `ProjectActivity`, `TasksBoard`, `ClientRequestsList`.

Client and vendor portals reuse these components through props/config — no duplicated variants.

### Mock interactions (all frontend only)

- Demo role switching via the login page and the sidebar footer "Switch role" button (persisted to `localStorage`).
- Simulated file uploads with progress animation.
- Task status changes with local state.
- Notification mark-as-read.
- Deliverable submission / upload actions (toast confirmations).
- Confirmation and info dialogs.
- Toasts via `sonner`.

### Mock-data locations

`src/data/` contains one file per domain entity plus `types.ts` and `index.ts` barrel:

```
src/data/
  types.ts               all TypeScript interfaces
  organisations.ts       client + vendor organisations
  users.ts               demo users, plus demoClient / demoVendor exports
  projects.ts            4 mock projects
  milestones.ts          per-project milestones
  tasks.ts               per-project tasks (vendor board)
  deliverables.ts        per-project deliverables
  documents.ts           documents with visibility + approval state
  updates.ts             project updates feed
  activity.ts            audit-style activity entries
  notifications.ts       role-audience notifications
  clientRequests.ts      requests from client to vendor
```

### Known limitations

- No real authentication — `src/lib/session.ts` reads/writes a demo session to `localStorage` and the "protected route" placeholder in `src/routes/_app.tsx` is permissive.
- Uploaded files are held in local component state; refreshing the page loses them.
- Search/filter/sort operate on the mock arrays only.
- No pagination, no server-side sorting.
- Notification unread counts refresh at page load only (not real-time).
- The routing framework is **TanStack Router**, not React Router DOM (the project was scaffolded on TanStack Start). All navigation uses `@tanstack/react-router`'s `Link`, `useNavigate`, and typed params.

---

## 2. Recommended Backend Architecture

The frontend does not depend on this stack — Codex or another team can substitute any comparable technology.

- **Runtime:** Node.js 20+.
- **Framework:** NestJS (preferred for larger enterprise-grade codebases) or Express with a clear module layout.
- **Database:** PostgreSQL 15+.
- **ORM:** Prisma.
- **Auth:** JWT access tokens (short-lived) + rotating refresh tokens stored as HTTP-only cookies; refresh-on-401 in the API client.
- **RBAC:** role and organisation checked in a request pipeline (Nest guard or Express middleware) using the roles listed in section 3.
- **Object storage:** S3-compatible (AWS S3, Cloudflare R2, MinIO). Uploads via presigned URLs — never proxy binaries through the API server.
- **Background jobs:** BullMQ + Redis for notifications, virus scanning, PDF thumbnails.
- **Observability:** structured logs (pino), request IDs, OpenTelemetry traces.

Do not couple the frontend to any of these choices — the frontend consumes REST endpoints; swapping the backend must not require frontend refactors beyond the API client base URL.

---

## 3. Required User Roles

| Role | Scope | Permissions |
| --- | --- | --- |
| `client_admin` | Client organisation | Manage members and permissions inside the client org; approve documents; open requests; view billing. |
| `client_member` | Client organisation | View projects the org is on; comment; approve deliverables assigned to them; upload documents in `client_visible` scope only. |
| `vendor_admin` | Vendor organisation | Manage vendor members; assign work; upload/replace documents in any visibility; respond to client requests. |
| `vendor_pm` | Vendor organisation | Manage tasks/milestones on assigned projects; upload deliverables; respond to client requests. |
| `vendor_member` | Vendor organisation | Complete assigned tasks; upload documents; comment. |
| `system_admin` | Global | Support operations; org creation; cannot silently impersonate — impersonation actions must audit-log. |

Role checks must be centralised in a permissions module — do not sprinkle role literals through controllers.

---

## 4. Proposed Data Models

Field names mirror the TS interfaces in `src/data/types.ts` — keep the shapes compatible so the API-client migration is mechanical.

- **User** — `id`, `email`, `hashedPassword`, `name`, `title`, `avatarUrl?`, `organisationId`, timestamps.
- **Organisation** — `id`, `name`, `type` (`client|vendor`), `industry`, timestamps.
- **OrganisationMember** — `userId`, `organisationId`, `role`.
- **Project** — `id`, `name`, `description`, `clientOrgId`, `vendorOrgId`, `status`, `completion`, `startDate`, `expectedEndDate`, `projectManagerId`, `clientContactId`, `nextMilestone`, `currentPhase`, `risk`, `budget`, `health`, `notes`, timestamps.
- **ProjectMember** — `userId`, `projectId`, `role` (`pm|contributor|reviewer`), `addedAt`.
- **Milestone** — `id`, `projectId`, `name`, `dueDate`, `status`, `ownerId`, `progress`, `dependencies[]`, timestamps.
- **Task** — `id`, `projectId`, `milestoneId?`, `title`, `description`, `assigneeId`, `priority`, `dueDate`, `status`, timestamps.
- **Deliverable** — `id`, `projectId`, `title`, `description`, `dueDate`, `submissionStatus`, `approvalStatus`, `version`, `feedback?`, timestamps.
- **Document** — `id`, `projectId`, `name`, `type`, `sizeBytes`, `uploadedById`, `category`, `visibility`, `approval`, `description?`, `currentVersionId`, timestamps.
- **DocumentVersion** — `id`, `documentId`, `version`, `storageKey`, `sizeBytes`, `mimeType`, `uploadedById`, `createdAt`.
- **ClientRequest** — `id`, `projectId`, `title`, `description`, `priority`, `requestedAt`, `dueDate`, `status`, `milestoneId?`, `requesterId`, timestamps.
- **ProjectUpdate** — `id`, `projectId`, `title`, `body`, `authorId`, `status`, `hasAttachment`, timestamps.
- **ActivityLog** — `id`, `projectId`, `kind`, `actorId`, `summary`, `metadata jsonb`, `createdAt`.
- **Notification** — `id`, `userId`, `kind`, `title`, `body`, `projectId?`, `read`, `readAt?`, `createdAt`.
- **Comment** — `id`, `projectId`, `parentType` (`task|deliverable|document|update`), `parentId`, `authorId`, `body`, timestamps.

Relationship rules:

- `Project.clientOrgId` and `Project.vendorOrgId` both required. Any user must belong to one of the two orgs to see the project.
- `Document.visibility='internal'` is only visible to members of the vendor org that uploaded it.
- Every write must produce one `ActivityLog` row and, for interested users, one `Notification` row.

---

## 5. Proposed API Endpoints

REST, JSON, versioned under `/api/v1`. All list endpoints support `?limit`, `?cursor`, and role-appropriate filters.

### Authentication
- `POST /auth/login` — email + password → tokens.
- `POST /auth/refresh` — rotate refresh cookie → new access token.
- `POST /auth/logout` — revoke refresh token.
- `POST /auth/password/forgot`
- `POST /auth/password/reset`

### Current user
- `GET /me` — profile, organisation, roles.
- `PATCH /me` — profile fields.
- `PATCH /me/preferences` — notification prefs.

### Organisations
- `GET /organisations/:id`
- `GET /organisations/:id/members`
- `POST /organisations/:id/invitations`

### Projects
- `GET /projects` — filtered by caller org and role.
- `GET /projects/:id`
- `PATCH /projects/:id` — vendor PM / admin only.

### Project members
- `GET /projects/:id/members`
- `POST /projects/:id/members`
- `DELETE /projects/:id/members/:userId`

### Milestones
- `GET /projects/:id/milestones`
- `POST /projects/:id/milestones`
- `PATCH /milestones/:id`

### Tasks
- `GET /projects/:id/tasks`
- `POST /projects/:id/tasks`
- `PATCH /tasks/:id`

### Deliverables
- `GET /projects/:id/deliverables`
- `POST /projects/:id/deliverables`
- `PATCH /deliverables/:id`
- `POST /deliverables/:id/submit`
- `POST /deliverables/:id/approve`
- `POST /deliverables/:id/request-changes`

### Documents & versions
- `GET /projects/:id/documents` — respects visibility.
- `POST /projects/:id/documents/upload-url` — see section 6.
- `POST /projects/:id/documents` — commit metadata after upload.
- `POST /documents/:id/versions/upload-url`
- `POST /documents/:id/versions` — commit new version.
- `POST /documents/:id/approve` / `reject`.
- `DELETE /documents/:id`.

### Client requests
- `GET /projects/:id/requests`
- `POST /projects/:id/requests`
- `PATCH /requests/:id`

### Updates & activity
- `GET /projects/:id/updates`
- `POST /projects/:id/updates`
- `GET /projects/:id/activity`

### Notifications
- `GET /notifications`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`

### Screen → endpoint map

| Frontend screen | Endpoints |
| --- | --- |
| Client dashboard | `/projects`, `/notifications`, `/projects/:id/activity` (aggregated), `/projects/:id/documents?limit=4` |
| Client project workspace | `/projects/:id`, `.../milestones`, `.../deliverables`, `.../documents`, `.../updates`, `.../activity` |
| Client documents | `/projects` (for filter), `/documents?visibility=client_visible` (aggregated) |
| Client notifications | `/notifications?audience=self` |
| Vendor dashboard | `/projects` (assigned), `/projects/:id/tasks?dueWithin=7d`, `/deliverables?state=pending` |
| Vendor project workspace | Same as client + `/projects/:id/tasks`, `/projects/:id/requests` |
| Vendor documents | `/documents` (aggregated across vendor's projects) |
| Vendor notifications | `/notifications?audience=self` |

---

## 6. Document Upload Flow

1. Frontend calls `POST /projects/:id/documents/upload-url` with filename, mime type, size. Server checks project membership and visibility rules.
2. Server returns a short-lived signed PUT URL and a `storageKey`.
3. Frontend `PUT`s the binary directly to storage — no bytes touch the API.
4. Frontend calls `POST /projects/:id/documents` with `{ storageKey, name, category, visibility, description, version? }`. Server verifies the object exists and stores metadata.
5. Server writes `ActivityLog(kind=document_uploaded)` and fans out `Notification` rows to relevant users.
6. Server enqueues a virus scan job. If it fails, the document is quarantined and the uploader is notified.

Constraints Codex must enforce:

- Max file size (start at 100 MB, per-plan configurable).
- MIME allow-list matching the `DocumentType` union.
- Version numbers are monotonic per document.
- Presigned URLs expire in ≤ 15 minutes and are single-use where the storage provider supports it.

---

## 7. Frontend Integration Plan

- Create a typed API client under `src/api/` — one file per domain, plus a shared `client.ts` that handles auth headers, JSON serialisation, and 401 → refresh flow.
- Replace `src/data/*` imports gradually. Start with `users` / `organisations` (needed by auth), then projects, then per-project entities. Keep the file names — replace only the exports.
- Add a real auth context in `src/lib/session.ts` — same public API (`getSession`, `setSession`, `clearSession`, `currentUser`) so consumers do not change.
- Replace the placeholder guard in `src/routes/_app.tsx` with a `beforeLoad` that redirects to `/login` when there is no valid session.
- Add per-role guards to sensitive tabs (e.g. block a client user from `/vendor/*`) either in `beforeLoad` or in a wrapping component.
- Route loaders should use `context.queryClient.ensureQueryData(queryOptions)` and components should use `useSuspenseQuery` — the QueryClient is already provided at the root.
- Replace `UploadZone`'s simulated progress with the real upload flow from section 6.
- Move search / filters / sort to server-side query params once endpoints support them; keep the same UI.
- Add optimistic updates for task status changes and notification mark-as-read.
- Central error handling: convert API errors into toast messages and a route-level error boundary.
- Environment variables: `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, etc. via `import.meta.env`.

---

## 8. Codex Task Checklist

### Phase 1 — Foundation
- [ ] Backend project scaffold, config, logging.
- [ ] Prisma schema for the models in section 4.
- [ ] Migrations + seed script mirroring `src/data/*`.
- [ ] Auth (register/login/refresh/logout/password reset).
- [ ] RBAC guards + permissions module.
- [ ] `GET /me`, org endpoints.

### Phase 2 — Project management
- [ ] Projects CRUD.
- [ ] Members management.
- [ ] Milestones.
- [ ] Tasks (with status transitions).
- [ ] Deliverables + submit/approve/request-changes actions.

### Phase 3 — Documents
- [ ] Object-storage integration + signed uploads.
- [ ] Metadata endpoints and version history.
- [ ] Visibility & approval rules enforced server-side.
- [ ] Virus scan job.

### Phase 4 — Communication
- [ ] Client requests.
- [ ] Updates.
- [ ] Comments.
- [ ] Notifications + fanout.
- [ ] Activity log writes wired into every mutating endpoint.

### Phase 5 — Production readiness
- [ ] Zod / class-validator on every request DTO.
- [ ] Rate limiting, CORS, CSRF for cookie flows.
- [ ] Unit + integration test coverage on auth and permissions.
- [ ] Structured logging + tracing.
- [ ] Deployment pipeline (staging + prod).
- [ ] Performance pass: query indexes, N+1 audit, caching where safe.

---

## 9. Codex Starting Prompt

Copy the block below into Codex when starting the backend work.

```
You are continuing an existing project called Projectline. The frontend is complete and lives in this repository. Your job is to implement the backend and progressively replace the frontend's mock data with real APIs.

Before making any changes:

1. Read the entire repository. Do not skim.
2. Read docs/CODEX_HANDOFF.md end to end — it is the source of truth for scope, data model, endpoints, roles, and phases.
3. Inspect src/data/types.ts. Every backend model you build must be compatible with these TypeScript interfaces so the frontend integration is mechanical.
4. Note the routing framework: this project uses TanStack Router (@tanstack/react-router), not React Router DOM. Do not swap it out.

Ground rules while you work:

- Preserve the existing UI and routes. Do not rewrite frontend components unless the handoff explicitly asks you to.
- Implement the backend incrementally, following the phased checklist in section 8. Start with Phase 1 (database, authentication, RBAC).
- Only replace mock data (src/data/*.ts) for a domain after the corresponding API endpoints are working end to end, including auth and permissions.
- Keep the frontend's public function signatures in src/data/*.ts and src/lib/session.ts stable — replace their implementations, not their contracts.
- After each major phase: run linting, type checking, and tests. Fix everything before moving on.
- Maintain a CHANGELOG.md summarising completed work per phase.
- If anything in the handoff is ambiguous or you have to make an architectural assumption, stop and clearly report the assumption or blocker before continuing. Do not silently improvise.

Deliverables per phase are listed in section 8. Begin with Phase 1.
```
