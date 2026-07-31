# Architecture

## Monorepo layout

```
telemedicine-management-system/
├── apps/
│   ├── client/     React 19 + Vite SPA — Patient/Doctor/Health Officer dashboards
│   ├── server/     Express + MongoDB API, Socket.io, cron jobs
│   └── admin/      React 19 + Vite SPA — standalone Admin Console (own login/session/deploy)
├── packages/
│   ├── config/     Shared eslint/typescript/prettier/tailwind/vitest presets
│   ├── types/      Domain TypeScript interfaces shared client ↔ server
│   ├── constants/  Roles, appointment status, API route strings, socket events
│   ├── validation/ Zod schemas for client-side form validation (RHF resolvers)
│   ├── ui/         Shared MUI components (DataTable, StatCard, PageHeader, ...)
│   ├── hooks/      Shared React hooks (useDebounce, useSocket, ...)
│   └── shared/     Cross-cutting type-only contracts
├── docker/, nginx/, docs/, scripts/, .github/workflows/
└── docker-compose.yml, turbo.json, package.json
```

## `apps/admin` — standalone Admin Console

Admin is deployed as its own app (`apps/admin`), separate from `apps/client`,
with its own dev server/port, its own login page, and its own Docker service.
It hits the same `POST /api/v1/auth/login` as every other role, but keeps an
independent in-memory session (Redux-only access token, never localStorage)
and its own refresh cookie scoped to its own origin — there is no
cross-origin cookie/session sharing between the two apps by design, since
that would introduce SameSite/domain complexity for little benefit.

This means auth wiring, the RTK Query base API, and theming are each
duplicated between `apps/client` and `apps/admin` (both consume the same
`packages/*` workspaces, but each has its own `store/api/baseApi.ts`,
`authSlice.ts`, etc.). `apps/admin` also duplicates a trimmed subset of a few
RTK Query slices that are also used by other roles in `apps/client`
(`doctorApi`, `healthOfficerApi`, `patientApi`, `appointmentApi`,
`notificationApi`) — see `apps/admin/README.md` for the full list and the
maintenance implication of that duplication.

## Server layering

The codebase is organized as **feature modules** (`apps/server/src/modules/<feature>/`),
each following the same file set:

| File | Layer | Responsibility |
|---|---|---|
| `*.model.ts` | Database | Mongoose schema, indexes, validation |
| `*.repository.ts` | Repository | Pure Mongoose queries, no business logic |
| `*.service.ts` | Business + Service | Orchestration, business rules, cross-module calls |
| `*.controller.ts` | Presentation | HTTP request/response mapping only |
| `*.routes.ts` | Presentation | Route wiring, middleware composition |
| `*.validation.ts` | — | express-validator chains (the real security boundary) |
| `*.socket.ts` | — | Socket.io emit helpers / inbound event handlers for this feature |
| `*.middleware.ts` | — | Feature-specific middleware (ownership guards, rate limits) |
| `*.types.ts` | — | Server-internal DTOs |

Requests flow: `routes → validation middleware → controller → service → repository → model`.

## Auth & session model

- **Access token**: JWT, 15 minutes, `Authorization: Bearer` header, never persisted server-side.
- **Refresh token**: JWT, 7 days, httpOnly/secure/sameSite=strict cookie, hashed and persisted in a `Session` collection (not on `User`) so multi-device sessions can be listed/revoked.
- **Rotation + reuse detection**: every refresh rotates the token and revokes the old `Session`. If an already-revoked refresh token is presented again, the entire rotation `family` is revoked — a signal of token theft. Covered by `apps/server/src/modules/auth/auth.test.ts`.
- Admin/Doctor/Health-Officer accounts created via the management screens (not self-registration) go through `authService.provisionAccount` — a random unusable password is set, and the user gets a "set your password" email reusing the password-reset token flow.

## Validation split

Two independent passes, not one shared runtime schema:
- **`packages/validation` (Zod)** — client-side UX gate consumed by `zodResolver` in React Hook Form. Format/shape only.
- **Server `*.validation.ts` (express-validator)** — the real security boundary. Never trusts the client; does DB-uniqueness checks and business rules the client can't.

## Real-time (Socket.io)

Every authenticated socket connection joins a `user:<userId>` room on connect
(`apps/server/src/sockets/socket.server.ts`). Feature modules emit into that
room directly (see `appointment.socket.ts`, `notification.socket.ts`,
`message.socket.ts`) rather than the server tracking per-feature subscriber
lists. `video.socket.ts` is the exception — it's a pure WebRTC signaling relay
using ad-hoc `video:<roomId>` rooms joined on demand, forwarding
offer/answer/ICE payloads between exactly the two participants; no media ever
touches the server.

## Deployment topology

One Dockerfile per app. `apps/client`'s and `apps/admin`'s images are both
multi-stage builds ending in `nginx:alpine` that serve their static build
**and** reverse-proxy `/api` and `/socket.io` to the `server` container —
this collapses "nginx" and "app" into one Compose service per frontend
instead of a shared nginx instance. See `nginx/nginx.conf` /
`nginx/conf.d/default.conf` (client) / `nginx/conf.d/admin.conf` (admin) for
the proxy rules and `docker-compose.yml` for the four-service topology
(`mongo`, `server`, `client`, `admin`).
