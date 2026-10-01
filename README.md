# Hermes UI

React, TypeScript, and Vite application for IPO subscriptions and mail alerts.
Use Node.js 24 (see `.nvmrc`). Existing auxiliary mailing, jobs, and sheets
modules are retained; the current IPO workspace is routed independently.

## Structure

```text
src/
  main.tsx                         React entry point
  app/
    App.tsx                        Providers and render-error boundary
    providers/                     Redux and browser routing
    routes/                        Lazy-loaded page routes
    api.ts                         Shared RTK Query client
    store.ts                       Store factory and listener setup
  features/
    ipos/                          Dashboard, subscription table, API, types, formatting
    mailing-lists/                 List management, API, selection hook
    alerts/                        Triggers, IPO controls, event history, API, types
    mailing/, jobs/, sheets/       Existing auxiliary features
  components/
    layout/                        Workspace header and navigation
    feedback/                      Shared request and render errors
    ui/                            Existing UI primitives
  config/                          Public runtime configuration
  hooks/                           Shared action feedback
  lib/                             Common helpers and API error formatting
  styles/                          Base and workspace styles
  test/                            API mocks, fixtures, test rendering
e2e/                               Desktop/mobile browser workflows
deploy/nginx/                      Static hosting, API proxy, runtime config
```

Components use typed feature API hooks instead of issuing fetch calls.
RTK Query shares requests and cached data, invalidates affected queries after
successful mutations, and refetches on reconnect/focus. Form state stays local.
A failed mutation preserves entered values and shows the error beside the form.

## Local Development

```sh
nvm use
npm ci
npm run dev -- --host 127.0.0.1
```

The API should run separately. Configure local `.env` values using
`.env.example` as a reference:

| Variable | Purpose |
| --- | --- |
| `API_PROXY_TARGET` | Vite server-side proxy for `/api`; defaults to `http://localhost:8000` |
| `MAIL_PROXY_TARGET` | Existing `/mail` and `/auth` service; defaults to `http://localhost:8080` |
| `VITE_API_BASE_URL` | Optional public build-time base URL; defaults to `/` |
| `UI_API_BASE_URL` | Public API base URL injected when the container starts |
| `API_UPSTREAM` | Nginx's backend upstream, separate from browser configuration |
| `MAIL_UPSTREAM` | Nginx upstream for the existing mail/auth integration |
| `UI_BIND_ADDRESS`, `UI_PORT` | Container host binding; defaults to `127.0.0.1:3000` |

API base URLs must point to the server root, since endpoint paths already
contain `api/`. Prefer the same-origin proxy. Cross-origin deployments must
configure backend CORS appropriately. Browser-visible configuration is public:
never place database passwords, SMTP credentials, or other secrets in
`VITE_*` values or `public/config.js`.

## Routes and Behavior

- `/`: IPO dashboard, subscription table, refresh, manual email.
- `/alerts`: mailing lists, triggers, pause/resume, recent alert history.
- Other paths show a not-found page.

Pages are lazy-loaded. Navigation works with browser back/forward and direct
links. India-market dates are calculated using `Asia/Kolkata`.
Controls show pending state and prevent repeated submissions. Manual email
delivery distinguishes sent, logged, and failed results.

## Verification

```sh
npm run lint
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

Vitest and Testing Library verify API caching, errors/retry, form submission,
selection invalidation, and market-date formatting using MSW.
Playwright covers the main workflows at desktop/mobile sizes, direct-route
reloads, and page overflow; it uses mocked API responses. Browser screenshots
and failure traces are written under `test-results/`.

`npm run test:watch` runs component tests interactively.
`npm run format` formats source files with Prettier.
GitHub Actions runs lint, component tests, build, browser checks, Compose
validation, and a container image build.

## Production Deployment

```sh
docker compose up --build -d
```

The image builds with Node 24 and serves static files with non-root Nginx on
port 8080. Compose publishes `http://127.0.0.1:3000` by default. The
`/healthz` endpoint checks static-server liveness.

By default Nginx proxies to host services at
`http://host.docker.internal:8000` and `:8080`. On Linux, host services
must accept connections from Docker's bridge network. For deployment alongside
backend containers, join their network and set the upstreams to their service
DNS names. TLS/access control should be handled by the deployment gateway.

`UI_API_BASE_URL` is serialized into `config.js` at container startup, so
one built image can be used across environments. The browser loads this
configuration before the app bundle. `config.js` is served without caching.
Hashed assets are cached immutably; HTML is revalidated.

Nginx forwards API errors to the browser and serves `index.html` for application
routes such as `/alerts`. It does not use the SPA fallback for `/api/` or
missing hashed assets. On another static host, configure the same route
fallback and API proxy.

For a static build without Docker:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

Vite preview is for checking the bundle, not production hosting. It does not
provide the production Nginx proxy configuration.
