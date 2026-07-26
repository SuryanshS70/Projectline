# Projectline

Projectline is a project-management dashboard with separate client and vendor portals. The React
frontend now supports real email/password login, JWT session restoration, role-protected routes,
and read-only project list/detail screens backed by an Express, Prisma, and SQLite API.

Documents, notifications, activity feeds, dashboard aggregates, uploads, and settings still use the
original frontend mock data and simulations.

## Prerequisites

- Node.js 20 or newer
- npm 11 or newer

The repository uses separate npm packages and lockfiles for the frontend and backend.

## First-time setup

Install frontend dependencies:

```sh
npm install
```

Create the optional frontend environment file.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```sh
cp .env.example .env.local
```

The default frontend configuration is:

```env
VITE_API_URL=http://localhost:3001
```

Install and configure the backend:

```sh
cd server
npm install
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```sh
cp .env.example .env
```

Create and seed the SQLite database:

```sh
npm run prisma:migrate
npm run prisma:seed
```

## Run the application

Start the frontend from the repository root:

```sh
npm run dev
```

Frontend: `http://localhost:5173`

Start the backend in a second terminal:

```sh
cd server
npm run dev
```

API: `http://localhost:3001`

## Development accounts

These credentials are local development data only:

- Client: `client@example.com` / `password123`
- Vendor: `vendor@example.com` / `password123`

Passwords are bcrypt-hashed in SQLite. The demo buttons on the login page fill these credentials;
the backend user record determines the portal role.

## Authentication

- `POST /api/auth/login` verifies the bcrypt password and returns a JWT access token.
- `GET /api/auth/me` restores the current user from a Bearer token.
- `POST /api/auth/logout` acknowledges logout; the frontend clears its local session.
- Access tokens use HS256 and expire after eight hours.
- Refresh tokens and server-side token revocation are intentionally not implemented.
- The frontend stores the JWT in local storage for this internship MVP.

Project endpoints require `Authorization: Bearer <token>` and enforce `ProjectMember` membership:

- `GET /api/projects`
- `GET /api/projects/:projectId`

Unassigned and nonexistent project details both return 404.

## Validation

Frontend:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Backend:

```sh
cd server
npm run lint
npm run typecheck
npm run test
npm run build
```

## Current frontend data sources

API-backed:

- Login and current user
- Client and vendor route access
- Client and vendor project lists
- Client and vendor project overview, milestones, tasks, deliverables, and client requests

Still mock-driven:

- Dashboard aggregate/project panels
- Documents and uploads
- Notifications
- Activity feeds and project updates
- Settings

## MVP limitations

- Project APIs are read-only.
- JWTs are stored in local storage and cannot be revoked server-side before expiry.
- Logout clears the frontend token but does not blacklist it.
- There are no refresh tokens.
- Documents and uploads are not connected to the backend.
- SQLite is intended for local MVP development.
- Dependency installs continue to report unresolved high-severity advisories.

See `docs/IMPLEMENTATION_PLAN.md` for current architecture and next steps, and
`docs/CODEX_HANDOFF.md` for continuation notes.

## Lovable synchronisation

This repository remains connected to Lovable. Avoid rebasing, amending, squashing, or force-pushing
published history because those operations can remove project history from Lovable.
