# API Reference

The OpenAPI specification lives at
[`apps/server/src/docs/openapi.yaml`](../apps/server/src/docs/openapi.yaml).
It documents the `auth` and `appointments` modules in full as the reference
pattern — every other module listed in the root README follows the same
conventions:

- **Auth**: `Authorization: Bearer <accessToken>` header; the refresh token
  never appears in JSON, only as an httpOnly cookie scoped to `/api/v1/auth`.
- **Response envelope**: `{ success: true, message, data }` on success,
  `{ success: false, message, errors? }` on failure (see
  `apps/server/src/middlewares/errorHandler.middleware.ts`).
- **Pagination**: list endpoints accept `?page=&limit=` and return
  `meta: { total, page, limit, totalPages }` alongside `data`.
- **Base path**: `/api/v1`, mounted per module in `apps/server/src/routes/index.ts`.

To view the spec rendered, paste the YAML into any OpenAPI viewer (e.g.
Swagger Editor) — no viewer is bundled with this project to keep the
production image lean.
