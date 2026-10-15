# Confident Developer Frontend

The React frontend for the Confident Developer portfolio. It is built with React 19, TypeScript, Vite, and React Router.

Portfolio content is owned by the separate backend application and is consumed only through its HTTP API. Browser code uses relative `/api/...` URLs; it does not connect to MongoDB or call a deployment-specific backend origin.

## Requirements

- Node.js 22 or newer
- npm
- The backend repository running locally on port `3000` when testing API-backed features

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The Vite development server proxies `/api` to `http://localhost:3000` by default. Override the local target only when necessary:

```text
API_PROXY_TARGET=http://localhost:3000
```

`API_PROXY_TARGET` is read by the Vite server and is not exposed to browser code.

Reference submissions also require a public Cloudflare Turnstile site key:

```text
VITE_TURNSTILE_SITE_KEY=
```

Keep the corresponding secret key only in the backend environment. For local end-to-end
testing, use Cloudflare's official test site key together with its matching backend test secret.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

## Routes

- `/` — Home
- `/projects` — Projects archive
- `/projects/:slug` — selected project
- `/services` — Services
- `/about` — About me
- `/references` — References
- `/contact` — Contact Me

The shared application layout remains mounted across client-side route transitions. Production will preserve the same relative `/api` topology through a Vercel external rewrite to the backend.

## Frontend architecture

The application uses feature boundaries for domains that appear in more than one surface. A feature owns its domain API integration, model/types, hooks, presentation mapping, route components, and domain-specific UI. For example, Projects owns both its archive routes and its future Home preview section under `src/features/projects`.

`src/pages` is reserved for route-level composition such as Home, which will assemble preview sections from several features. Cross-feature layout, feedback, and reusable UI remain in `src/components`; shared transport concerns remain outside domain features.

Feature subdirectories are added only when they gain a concrete responsibility. Empty placeholders for planned domains are intentionally avoided.

## API boundary

Browser requests use the shared client in `src/api` and relative `/api/...` paths. The client unwraps successful API envelopes, forwards request cancellation, and normalizes transport failures. Each feature owns its endpoint paths and public DTOs; presentation formatting remains outside the transport layer.

The Projects feature currently exposes typed functions for the Projects-page list, Home placement, and slug detail. It preserves backend ordering and media URLs exactly as returned by the API.
