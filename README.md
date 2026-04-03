# Fynd Extension Boilerplate

A production-grade Fynd Platform extension starter with **fit library integration**, **MultiLevelStorage**, **webhook support**, and a **React 18 + Vite** frontend.

This boilerplate mirrors the internal GoFynd extension pattern (promo-tagger, pan-verify, extension-boilerplate) and is designed to be cloned and renamed for any new extension.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [fit Library](#fit-library)
- [FDK Setup](#fdk-setup)
- [Webhooks](#webhooks)
- [Frontend](#frontend)
- [API Routes](#api-routes)
- [Building for Production](#building-for-production)
- [Docker](#docker)
- [Renaming for Your Extension](#renaming-for-your-extension)

---

## Architecture Overview

```
Browser (React 18)
      │
      │  /company/:company_id
      │  /company/:company_id/application/:application_id
      ▼
Express Server  (fit/server)
      │
      ├── /env.js              → browser config injection
      ├── /                    → FDK handler (OAuth, session, platformClient)
      ├── /api/webhook-events  → webhook processor
      ├── /api/v1/*            → platform API routes (req.platformClient available)
      └── /*                   → SPA fallback → frontend/public/dist/index.html
```

**Startup sequence:**

```
index.js
  └── dotenv.config()
  └── set process.env (fit connection keys)
  └── Promise.all([mongo.init(), redis.init()])   ← fit initializes connections
        └── require("./app/server")
              └── Server.init() + Server.start()   ← fit/server starts Express
```

---

## Project Structure

```
Fynd-extension-Boilerplate/
│
├── index.js                        Entry point — fit init + mode switch
├── package.json
├── Dockerfile
├── fdk.ext.config.json             FDK CLI config (for fdk extension preview)
├── .env.example                    All env vars documented
│
├── app/
│   ├── server.js                   Express setup via fit/server
│   │
│   ├── fdk/
│   │   └── index.js                setupFdk() — THE most critical file
│   │                               Wires: MultiLevelStorage, auth/install/uninstall
│   │                               callbacks, webhook_config
│   │
│   ├── common/
│   │   ├── config.js               convict schema — all env vars validated at startup
│   │   └── logger.js               fit/tracing logger (structured JSON, Winston)
│   │
│   ├── connections/
│   │   ├── mongo.js                Fit.connections.mongo[key].write
│   │   ├── redis.js                Fit.connections.redis[key].write
│   │   └── sentry.js               Sentry init (disabled when SENTRY_DSN is empty)
│   │
│   ├── constants/
│   │   └── index.js                APP_IDENTIFIER, DB_NAME, mongoOptions
│   │
│   ├── routes/
│   │   └── v1.router.js            Example platform routes using req.platformClient
│   │
│   ├── models/
│   │   └── company.model.js        Example Mongoose schema
│   │
│   ├── middlewares/
│   │   └── error.middleware.js     Global Express error handler
│   │
│   └── webhook/
│       ├── event-map.js            Webhook event registry
│       └── handlers.js             Webhook handler functions
│
└── frontend/
    ├── index.html                  Loads /env.js for runtime config
    ├── index.jsx                   React 18 entry — RouterProvider
    ├── router.jsx                  Route definitions (company + app-level)
    ├── App.jsx                     Root component — reads useParams()
    ├── package.json                React 18 + Vite (separate from backend)
    ├── vite.config.js              Dev proxy → backend:8080
    │
    ├── pages/
    │   ├── Home.jsx                Main page — handles both launch contexts
    │   └── NotFound.jsx            404 fallback
    │
    ├── services/
    │   └── api.service.js          axios wrappers with x-company-id header
    │
    └── styles/
        └── global.css              Base styles
```

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node.js 18.x | Required by fit library and Vite 5 |
| MongoDB | Local or remote. Default: `localhost:27017` |
| Redis | Local or remote. Default: `localhost:6379` |
| SSH access to GoFynd Azure DevOps | Required to `npm install` the fit package |
| Fynd Partners account | To get `EXTENSION_API_KEY` and `EXTENSION_API_SECRET` |

> **fit library** is hosted at `git+ssh://git@ssh.dev.azure.com/v3/GoFynd/CommonLibraries/fit.js#v2.5.4`.
> Your machine must have an SSH key authorized for the GoFynd Azure DevOps org.

---

## Quick Start

### 1. Copy and rename

```bash
cp -r Fynd-extension-Boilerplate my-extension
cd my-extension
```

Update the extension name in two files (see [Renaming for Your Extension](#renaming-for-your-extension)).

### 2. Set up environment

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:
- `EXTENSION_API_KEY` and `EXTENSION_API_SECRET` — from Fynd Partners panel
- `EXTENSION_BASE_URL` — your ngrok/tunnel URL
- `NEW_RELIC_APP_NAME` — any non-empty string (e.g. `my-ext-dev`)
  > ⚠️ fit/tracing (used by the logger) internally requires New Relic. If this is empty,
  > you will see a `New Relic requires that you name this application!` warning on every startup.
  > The server still runs, but set it to silence the noise.

### 3. Install dependencies and build frontend

> ⚠️ **Build the frontend before starting the server.** The backend serves static files from
> `frontend/public/dist/`. If this folder doesn't exist, the extension will load a blank page
> after auth (you'll see `ENOENT: no such file or directory, stat .../index.html` in the logs).

```bash
# Install backend deps
npm install

# Install frontend deps + build Vite output → frontend/public/dist/
npm run build
```

### 4. Start local dev (two terminals)

```bash
# Terminal 1 — backend (auto-restarts on changes)
npm run dev

# Terminal 2 — frontend (Vite HMR)
cd frontend && npm run dev
```

Frontend runs at `http://localhost:5173` and proxies API calls to `http://localhost:8080`.

### 5. Expose backend with a tunnel

FDK requires a publicly reachable URL for OAuth callbacks.

```bash
# Option A: FDK tunnel (recommended)
fdk extension preview

# Option B: ngrok
ngrok http 8080
```

Set the tunnel URL as `EXTENSION_BASE_URL` in `.env` and update the **Launch URL** in your Fynd Partners panel to match.

---

## Environment Variables

All variables are validated at startup by `convict` in `app/common/config.js`. The server **will not start** if a required variable is missing or invalid.

| Variable | Required | Description |
|----------|----------|-------------|
| `EXTENSION_API_KEY` | Yes | From Fynd Partners panel |
| `EXTENSION_API_SECRET` | Yes | From Fynd Partners panel |
| `EXTENSION_BASE_URL` | Yes | Public URL (must match Partners panel Launch URL) |
| `EXTENSION_CLUSTER_URL` | Yes | `https://api.fyndx0.de` (sandbox) or `https://api.fynd.com` (prod) |
| `MONGO_FYND_EXTENSION_BOILERPLATE_READ_WRITE` | Yes | MongoDB URI |
| `REDIS_FYND_EXTENSION_BOILERPLATE_READ_WRITE` | Yes | Redis URI |
| `PORT` | No | Default: `8080` |
| `NODE_ENV` | No | Default: `development` |
| `MODE` | No | `server` / `cron` / `worker`. Default: `server` |
| `FDK_DEBUG` | No | `true` / `false`. Default: `false`. When `true`, FDK logs every HTTP call it makes as a full `curl` command + token response. Extremely useful when debugging auth or install failures — very noisy otherwise. |
| `SENTRY_DSN` | No | Sentry is disabled when empty |
| `NEW_RELIC_APP_NAME` | No | fit/tracing requires a non-empty value or prints a warning on startup. Set to any string (e.g. `my-ext-dev`) even in development. |
| `NEW_RELIC_LICENSE_KEY` | No | New Relic APM |

---

## fit Library

fit is an internal GoFynd library that wraps common infrastructure concerns.

### Modules used in this boilerplate

| Module | Purpose |
|--------|---------|
| `fit/mongo` | MongoDB connection pool init |
| `fit/redis` | Redis connection pool init |
| `fit/server` | Express router wrapper + server lifecycle |
| `fit/tracing` | Structured Winston logger |
| `fit/health-check` | Health endpoint daemon (for worker mode) |

### Connection key pattern

fit derives connection keys from `SERVICE_NAME` env var using this rule:

```
SERVICE_NAME = "my-extension"
           → key = "my_extension"   (kebab → snake, lowercase)
           → env = MONGO_MY_EXTENSION_READ_WRITE
                   REDIS_MY_EXTENSION_READ_WRITE
```

This boilerplate sets the keys in `index.js` before calling `mongo.init()`:

```js
process.env[`MONGO_${config.APP_IDENTIFIER.toUpperCase()}_READ_WRITE`] = config.mongo.uri;
process.env[`REDIS_${config.APP_IDENTIFIER.toUpperCase()}_READ_WRITE`] = config.redis.uri;
```

Once initialized, connections are accessed via:

```js
// app/connections/mongo.js
const mongoConnection = Fit.connections.mongo?.["fynd_extension_boilerplate"].write;

// app/connections/redis.js
const hostRedis = Fit.connections.redis?.["fynd_extension_boilerplate"].write;
```

> **Important:** Only require `app/connections/mongo.js` or `app/connections/redis.js` **after** `mongo.init()` and `redis.init()` have resolved. These modules are required lazily inside `app/server.js` which is loaded only after the `Promise.all` resolves in `index.js`.

---

## FDK Setup

`app/fdk/index.js` is the heart of every Fynd extension.

### Storage

`MultiLevelStorage` is used instead of `SQLiteStorage`:

- **Redis** — fast reads for session tokens
- **Mongoose** — persistent fallback if Redis is flushed

```js
const multiLevelStorage = new MultiLevelStorage(
  config.APP_IDENTIFIER,  // prefix for all Redis keys
  hostRedis,
  mongoose
);
```

### Callbacks

| Callback | When it fires | Must return |
|----------|--------------|-------------|
| `install` | First time a company installs the extension | Launch URL string |
| `auth` | After OAuth completes (every launch) | Launch URL string |
| `uninstall` | Company removes the extension | nothing |

Both `install` and `auth` return:
- Company launch: `<base_url>/company/<company_id>`
- App launch: `<base_url>/company/<company_id>/application/<application_id>`

### Access modes

| Mode | Use when |
|------|---------|
| `offline` | Extension acts as a service on behalf of the company (default) |
| `online` | Extension acts as the currently logged-in user |

### Using platformClient in routes

All routes mounted under `fdkExtension.apiRoutes` have `req.platformClient` injected:

```js
// app/routes/v1.router.js
router.get("/products", async (req, res, next) => {
  const data = await req.platformClient.catalog.getProducts();
  res.json(data);
});
```

For application-scoped APIs:

```js
const appClient = req.platformClient.application(application_id);
const products = await appClient.catalog.getAppProducts();
```

---

## Webhooks

Webhooks are registered inside `setupFdk` via `webhook_config` — never as plain Express routes for platform events.

### Adding a new webhook event

**Step 1** — Add a handler in `app/webhook/handlers.js`:

```js
async function shipmentCreated(eventData, company_id, application_id) {
  logger.info("Shipment created", { company_id });
  // your logic
}
module.exports = { ..., shipmentCreated };
```

**Step 2** — Register it in `app/webhook/event-map.js`:

```js
const { shipmentCreated } = require("./handlers");

module.exports = {
  "company/product/delete": { handler: productDelete, version: "1" },
  "application/shipment/create": { handler: shipmentCreated, version: "1" },
};
```

No changes needed to `server.js` or `fdk/index.js` — the event map is already wired.

### Event name patterns

| Pattern | Scope |
|---------|-------|
| `company/<domain>/<action>` | Company-level (e.g. `company/product/delete`) |
| `application/<domain>/<action>` | Sales channel level (e.g. `application/order/placed`) |

### Handler signature

```js
async function myHandler(eventData, company_id, application_id) {
  // eventData     — full webhook payload from Fynd
  // company_id    — company that triggered the event
  // application_id — null for company-level events
}
```

### Local testing

Use ngrok or `fdk extension preview` to get a public URL, then:

1. Set `EXTENSION_BASE_URL` to the tunnel URL
2. Restart the backend
3. Trigger the event from Fynd Partners panel → Webhooks tab
4. Inspect request payloads at `http://localhost:4040` (ngrok dashboard)

---

## Frontend

### URL structure

| URL | Context |
|-----|---------|
| `/company/:company_id` | Company-level launch |
| `/company/:company_id/application/:application_id` | App-level launch |

Both resolve to `App.jsx`. Use `useParams()` to read `company_id` and `application_id`.

### Reading backend config at runtime

The backend serves `/env.js` which sets `window.env`:

```js
// index.html loads <script src="/env.js">
// frontend can then read:
const baseUrl = window.env.HOST_MAIN_URL;
```

### Making API calls

Always include `x-company-id` header — the FDK middleware uses it to resolve the session:

```js
// services/api.service.js
await axios.get("/api/v1/products", {
  headers: { "x-company-id": company_id },
});
```

### Dev proxy

`vite.config.js` proxies these paths to `localhost:8080` during development:

| Path | Reason |
|------|--------|
| `/` | FDK OAuth callback routes |
| `/api/*` | Backend API routes |
| `/fp/*` | Fynd Platform proxy routes |
| `/adm/*` | Admin routes |
| `/env.js` | Runtime config |

---

## Building for Production

```bash
# From project root
npm run build
```

This runs:
1. `cd frontend && npm install` — install frontend deps
2. `npm run build` — Vite builds to `frontend/public/dist/`

Then start the production server:

```bash
NODE_ENV=production npm start
```

Express serves the built assets from `frontend/public/dist/` and falls back to `index.html` for all unmatched routes (SPA behaviour).

---

## Docker

```bash
# Build image
docker build -t my-extension .

# Run container
docker run -p 8080:8080 \
  -e EXTENSION_API_KEY=xxx \
  -e EXTENSION_API_SECRET=xxx \
  -e EXTENSION_BASE_URL=https://my-ext.example.com \
  -e EXTENSION_CLUSTER_URL=https://api.fynd.com \
  -e MONGO_FYND_EXTENSION_BOILERPLATE_READ_WRITE=mongodb://host:27017/my-ext \
  -e REDIS_FYND_EXTENSION_BOILERPLATE_READ_WRITE=redis://host:6379/0 \
  my-extension
```

> **SSH key for fit**: The `npm install` step inside Docker needs SSH access to Azure DevOps to pull the fit package. In CI/CD, use `--mount=type=ssh` (BuildKit) or inject the key as a build arg.

---

## Renaming for Your Extension

When creating a new extension from this boilerplate, update these two files:

### `app/constants/index.js`

```js
const constant = {
  APP_IDENTIFIER: "my-new-extension",    // kebab-case
  DB_NAME: "my_new_extension",           // snake_case (same name, underscored)
  EXTENSION_NAME: "my-new-extension",
};
```

### `app/common/config.js`

Update the three places that reference the extension name:

```js
APP_IDENTIFIER: {
  default: "my-new-extension",
  env: "APP_IDENTIFIER",
},
mongo: {
  uri: {
    default: "mongodb://127.0.0.1:27017/my-new-extension",
    env: "MONGO_MY_NEW_EXTENSION_READ_WRITE",   // ← update this
  },
},
redis: {
  uri: {
    default: "redis://localhost:6379/0",
    env: "REDIS_MY_NEW_EXTENSION_READ_WRITE",   // ← update this
  },
},
```

### `.env.example` (and your `.env`)

Rename the DB env vars to match:

```
MONGO_MY_NEW_EXTENSION_READ_WRITE=mongodb://localhost:27017/my-new-extension
REDIS_MY_NEW_EXTENSION_READ_WRITE=redis://localhost:6379/0
```

### `package.json`

```json
{
  "name": "my-new-extension"
}
```

That's it — everything else derives from these values automatically.
