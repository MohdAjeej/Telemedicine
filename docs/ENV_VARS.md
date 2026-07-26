# Environment Variables

## `apps/server/.env` (copy from `apps/server/.env.example`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `development` \| `test` \| `production` |
| `PORT` | no | `5050` | HTTP port the API listens on (deliberately not 5000, a common collision) |
| `CLIENT_URL` | no | `http://localhost:5173` | Comma-separated list of allowed CORS/socket origins |
| `MONGO_URI` | **yes** | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **yes** | — | Signing secret for 15-minute access tokens |
| `JWT_ACCESS_EXPIRES_IN` | no | `15m` | Access token lifetime |
| `JWT_REFRESH_SECRET` | **yes** | — | Signing secret for 7-day refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | no | `7d` | Refresh token lifetime |
| `REFRESH_COOKIE_NAME` | no | `telemedicine_refresh_token` | httpOnly cookie name carrying the refresh token |
| `BCRYPT_SALT_ROUNDS` | no | `12` | Password hashing cost factor |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` | no | — | SMTP transport for verification/reset/welcome emails. Left empty in local dev — emails are logged as a warning and skipped rather than failing the request. |
| `MAIL_FROM` | no | `Telemedicine Platform <no-reply@telemedicine.local>` | From address for outgoing email |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | — | File upload storage; required once file upload endpoints are exercised |
| `RATE_LIMIT_WINDOW_MS` | no | `900000` | Global rate-limit window (15 min) |
| `RATE_LIMIT_MAX` | no | `300` | Max requests per window per IP, global |
| `AUTH_RATE_LIMIT_MAX` | no | `20` | Max requests per window per IP, on `/auth/*` |
| `LOG_LEVEL` | no | `info` | Winston log level |

`apps/server/src/config/env.ts` validates all of these at boot with Zod and
**fails fast** — a missing required variable is a startup error, not a
runtime surprise.

## `apps/client/.env` (copy from `apps/client/.env.example`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | no | `/api/v1` | Base URL the RTK Query client sends requests to |
| `VITE_SOCKET_URL` | no | `/` | Socket.io server URL |

In the Docker Compose topology these are baked in at build time (see
`apps/client/Dockerfile` build args) because nginx proxies `/api` and
`/socket.io` to the `server` container — the client never needs an absolute
URL in that setup. Override them only if you deploy the client separately
from the API.

## `docker-compose.yml` overrides

`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` fall back to insecure defaults
(`dev-access-secret-change-me` / `dev-refresh-secret-change-me`) if not set
in your shell environment. **Always set real secrets before deploying**:

```bash
export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
docker compose up -d
```
