# Codex Handoff — Projectline

**Last updated:** 2026-07-26

Read this file completely before continuing. Projectline is connected to Lovable; do not rewrite
published Git history or force-push.

## Current state

Phase 4 is complete. The internship MVP now has:

- bcrypt email/password login and eight-hour JWTs;
- client/vendor route protection;
- project membership filtering;
- API-backed dashboards, projects, and documents;
- vendor task and milestone updates;
- vendor deliverable readiness/submission;
- client deliverable approval/change requests with feedback;
- client request creation and vendor status updates;
- local document upload, list, download, and permanent delete;
- focused backend and frontend tests.

Notifications, activity, settings, and advanced reporting remain mocked.

## Run locally

Frontend:

```sh
npm install
npm run dev
```

URL: `http://localhost:5173`

Backend:

```sh
cd server
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

URL: `http://localhost:3001`

Development accounts:

```text
client@example.com / password123
vendor@example.com / password123
```

The frontend API URL comes from `VITE_API_URL`; the default is `http://localhost:3001`.

## Authentication

`server/src/middleware/authenticate.ts` reads and verifies the Bearer token, loads a safe current
user, and attaches it to the Express request. Tokens use HS256 and expire in eight hours.

The frontend stores the JWT in local storage and restores the user through `/api/auth/me`. Logout is
stateless and does not revoke an issued token.

## Membership and permissions

All resource routes load through project membership. Missing and unassigned IDs return 404.

| Resource        | Client                             | Vendor                           |
| --------------- | ---------------------------------- | -------------------------------- |
| Tasks           | Read                               | Read and update                  |
| Milestones      | Read                               | Read and update                  |
| Deliverables    | Read, approve, or request changes  | Read, ready, and submit          |
| Client requests | Read and create                    | Read and update status           |
| Documents       | List, upload, download, and delete | List, upload, download, delete   |
| Dashboard       | Assigned client metrics/projects   | Assigned vendor metrics/projects |

Deliverable route actions are `READY_FOR_REVIEW`, `SUBMIT`, `APPROVE`, and `REQUEST_CHANGES`.
Request changes requires feedback.

Client request statuses are `OPEN`, `IN_PROGRESS`, and `COMPLETED`.

## Documents

Uploads are stored in `server/uploads/`, which is ignored by Git. Metadata is stored in SQLite.

- one file per request;
- 10 MB maximum;
- PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, TXT, and ZIP;
- UUID-based stored filenames;
- authenticated membership checks before upload;
- safe-path checks before download/delete;
- permanent file and row deletion.

The frontend project tabs and both document repositories use these endpoints. Simulated progress,
version, visibility, approval, and preview controls were removed because those values are not
persisted.

Local storage is an explicit internship-MVP compromise. S3, cloud storage, versions, soft deletion,
and advanced document permissions are future scope.

## Dashboard

`GET /api/dashboard` supplies:

- client total/active/delayed projects and pending approvals;
- vendor active projects, tasks due soon, overdue tasks, and deliverables awaiting review;
- assigned project summaries;
- upcoming milestones;
- latest documents.

Recent activity remains mocked.

## Frontend integration

`src/lib/api.ts` contains the complete typed client. It automatically adds the JWT, handles JSON and
FormData, normalises Prisma enums, and exposes small functions for each Phase 4 action.

Mutation components update the current React Query project record. Document mutations invalidate
document queries. No optimistic update or additional state library was added.

Key integration components:

- `src/components/project/TasksBoard.tsx`
- `src/components/project/MilestonesList.tsx`
- `src/components/project/DeliverablesList.tsx`
- `src/components/project/ClientRequestsList.tsx`
- `src/components/project/ProjectDocuments.tsx`
- `src/components/documents/DocumentRepository.tsx`

## Database and seed

Prisma enum values now include deliverable `READY_FOR_REVIEW`, approval `PENDING`, and request
`COMPLETED`. SQLite required no new SQL migration for these enum-text changes.

The seed creates nine deliverables, including `d-2`, an unsubmitted portal deliverable shared by the
client and vendor demonstration accounts.

Running the seed deletes document database rows. Existing physical upload files are not automatically
purged and may require manual cleanup during development.

## Validation baseline

Frontend:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: 17 passing tests.

Backend:

```sh
cd server
npx prisma validate
npm run prisma:migrate
npm run prisma:seed
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: 38 passing tests.

## Known limitations

- SQLite and local uploads are single-machine only.
- JWTs use local storage with no refresh or revocation.
- Notifications, activity, settings, and reporting remain mocked.
- Mutation history and notifications are not persisted.
- Document metadata is intentionally basic.
- API lists are not paginated.
- Dependency advisories and non-fatal Vite warnings remain.
