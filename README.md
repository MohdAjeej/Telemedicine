# Telemedicine Management System

An enterprise telemedicine platform for hospitals, clinics, doctors, health
officers, patients, and administrators — appointment booking and approval,
video consultations, real-time chat, vitals/prescriptions/lab results,
billing, and role-based dashboards for all four user types, split across
two independently deployed frontends (a patient/clinical app and a
standalone admin console) sharing one API.

See [`docs/architecture.md`](docs/architecture.md) for the system design
(monorepo layout, server layering conventions, auth/session model,
deployment topology) and [`docs/ENV_VARS.md`](docs/ENV_VARS.md) for
environment variable reference.

## Tech stack

- **Frontend**: React 19, Vite, TypeScript, Material UI, Tailwind CSS, Redux Toolkit + RTK Query, React Hook Form, React Router v7, Socket.io client, WebRTC, Recharts, i18next, PWA (client only)
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT + refresh-token rotation, Socket.io, Winston, express-validator, Helmet
- **Monorepo**: npm workspaces + Turborepo
- **Deployment**: Docker, Docker Compose, Nginx, GitHub Actions

## Project structure

```
telemedicine/
├── apps/
│   ├── client/         Patient / Doctor / Health Officer SPA (port 5173)
│   ├── admin/          Standalone Admin Console SPA (port 5174)
│   └── server/         Express + MongoDB API (port 5050 dev / 5000 in containers)
│
├── packages/
│   ├── types/          Domain TypeScript interfaces shared client ↔ admin ↔ server
│   ├── constants/      Roles, appointment status, API route strings, socket events
│   ├── validation/     Zod schemas for client-side form validation (RHF resolvers)
│   ├── ui/             Shared MUI component library (DataTable, StatCard, PageHeader, ...)
│   ├── hooks/          Shared React hooks (useDebounce, useSocket, usePagination, ...)
│   ├── shared/         Cross-cutting type-only contracts
│   └── config/         Shared eslint / typescript / prettier / tailwind / vitest presets
│
├── docker/             Per-app Dockerfiles are colocated with their app; this documents that
├── nginx/              nginx.conf + one conf.d/*.conf per frontend app
├── docs/               architecture.md, ENV_VARS.md
├── scripts/            seed.ts and other repo-level tooling
├── .github/workflows/
│
├── docker-compose.yml       Production-style 4-service stack (mongo, server, client, admin)
├── docker-compose.dev.yml   Hot-reload override for local development
├── turbo.json
└── package.json             npm workspaces root (apps/*, packages/*)
```

### `apps/client` structure

```
apps/client/src/
├── app/            Redux store + typed hooks
├── components/     ProtectedRoute, RoleRoute, GuestOnlyRoute, layout/ (DashboardShell, NotificationBell)
├── features/       <domain>/<domain>Api.ts (RTK Query) + <domain>/pages/*.tsx, one folder per feature
├── hooks/          App-local hooks (e.g. useWebRTC)
├── i18n/           i18next setup + locales
├── layouts/        RootLayout, AuthLayout, DoctorLayout, HealthOfficerLayout, PatientLayout
├── lib/            axios instance (for the rare non-RTK-Query call)
├── pages/          Route-level pages not tied to one feature (Home, dashboards, NotFound, ...)
├── routes/         One *Routes.tsx per role + the composed router in routes/index.tsx
├── store/api/      baseApi.ts — the RTK Query base with the auth-refresh wrapper
├── theme/          ThemeProvider (wraps @telemedicine/ui's MUI theme)
└── tests/          Vitest setup + tests
```

### `apps/admin` structure

Mirrors `apps/client`'s layout exactly (same `app/ components/ features/ layouts/ lib/ pages/ routes/ store/ theme/` folders and the same feature-folder convention), but scoped to admin-only concerns: Dashboard, Hospitals, Doctors, Health Officers, Patients, Appointments, Analytics, Audit Logs, User Management, Notification Center, Settings. Its own login/session/routing — see `apps/admin/README.md`.

### `apps/server` structure

```
apps/server/src/
├── config/         env.ts (zod-validated env), database, cors
├── modules/        One folder per feature: *.model.ts, *.repository.ts, *.service.ts,
│                   *.controller.ts, *.routes.ts, *.validation.ts, *.types.ts
├── middlewares/    authenticate, authorize(...roles), rate limiting, error handling
├── sockets/        Socket.io server + per-feature emit helpers
├── cron/           Scheduled jobs
├── scripts/        seed.ts
└── tests/          Vitest + Supertest + mongodb-memory-server
```

Request flow: `routes → validation middleware → controller → service → repository → model`. See `docs/architecture.md` for the full layering table.

## Quick start (Docker — recommended)

Requires Docker + Docker Compose.

```bash
cp apps/server/.env.example apps/server/.env   # edit as needed
cp apps/client/.env.example apps/client/.env
cp apps/admin/.env.example apps/admin/.env

export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"           

docker compose up -d --build
```

- Client (Patient/Doctor/Health Officer): http://localhost:8080
- Admin Console: http://localhost:8081
- API health check: http://localhost:8080/api/v1/health
- MongoDB is exposed on host port `27019` (mapped to avoid clashing with other local MongoDB instances)

The Admin Console is a **separate app with its own login/session** — signing
into the client does not sign you into the admin console, and vice versa.
For production, the admin console's deployed origin must be added to the
server's `CLIENT_URL` env var (comma-separated with the client's origin);
locally, no server config is needed since CORS auto-allows any
`localhost:<port>` origin outside of production.

Seed demo accounts (requires the stack to be running):

```bash
docker compose exec server npx ts-node --transpile-only src/scripts/seed.ts
```

or, running the API locally against the composed Mongo instance:

```bash
cd apps/server && MONGO_URI=mongodb://localhost:27019/telemedicine npx ts-node --transpile-only src/scripts/seed.ts
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
cp apps/admin/.env.example apps/admin/.env

npm run dev   # runs client (5173), admin (5174), and server (5050) together via Turborepo
```

Both Vite dev servers proxy `/api` and `/socket.io` to `localhost:5050`
(see `apps/client/vite.config.ts` and `apps/admin/vite.config.ts`), so no
CORS configuration is needed in development. (Port 5050 — not the more
common 5000 — specifically to avoid colliding with other local dev servers
you might already have running.)

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

## Functionality by role

### Admin (`apps/admin` — standalone Admin Console)
- Dashboard — hospital/doctor/patient/appointment counts, appointment status breakdown
- Hospital management — list + create (multi-tenant: each admin belongs to one hospital)
- Doctor management — list + create
- Health Officer management — list + create
- Patient management — list (read-only view)
- Appointment management — list, confirm, complete, mark no-show, cancel
- Analytics — appointments-by-status, appointments-over-time, doctor utilization, patient demographics (Recharts)
- Audit Logs — filterable by action / entity type / date range
- User Management — cross-role user list, search/filter by role & status, suspend/activate, admin permission tags
- Notification Center — full notification history, mark read / mark all read
- System Settings — platform name, support email, default appointment slot length, maintenance mode

### Doctor (`apps/client`)
- Dashboard, appointment list, consultation list
- Start / complete consultations from confirmed appointments
- Record patient vitals (BP, heart rate, temperature, SpO2, weight, height)
- Create prescriptions (multiple medications)
- Request lab tests
- Video consultations (WebRTC)
- Own profile management

### Health Officer (`apps/client`)
- Dashboard, today's patient queue
- Register new patients
- Record vitals intake
- Confirm / manage appointments
- Own profile management

### Patient (`apps/client`)
- Dashboard, book appointments
- Medical records, vitals history, lab results, prescriptions
- Consultation history and detail view
- Video consultations (WebRTC)
- Profile management

### Public / pre-auth (`apps/client`)
- Marketing home page
- Single login (role auto-detected server-side, redirects to the right dashboard)
- Patient self-registration
- Hospital + Admin bootstrap registration ("Register your hospital") — creates a new Hospital and its first Admin together, then directs them to sign in at the Admin Console

## What's implemented vs. scaffolded

This was built in phases, narrow-and-deep: the infra, auth, and core entity
modules (Hospitals, Doctors, Patients, Health Officers, Appointments) are
full production-quality implementations with tests. Every feature listed
above under "Functionality by role" has a working backend endpoint and a
working frontend screen — none of it is mocked or stubbed. WebRTC video
consultations use real peer-to-peer streaming with Socket.io signaling
(offer/answer/ICE exchange), picture-in-picture local/remote video,
mute controls, and connection-state monitoring, for both doctor and patient
roles. The remaining modules not called out by name above (Consultations,
Prescriptions, Vitals, Medical Records, Lab Reports, Notifications,
Messaging, Video signaling, Reports, Invoices, Payments) all have real,
working backend CRUD and are wired into the API and socket layer.

### Known follow-ups:
- Route-level code-splitting on the client and admin apps (each currently ships as one chunk; see the Vite build warning)

## License

Proprietary — internal project.
