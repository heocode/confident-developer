# Confident Developer Frontend

The React frontend for the Confident Developer portfolio, built with React 19, TypeScript, Vite, and React Router.

Portfolio content is owned by a separate Node.js backend and is consumed only through typed HTTP integrations. Browser code uses relative `/api/...` URLs; it does not connect to MongoDB or expose a deployment-specific backend origin.

## Project status

Home is feature-complete for the approved scope. Its remaining work is limited to visual polish and bug fixes unless a new product requirement is agreed.

| Route | Surface | Status |
| --- | --- | --- |
| `/` | Home | Implemented |
| `/projects` | Projects archive | Implemented |
| `/projects/:slug` | Project detail | Implemented |
| `/services` | Services index | Desktop UI implemented |
| `/services/:slug` | Service detail | Desktop UI implemented with preview media |
| `/about` | About me | Placeholder |
| `/references` | References | Placeholder |
| `/contact` | Contact Me | Implemented |

The Home route composes the Hero, Projects, Services, Profile, References, and Contact sections. The sections remain in normal document flow and use scroll-progress transitions. The final Contact section includes the footer and opens the functional contact drawer.

The dedicated Projects routes are feature-complete for the approved scope. Published projects load from the backend into URL-backed browser tabs, and each selected project presents its ordered screenshots and metadata in one responsive horizontal rail across desktop and mobile.

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

The Vite development server proxies `/api` to `http://localhost:3000` by default. Override the server-only target when necessary:

```text
API_PROXY_TARGET=http://localhost:3000
```

Public reference and contact submissions require a Cloudflare Turnstile site key:

```text
VITE_TURNSTILE_SITE_KEY=
```

`API_PROXY_TARGET` is never exposed to browser code. The Turnstile site key is public by design; keep its corresponding secret exclusively in the backend environment. For local end-to-end testing, use Cloudflare's official test site key together with its matching backend test secret.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

## Frontend architecture

- `src/pages` owns route-level composition. Home assembles domain-owned preview sections.
- `src/features` owns domain API modules, public models and types, hooks, presentation mapping, routes, and domain-specific UI when those responsibilities exist.
- `src/components` contains shared layout and reusable cross-feature UI, including dialog and anti-spam primitives.
- `src/api` contains the shared HTTP client, envelope parsing, relative-path enforcement, cancellation, and normalized transport errors.
- `src/data` contains stable typed frontend configuration such as Home identity copy and social destinations.

The shared application layout remains mounted across client-side route transitions. Persistent site-wide layers such as the cloud background therefore continue across navigation.

The shared shell retains the full visual-viewport width independently of the native document scrollbar. Non-scrolling routes do not reserve an empty gutter, while viewport-locked Projects and Services routes hide root vertical overflow.

Desktop primary-navigation changes are coordinated as directional transitions between the six primary route areas. Mobile and reduced-motion navigation remains immediate, modified links retain native browser behavior, and nested Project or Service navigation does not invoke the global route transition.

## Backend integration

The frontend currently integrates these public backend domains:

- Projects: Home placement, archive list, and slug detail through `/api/v1/projects`.
- Services: Home placement, ordered Services-page list, and slug detail through `/api/v1/services`.
- Profile: persisted GitHub summary, profile post, interactions, and resume download.
- References: paginated public guestbook, ownership state, submission, and deletion flows.
- Contact: validated public submissions through `/api/v1/contact`.

The backend remains the source of truth for dynamic content and ordering. Feature modules own endpoint paths and public DTOs, while presentation formatting stays outside the transport layer. Loading, empty, error, retry, and unavailable-backend states are handled intentionally by their owning surfaces.

## Deployment

Production hosting must preserve relative `/api/...` browser requests by proxying or rewriting them to the backend. That hosting configuration is deployment-specific and is not currently stored in this repository.
