# Project Management Dashboard — Frontend Only

Build a polished, responsive internal PM dashboard with two portals (Client, Vendor), realistic mock data, and a Codex handoff document. No backend, no Supabase, no auth — pure frontend simulation.

## Scope guardrails

- Frontend only. No Supabase, no server functions, no real auth, no storage.
- Uses the existing TanStack Start template (project ships on TanStack Router, not React Router — the request lists React Router but the project is scaffolded on TanStack Start). I'll use TanStack Router with the same route shape the user described (`/login`, `/client/*`, `/vendor/*`). All other requested libs (Tailwind, shadcn, lucide) are already installed.
- Light theme, neutral greys, one restrained accent (a calm blue), subtle borders, rounded cards, no gradients.

## Design direction

Enterprise SaaS: white surfaces, `slate` neutrals, single blue accent (`--primary`). Inter-like system stack. Card radius `lg`, `border` + soft shadow only on elevated surfaces. Status colors reserved for badges (green/amber/red/blue). Focus rings visible. Fully responsive: sidebar → drawer under `md`.

## Route structure (TanStack file-based)

```
src/routes/
  __root.tsx                     (existing — add QueryClientProvider already there, add Toaster)
  index.tsx                      (redirect → /login)
  login.tsx
  _app.tsx                       (app shell layout: sidebar + topbar + <Outlet/>)
  _app.client.dashboard.tsx
  _app.client.projects.index.tsx
  _app.client.projects.$projectId.tsx
  _app.client.documents.tsx
  _app.client.notifications.tsx
  _app.client.settings.tsx
  _app.vendor.dashboard.tsx
  _app.vendor.projects.index.tsx
  _app.vendor.projects.$projectId.tsx
  _app.vendor.documents.tsx
  _app.vendor.notifications.tsx
  _app.vendor.settings.tsx
```

The `_app` pathless layout renders the shell. Role (client|vendor) is derived from the URL segment and stored in a small Zustand-free React context (persisted to `localStorage` for the demo role selector). A `ProtectedRoute` placeholder component is included but permissive.

## File layout

```
src/
  components/
    layout/          AppShell, Sidebar, Topbar, MobileDrawer, PageHeader
    common/          MetricCard, StatusBadge, RoleBadge, ProgressBar,
                     ProjectHealthIndicator, FileTypeIcon, EmptyState,
                     LoadingSkeleton, ConfirmDialog, ActivityFeed,
                     NotificationList, FilterToolbar, DataTable,
                     UserAvatar, UploadZone, DocumentTable,
                     ProjectTabSelector
    project/         ProjectOverview, MilestonesList, DeliverablesList,
                     ProjectDocuments, ProjectUpdates, ProjectActivity,
                     TasksBoard (vendor), ClientRequestsList (vendor)
    ui/              (existing shadcn components)
  data/
    types.ts         All TS interfaces
    users.ts         organisations.ts  projects.ts  milestones.ts
    tasks.ts  deliverables.ts  documents.ts  updates.ts
    activity.ts  notifications.ts  clientRequests.ts
    index.ts         re-exports + helper selectors (getProjectById, etc.)
  lib/
    session.ts       demo role state (client|vendor) via localStorage
    nav.ts           sidebar config, role-aware
    format.ts        date, filesize helpers
  routes/            (as above)
docs/
  CODEX_HANDOFF.md
```

## Pages

**Login** — logo placeholder, email/password/remember/forgot (visual only), Sign in, two demo buttons: "Sign in as Client" → `/client/dashboard`, "Sign in as Vendor" → `/vendor/dashboard`.

**Client Dashboard** — welcome, 4 metric cards (Total / Active / Delayed / Pending Approvals), project status table with all listed fields, recent activity, upcoming deadlines, latest documents.

**Client Projects list + `/:projectId`** — 4 mock projects (Customer Portal Redesign, ERP Data Migration, Mobile App Development, Cloud Infra Upgrade). Project workspace has internal tabs: Overview, Milestones, Deliverables, Documents, Updates, Activity. Tab bar uses shadcn `Tabs`; on mobile it becomes a `Select` dropdown.

**Client Documents** — cross-project repo with search, filters (project/type/status/uploader), sort, upload button, table/card toggle, preview drawer.

**Client Notifications** — grouped sections, read/unread, mark-as-read simulation.

**Vendor Dashboard** — assigned projects, tasks due/overdue, pending submissions, awaiting approval, feedback, activity, milestones. 4 metric cards.

**Vendor Projects + `/:projectId`** — tabs: Overview, Tasks, Milestones, Deliverables, Documents, Client Requests, Activity. Task status changes update local state; deliverable upload/replace simulated.

**Vendor Documents** — as client documents plus visibility filter and version history.

**Settings** — simple profile/org placeholder page for both portals.

## Interactions (all frontend)

- Role switch via demo login + a small "Switch role" affordance in the sidebar footer.
- Simulated file uploads: `UploadZone` accepts files, shows progress bar animation via `setInterval`, appends to local state.
- Task status changes, notification mark-as-read, deliverable submission — `useState`/`useReducer` per page.
- Toasts via existing `sonner`.
- Confirmation dialogs via shadcn `AlertDialog`.

## States

Every list surface renders one of: loading skeleton, empty state, error state (toggleable via a hidden dev query param `?state=empty|loading|error` for demo), or data.

## Mock data volume

- 2 client orgs, 2 vendor orgs, ~8 users
- 4 projects (shared between portals so a client sees vendor's work)
- 5–8 milestones per project, 6–12 tasks per project, 4–6 deliverables, 8–15 documents total per project, 6–10 updates, 15–25 activity entries, 10 notifications, 4–6 client requests

All typed via `src/data/types.ts`. No `any`.

## Codex handoff

`docs/CODEX_HANDOFF.md` written with all 9 sections requested (Current Implementation, Backend Architecture, User Roles, Data Models, API Endpoints, Upload Flow, Integration Plan, Task Checklist, Starting Prompt). Ends with a ready-to-copy Codex prompt.

## Technical notes

- Strict TS, no `any`, small components (<200 lines target).
- Sidebar nav config is a typed array keyed by role → no hardcoded role checks in JSX.
- `ProtectedRoute` is a pass-through placeholder that reads `session.ts` and redirects to `/login` if no demo role is set. Documented as placeholder.
- Head metadata set per top-level page.
- No new dependencies needed — everything is already installed (shadcn, lucide, sonner, tanstack-router, tailwind).

## Out of scope (deferred to Codex)

Real auth, DB, storage, uploads to server, notifications delivery, permissions enforcement, pagination beyond client-side, search beyond client-side filtering.
