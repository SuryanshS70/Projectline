# Projectline Implementation Plan

- **Last updated:** 2026-07-26
- **Current phase:** Final internship MVP integration
- **Stack:** React/TanStack Start; Express, TypeScript, Prisma, and SQLite
- **Phase 4 status:** Complete

## 1. Current outcome

Projectline now demonstrates the important client/vendor workflow end-to-end:

1. A seeded user signs in with a bcrypt-verified password.
2. The frontend restores an eight-hour JWT session.
3. Portal routes and every project resource enforce the user's role and `ProjectMember` record.
4. Project lists, details, dashboards, and documents load from the backend.
5. Vendors update tasks, milestones, deliverables, and client requests.
6. Clients create requests and review submitted deliverables.
7. Both project members can upload, list, download, and delete local documents.

The existing route paths, cards, tabs, badges, tables, and overall visual design are preserved.

## 2. Frontend architecture

- TanStack Start and file-based TanStack Router routes
- React Query for all API reads and mutations
- A small `useSyncExternalStore` authentication store
- One typed fetch client in `src/lib/api.ts`
- Browser local storage for the MVP JWT
- `VITE_API_URL`, defaulting to `http://localhost:3001`

Successful project mutations update the existing React Query project record. Document operations
invalidate their document query. The implementation does not use Redux, generated SDKs, optimistic
updates, or additional state libraries.

## 3. Frontend routes and data

| Route                         | Current data source                           |
| ----------------------------- | --------------------------------------------- |
| `/login`                      | Authentication API                            |
| `/client/dashboard`           | Dashboard API plus mock activity              |
| `/client/projects`            | Project API                                   |
| `/client/projects/:projectId` | Project, mutation, request, and document APIs |
| `/client/documents`           | Project and document APIs                     |
| `/client/notifications`       | Mocks                                         |
| `/client/settings`            | Mocks                                         |
| `/vendor/dashboard`           | Dashboard API plus mock activity              |
| `/vendor/projects`            | Project API                                   |
| `/vendor/projects/:projectId` | Project, mutation, request, and document APIs |
| `/vendor/documents`           | Project and document APIs                     |
| `/vendor/notifications`       | Mocks                                         |
| `/vendor/settings`            | Mocks                                         |

Clients are redirected away from vendor routes and vendors away from client routes.

## 4. Backend structure

```text
server/
  prisma/
    migrations/
    schema.prisma
    seed.ts
  uploads/                       # local, Git-ignored
  src/
    middleware/
      authenticate.ts
      error-handler.ts
      not-found.ts
    routes/
      auth.ts
      client-requests.ts
      dashboard.ts
      deliverables.ts
      documents.ts
      health.ts
      milestones.ts
      projects.ts
      tasks.ts
    uploads.ts
    app.ts
    auth.ts
    server.ts
  test/api.test.ts
```

Routes use Prisma directly. Shared upload validation lives in `uploads.ts`; there is no service
framework or policy engine.

## 5. Data model

Current Prisma models:

- `User`
- `Project`
- `ProjectMember`
- `Milestone`
- `Task`
- `Deliverable`
- `Document`
- `ClientRequest`

Phase 4 added Prisma enum values for `READY_FOR_REVIEW`, `PENDING`, and `COMPLETED`. SQLite stores
these enum fields as text, so Prisma reported the existing database schema as already in sync and no
new SQL migration was required.

The seed includes a shared, initially unsubmitted portal deliverable so both vendor submission and
client review can be demonstrated.

## 6. Mutation rules

### Tasks

`PATCH /api/tasks/:taskId` requires project membership and a vendor user. It accepts:

- `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, or `COMPLETED`;
- an assignee name;
- a due date.

The current frontend edits only task status.

### Milestones

`PATCH /api/milestones/:milestoneId` requires project membership and a vendor user. Progress must be
an integer from 0 through 100. Supported statuses are `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, and
`DELAYED`.

### Deliverables

Vendor actions:

- `READY_FOR_REVIEW`
- `SUBMIT`

Client actions:

- `APPROVE`
- `REQUEST_CHANGES`

Requesting changes requires feedback. Client review is allowed only after submission. The rules are
direct checks in the route; no transition engine exists.

### Client requests

- Project members can list requests.
- Clients can create requests.
- Vendors can update assigned-project requests to `OPEN`, `IN_PROGRESS`, or `COMPLETED`.
- Comments, threads, and request history are not implemented.

## 7. Documents

Multer accepts one `multipart/form-data` file per request. The limit is 10 MB.

Allowed extensions and MIME types cover PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, TXT, and ZIP.
Physical filenames use generated UUIDs. API responses expose only safe metadata.

Documents are written to `server/uploads/` and metadata is stored in `Document`. Download and
delete load the document through a project-membership filter. A safe-path check prevents stored
paths outside the upload directory from being served or deleted.

Deletion is permanent and removes the local file plus database row. The frontend shows an explicit
confirmation dialog.

## 8. Dashboard

`GET /api/dashboard` loads only assigned projects and calculates role-specific values in a small,
straightforward handler.

Client:

- total projects;
- active projects;
- delayed/at-risk projects;
- submitted deliverables pending approval.

Vendor:

- active projects;
- incomplete tasks due within seven days;
- incomplete overdue tasks;
- submitted deliverables awaiting client review.

The response also supplies project summaries, upcoming milestones, and latest documents. Recent
activity is still mock-driven because no activity model exists.

## 9. Testing status

Backend: 38 Supertest cases covering authentication, project access, task/milestone/deliverable
permissions, client requests, file validation, upload/download/delete access, dashboard data, health,
and unknown routes.

Frontend: 17 Vitest/React Testing Library cases covering routes, authentication, portal redirects,
project reads, task mutation, deliverable UI updates, upload success/error, request creation, and
dashboard API metrics.

Manual verification covers both seeded roles and the complete mutation/document workflow.

## 10. Remaining mocks

- Notification pages and notification counts
- Recent activity feeds and project activity
- Project updates
- Settings
- Advanced reporting
- Historical mock modules retained for screens still using them

## 11. Genuine MVP limitations

- Local SQLite and local uploads are not shared across machines.
- Local-storage JWTs are accessible to frontend JavaScript.
- There are no refresh tokens or server-side token revocation.
- Mutations do not generate audit or activity records.
- Documents have no version history, visibility, approval, category, preview, or recovery.
- API lists are unpaginated.
- High-severity package advisories remain unresolved.
- The upstream Vite configuration emits non-fatal warnings.

## 12. Recommended continuation order

The current internship MVP is demonstration-ready. If additional work is explicitly requested:

1. Resolve dependency advisories.
2. Replace notification/activity mocks only if the demonstration needs them.
3. Connect settings to current-user data.
4. Add pagination if seed/demo data grows materially.

Do not add S3, refresh-token rotation, Redis, WebSockets, microservices, or complex RBAC without a
new production requirement.
