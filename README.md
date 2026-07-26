# Telemedicine Management System

An enterprise telemedicine platform for hospitals, clinics, doctors, health
officers, patients, and administrators — appointment booking and approval,
video consultations, real-time chat, vitals/prescriptions/lab results,
billing, and role-based dashboards for all four user types.

See [`docs/architecture.md`](docs/architecture.md) for the system design
(monorepo layout, server layering conventions, auth/session model,
deployment topology) and [`docs/ENV_VARS.md`](docs/ENV_VARS.md) for
environment variable reference.

## Tech stack

- **Frontend**: React 19, Vite, TypeScript, Material UI, Tailwind CSS, Redux Toolkit + RTK Query, React Hook Form, React Router v7, Socket.io client, WebRTC, i18next, PWA
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT + refresh-token rotation, Socket.io, Winston, express-validator, Helmet
- **Monorepo**: npm workspaces + Turborepo
- **Deployment**: Docker, Docker Compose, Nginx, PM2, GitHub Actions

## Project structure

```
apps/
  client/   React SPA — all four role dashboards (Admin/Doctor/Health Officer/Patient)
  server/   Express API, Socket.io, cron jobs
  admin/    Reserved placeholder — see docs/architecture.md for why
packages/
  config/ types/ constants/ validation/ ui/ hooks/ shared/
```

## Quick start (Docker — recommended)

Requires Docker + Docker Compose.

```bash
cp apps/server/.env.example apps/server/.env   # edit as needed
cp apps/client/.env.example apps/client/.env

export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"

docker compose up -d --build
```

- Client: http://localhost:8080
- API health check: http://localhost:8080/api/v1/health
- MongoDB is exposed on host port `27019` (mapped to avoid clashing with other local MongoDB instances)

Seed demo accounts (requires the stack to be running):

```bash
docker compose exec server node -r ts-node/register/transpile-only src/scripts/seed.ts
```

or, running the API locally against the composed Mongo instance:

```bash
MONGO_URI=mongodb://localhost:27019/telemedicine npm run seed
```

Demo accounts (password `Password123` for all):

| Role | Email |
|---|---|
| Admin | `admin@telemedicine.local` |
| Doctor | `doctor@telemedicine.local` |
| Health Officer | `healthofficer@telemedicine.local` |
| Patient | `patient@telemedicine.local` |

## Local development (without Docker)

Requires Node.js 20+, npm 10+, and a running MongoDB instance.

```bash
npm install
cp apps/server/.env.example apps/server/.env   # set MONGO_URI, JWT secrets
cp apps/client/.env.example apps/client/.env

npm run dev   # runs client (5173) and server (5000) together via Turborepo
```

The Vite dev server proxies `/api` and `/socket.io` to `localhost:5000`
(see `apps/client/vite.config.ts`), so no CORS configuration is needed in
development.

## Common scripts (from the repo root)

| Command | What it does |
|---|---|
| `npm run dev` | Run all apps in dev mode (Turborepo) |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run test` | Run all test suites (Vitest) |
| `npm run seed` | Seed the database with demo accounts and sample data |

Server-specific: `npm run dev --workspace=apps/server`, `npm run test --workspace=apps/server`, etc.

## Testing

- **Server**: Vitest + Supertest + `mongodb-memory-server` (no real database needed). Covers the full auth lifecycle (register → verify → login → refresh rotation → reuse detection → logout) and the appointment booking/approval/conflict flow.
- **Client**: Vitest + React Testing Library.

```bash
npm run test --workspace=apps/server
npm run test --workspace=apps/client
```

## What's implemented vs. scaffolded

This was built in phases, narrow-and-deep: the infra, auth, and core entity
modules (Hospitals, Doctors, Patients, Health Officers, Appointments) are
full production-quality implementations with tests. The **Admin panel is
complete** — Dashboard, Hospital/Doctor/Health Officer/Patient/Appointment
management, real Analytics charts, Audit Logs (filterable), User Management
(cross-role listing, suspend/reactivate, permission tags), System Settings,
and a full Notification Center all have working backend endpoints and
frontend screens. The remaining modules (Consultations, Prescriptions,
Vitals, Medical Records, Lab Reports, Notifications, Messaging, Video
signaling, Reports, Invoices, Payments) have real, working backend CRUD and
are wired into the API and socket layer — but not every one has a dedicated
frontend screen yet outside of Admin/Patient views (no stub 404s anywhere,
just a documented next step).

Known follow-ups:
- Full **WebRTC video call UI** (the signaling backend and room-assignment logic are complete; the client only has a placeholder screen)
- **Doctor-side** UI for recording vitals, writing prescriptions, and requesting labs (the APIs exist and are exercised by the patient-facing read views and the Admin panel)
- Route-level code-splitting on the client (bundle currently ships as one chunk; see the Vite build warning)

## License

Proprietary — internal project.
