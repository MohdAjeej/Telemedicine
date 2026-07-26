# Docker

Each app owns its own `Dockerfile` (`apps/server/Dockerfile`,
`apps/client/Dockerfile`) since they colocate the build context most
naturally with the code they build. This directory is kept as the
top-level `docker/` location the project structure calls for; the
orchestration itself lives in the root [`docker-compose.yml`](../docker-compose.yml)
(and its local-dev override, [`docker-compose.dev.yml`](../docker-compose.dev.yml)),
and the Nginx reverse-proxy config the client image bundles lives in
[`../nginx/`](../nginx).
