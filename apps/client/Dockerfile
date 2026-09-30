# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /repo

# Copy package files first for better caching
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/client ./apps/client

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN npm install --workspaces --include-workspace-root --ignore-scripts --no-optional

WORKDIR /repo/apps/client
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SOCKET_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Add Node.js flags to avoid webidl issues
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV DOCKER_BUILD=true

# Build the application
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /repo/apps/client/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
