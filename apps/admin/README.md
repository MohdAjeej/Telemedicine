# apps/admin — intentionally empty

This folder is a reserved placeholder, not a bug or an unfinished build.

**The Admin Panel is not a separate app.** All four roles (Admin, Doctor,
Health Officer, Patient) — including the full Admin module list (Dashboard,
Hospital/Doctor/Health Officer/Patient/Appointment Management, Analytics,
Audit Logs, System Settings, Notification Center, User/Role Management) —
live inside **`apps/client`**, the single React SPA, as role-gated routes
under `/app/admin/*`. See `docs/architecture.md` § "Why no separate
`apps/admin`" for the reasoning: every role shares one JWT/session model,
not separate security perimeters, so splitting Admin into its own deployed
app would just duplicate auth wiring, theming, and the API client for no
real isolation benefit.

**To see the Admin Panel**, run the app (see the root `README.md` — either
`npm run dev` for local development, or `docker compose up -d --build`) and
log in with an admin account at the client's URL. The sidebar
(`apps/client/src/layouts/AdminLayout.tsx`) and its routes
(`apps/client/src/routes/adminRoutes.tsx`) are where that panel actually
lives in the source tree.

If a genuinely separate, independently-deployed admin surface is ever
needed, it can be extracted from `apps/client/src/{pages,features}/admin`
at that time — this folder is kept reserved for exactly that.
