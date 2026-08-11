# apps/admin — Admin Console

Standalone React app for hospital administrators, deployed and run
independently from `apps/client`. It shares the same server API
(`apps/server`, `/api/v1`) and the same `packages/*` workspaces (types, UI
components, validation schemas, hooks, constants) but is its own Vite build,
its own dev server, and its own Docker service.

## Why this exists

Previously the Admin panel lived inside `apps/client` under `/app/admin`
sharing that app's session. It has since been extracted into this standalone
app so it can be deployed, scaled, and iterated on independently of the
patient/doctor/health-officer app. See `docs/architecture.md` for the
reasoning and tradeoffs.

## Running locally

```bash
npm install            # from the repo root, once
npm run dev             # runs every app via turbo, including this one
# or, just this app:
cd apps/admin && npm run dev
```

Runs at `http://localhost:5184` and proxies `/api` and `/socket.io` to the
server on `http://localhost:5050` (see `vite.config.ts`).

With Docker: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up admin server mongo`.

## Session model

This app has its **own, independent login and session** — logging into
`apps/client` does not log you into this app, and vice versa. Both hit the
same `POST /api/v1/auth/login`, but each app keeps its access token in its
own Redux store (never localStorage) and gets its own refresh cookie scoped
to its own origin. Signing in here requires an account with `role: 'admin'`;
any other role is rejected with an inline error.

## Duplicated code

To avoid a runtime dependency between the two deployed apps, `apps/admin`
duplicates (and trims to only what it needs) a handful of RTK Query slices
that are also used by other roles in `apps/client`:

- `src/features/doctor/doctorApi.ts`
- `src/features/healthOfficer/healthOfficerApi.ts`
- `src/features/patient/patientApi.ts`
- `src/features/appointment/appointmentApi.ts`
- `src/features/notification/notificationApi.ts`

If the underlying server endpoints for any of these change shape, update
both apps' copies. Everything else under `src/features/` here (admin, hospital,
settings, auditLog, report) is admin-exclusive and lives only in this app.

## Pages

Dashboard, Hospitals, Doctors, Health Officers, Patients, Appointments,
Analytics, Audit Logs, User Management, Notification Center, Settings.

## Deployment

One Dockerfile (`apps/admin/Dockerfile`), same two-stage pattern as
`apps/client`'s: builds the Vite app, then serves it from its own
`nginx:alpine` container (`nginx/conf.d/admin.conf`) which also reverse-proxies
`/api` and `/socket.io` to the `server` container. In production, this app's
deployed origin must be added to the server's `CLIENT_URL` env var
(comma-separated with client's origin) for CORS + cookies to work — local
dev needs no server changes since CORS auto-allows any `localhost:<port>`
origin in non-production.
