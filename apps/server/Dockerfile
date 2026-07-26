# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/server ./apps/server

RUN npm install --workspaces --include-workspace-root --ignore-scripts

# @telemedicine/constants is imported with real (non type-only) values at
# runtime (Socket.io event names) — it must be compiled to CommonJS before
# the server can `require()` it under plain Node, unlike Vite/ts-node-dev
# which transpile workspace TS packages on the fly.
RUN npm run build --workspace=@telemedicine/constants

WORKDIR /repo/apps/server
RUN npm run build

# Drop devDependencies now that the TypeScript build is done — the runtime
# image only needs what dist/ actually requires at runtime.
WORKDIR /repo
RUN npm prune --omit=dev --workspaces --include-workspace-root

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN npm install -g pm2 && addgroup -S telemedicine && adduser -S telemedicine -G telemedicine

COPY --from=build /repo/apps/server/dist ./dist
COPY --from=build /repo/apps/server/ecosystem.config.js ./ecosystem.config.js
COPY --from=build /repo/apps/server/package.json ./package.json
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/packages ./packages

RUN mkdir -p src/logs src/uploads src/storage && chown -R telemedicine:telemedicine /app
USER telemedicine

EXPOSE 5000
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
