FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28-alpine
USER root
RUN apk add --no-cache jq
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 deploy/nginx/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
USER 101
ENV API_UPSTREAM=http://host.docker.internal:8000 MAIL_UPSTREAM=http://host.docker.internal:8080 UI_API_BASE_URL=/
EXPOSE 8080
