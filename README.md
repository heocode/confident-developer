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
| `/about` | About me | Implemented |
| `/references` | References | Implemented |
| `/contact` | Contact Me | Implemented |

The Home route composes the Hero, Projects, Services, Profile, References, and Contact sections. The sections remain in normal document flow and use scroll-progress transitions. The final Contact section includes the footer and opens the functional contact drawer.

An initial document load at the top of Home plays a non-blocking opening scene: Navigation and Hero groups fall vertically into place, then the persistent cloud field floats in and continues its normal drift. The scene does not replay after client-side navigation and resolves immediately for user scroll/navigation intent or reduced motion.

The dedicated Projects routes are feature-complete for the approved scope. Published projects load from the backend into URL-backed browser tabs, and each selected project presents its ordered screenshots and metadata in one responsive horizontal rail across desktop and mobile.

On desktop primary-route changes, the complete Projects browser slides in from beyond the destination-side viewport edge. Its initially visible leading edge begins as a small rounded bulge and unfolds into the stable browser surface during the slide; the exit mirrors that travel toward the departure edge. Nested project-tab navigation and direct visits remain immediate.

The Services index uses the same directional travel language with a row cascade: published Services enter from first to last and leave from last to first. Service detail and feedback states travel as one scene, while nested `/services` navigation keeps its own opening and closing choreography.

About reuses the Projects slide-and-capsule transition through `RouteSurfaceMotion`: the complete desktop glass panel travels as one object in the navigation direction, with restrained title motion. Its mobile layout keeps two full-viewport snap slides inside one frame and immediate route navigation. Profile content and interactions reuse the Home Profile domain; stable biography and education content live in typed frontend configuration.

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

The document keeps native scrolling behavior while its platform scrollbar is hidden so it never consumes layout width. After actual scroll activity, a fixed themed overlay briefly reveals a conventional dark-blue track with a background-blue thumb, then hides again without affecting geometry. It supports track clicks, thumb dragging, and keyboard scrolling on desktop, becomes a transient non-interactive cue on mobile, and stays hidden when the document cannot scroll or root scrolling is locked. A shared, reference-counted root lock coordinates viewport-locked routes, dialogs, the Contact drawer, and mobile Navigation without body mutations or padding compensation. Internal scroll regions use shared scrollbar tokens and may remain visibly scrollable when that affordance is useful.

Desktop primary-navigation changes are coordinated as directional transitions between the six primary route areas. Mobile and reduced-motion navigation remains immediate, modified links retain native browser behavior, and nested Project or Service navigation does not invoke the global route transition.

The persistent clouds retain their independent slow drift during desktop route changes. A separate gust layer adds a mirrored departure anticipation, directional sweep, invisible handoff, and continuously decelerating entrance without remounting the background.

## Backend integration

The frontend currently integrates these public backend domains:

- Projects: Home placement, archive list, and slug detail through `/api/v1/projects`.
- Services: Home placement, ordered Services-page list, and slug detail through `/api/v1/services`.
- Profile: persisted GitHub summary, profile post, interactions, and resume download.
- References: paginated public guestbook, ownership state, submission, and deletion flows.
- Contact: validated public submissions through `/api/v1/contact`.

The shared `ContactForm` owns its fields, scope/budget choices, validation, Turnstile, and success feedback independently of the drawer shell. Its styles expose CSS variables with the existing drawer appearance as responsive defaults. Autofocus is opt-in, and close/submission callbacks are optional; the Home drawer supplies them explicitly. The dedicated `/contact` route embeds the same form in a centered glass panel matching its Figma design, while Home retains its HIT ME UP drawer. Contact Me navigation no longer opens a dialog. On mobile, the page uses one frame with the References/About edge insets and no horizontal rail; content can scroll internally for short viewports, validation, or security challenges. The page retains required scope/budget choices, Turnstile, error handling, and focused success feedback without a Close action. Its shared rectangle route transition remains pending.

The backend remains the source of truth for dynamic content and ordering. Feature modules own endpoint paths and public DTOs, while presentation formatting stays outside the transport layer. Loading, empty, error, retry, and unavailable-backend states are handled intentionally by their owning surfaces.

References exposes a shared `useReferences` loader and `ReferenceFeed` display, plus controlled submission fields and a `useReferenceSubmissionForm` hook for validation and Turnstile state. Home composes these with its message input and modal shell; API submission and ownership remain in `useReferenceSubmission`. The dedicated References route uses a viewport-locked desktop panel with the guestbook on the left and an inline form on the right, including required private email, ratings, a multiline testimonial, Turnstile, and ownership feedback. The guestbook scrolls independently; the inline form fills its column through a height-constrained grid, with controls sized from the available container and a separate feedback row. Long testimonial text scrolls within its textarea. On mobile, the shared `HorizontalSnapRail` presents the guestbook and form as two full-width slides inside one frame, with matching content insets and no duplicated data or form state. Native horizontal swipes coexist with vertical guestbook/form scrolling; the default form distributes fields, ratings, and message within the same inset height as the guestbook, with 16px input text and container-sized controls. Exceptionally short slide heights retain a content-safe scrolling fallback. On desktop primary-route changes, the complete References panel uses the shared `RouteSurfaceMotion` slide-and-capsule transition in the navigation direction, with restrained title motion matching About. Mobile, reduced-motion navigation, and direct visits present the completed state immediately.

## Deployment

Production hosting must preserve relative `/api/...` browser requests by proxying or rewriting them to the backend. That hosting configuration is deployment-specific and is not currently stored in this repository.
