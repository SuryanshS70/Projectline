# Projectline

Projectline is a project-management dashboard prototype with separate client and vendor portals.
The existing React frontend still uses mock data and simulated interactions. A small Express,
Prisma, and SQLite API now provides the first backend foundation without changing the frontend
design or routes.

## Prerequisites

- Node.js 20 or newer
- npm 11 or newer

The repository uses npm lockfiles for reproducible installs.

## Frontend

Install dependencies from the repository root:

```sh
npm install
```

Run the frontend on the URL expected by the backend example configuration:

```sh
npm run dev
```

Open `http://localhost:5173`.

Useful frontend checks:

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

## Backend

Install the separate backend dependencies:

```sh
cd server
npm install
```

Create the local environment file.

PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```sh
cp .env.example .env
```

Create the SQLite database and add development data:

```sh
npm run prisma:migrate
npm run prisma:seed
```

Start the backend:

```sh
npm run dev
```

The default API address is `http://127.0.0.1:3001`.

Available endpoints:

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/:projectId`

Useful backend checks:

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm start
```

## Development seed accounts

These credentials are local seed data only. Authentication endpoints are not implemented yet.

- Client: `client@example.com` / `password123`
- Vendor: `vendor@example.com` / `password123`

Passwords are stored in SQLite as bcrypt hashes.

## Current limitations

- The frontend is not connected to the API and continues to use `src/data/` mock data.
- Login and route protection remain simulated; there are no JWT or refresh-token endpoints.
- Project data is read-only through the API.
- Document upload and object storage are not implemented.
- SQLite is intended for local MVP development, not the final production database.
- Package installation reports unresolved high-severity advisories. A registry audit was not
  authorised in the current environment, so advisory details and safe upgrade paths still require
  review.

See `docs/IMPLEMENTATION_PLAN.md` for the current architecture and recommended next steps, and
`docs/CODEX_HANDOFF.md` for continuation notes.

## Lovable synchronisation

This repository remains connected to Lovable. Avoid rebasing, amending, squashing, or force-pushing
published history because those operations can remove project history from Lovable.
