# Architecture

## Monorepo layout

```
telemedicine-management-system/
├── apps/
│   ├── client/     React 19 + Vite SPA — all four role dashboards live here
│   ├── server/     Express + MongoDB API, Socket.io, cron jobs
│   └── admin/      Reserved placeholder (see "Why no separate admin app" below)
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

## Why no separate `apps/admin`

Every role (Admin/Doctor/Health Officer/Patient) is a set of dashboards and
permissions inside **one** authenticated React app (`apps/client`), not four
separately deployed products. They share a single JWT/session model and are
not different security perimeters — Admin is a role claim, not a different
app. Splitting it out would duplicate auth wiring, the RTK Query base API,
theming, and i18n for no isolation benefit at this scale. `apps/admin/` is
kept as an empty, reserved workspace so the literal folder tree the project
was scoped against still exists, in case a genuinely separate, independently
deployed admin surface (e.g. an air-gapped ops console) is ever needed.

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

One Dockerfile per app. `apps/client`'s image is a multi-stage build ending
in `nginx:alpine` that serves the static build **and** reverse-proxies `/api`
and `/socket.io` to the `server` container — this collapses "nginx" and
"client" into one Compose service instead of a fourth standalone one. See
`nginx/nginx.conf` / `nginx/conf.d/default.conf` for the proxy rules and
`docker-compose.yml` for the three-service topology (`mongo`, `server`, `client`).
