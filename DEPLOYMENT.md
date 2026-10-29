# Render deployment and continuous delivery

Status: preparation only. Services, domains, production credentials and automatic deployments have not been configured by this change.

Confirmed launch choices: primary frontend domain **https://confidentdeveloper.space**, backend **Free** initially. Free backend sleep/cold start remains an accepted launch limitation. Backend service URL and DNS provider still need to be identified. Use the apex domain as primary unless the owner later chooses `www`.

## Release sequence and completion criteria

Repository snapshot before the release-tooling commits on 2026-10-29: local main tracking branches showed no ahead/behind commits after the owner's pushes. The 90 frontend and 23 backend unpublished commits had their author/committer email corrected to the heocode noreply identity before publication, with content/messages/dates preserved and backup refs retained. CI workflows, deployment documentation and favicon edits were prepared for separate focused commits. The existing deleted coursework PDF is unrelated and must remain outside those commits. Confirm current publication and CI status on GitHub rather than relying on this preparation snapshot.

1. **Publish the release tooling.** Review focused diffs, commit frontend CI/deployment documentation/audit ignore rules, preserve the approved favicon as a deliberate change, and commit backend CI/hosting documentation. Do not accidentally include the existing backend PDF deletion or raw audit captures. Push each repository's main and inspect its actual GitHub Actions result. Complete when frontend and backend have green checks for the commits intended for deployment.
2. **Create the production backend service.** Use a new Render Node Web Service on main/Free; keep grading separate. Configure Atlas, intended content database, health check, production Origin/Turnstile and mail settings deliberately. Inspect pending outbox jobs before enabling dispatch. Complete when health reports connected, public content is correct, and secrets remain server-only.
3. **Create the production frontend service.** Deploy the Static Site on its temporary Render URL, configure API rewrite before SPA fallback, the public Turnstile site key and exact approved origins/hostnames. Select After CI Checks Pass on both services. This is the same production infrastructure; a temporary URL is used to verify it before switching the main domain. Complete when direct routes and relative API requests work over HTTPS.
4. **Perform the release acceptance pass.** Check all six primary routes and nested details, direct links, Back/Forward, unknown/error/Retry states, resume, video/Rive, mobile navigation and form layouts. Verify Profile cookie/Origin behavior so the local preview 403 is not carried into deployment. Finish keyboard/focus, 200% zoom and reduced motion checks; record the actual browsers and physical phones used and list those unavailable. Agree one controlled Contact/References submission separately before sending it; without that test, successful end-to-end delivery remains explicitly unverified. Complete when essential flows work and remaining limitations are documented.
5. **Connect confidentdeveloper.space.** Identify the DNS provider, add the domain in Render and apply the actual provider-specific records. Preserve unrelated DNS/mail records, configure the www redirect, verify TLS and update backend origins/Turnstile hostname settings. Complete when the custom domain serves the expected site and API with no redirect loop or missing certificate.
6. **Verify the delivery loop and recovery.** Commit a small useful change, confirm green CI causes a Render deployment and check the live revision. Confirm failed checks do not publish; test that on a branch or disposable configuration, not by deliberately breaking production main. Record known-good frontend/backend commit IDs and the rollback procedure. Do not assume checking a CI YAML locally proves hosted deployment works.
7. **Continue fixes on the hosted baseline.** Measure actual compression/cache and cold backend wake-up. Prioritize the slow-network initial-load finding PERF-04, then assess early Turnstile/landscape (PERF-01/02), startup layout (PERF-03), Projects geometry/error-state (PERF-05/UI-01), and WASM delivery (PERF-06) according to observed impact. Make small changes and repeat the affected scenario under the same conditions. Free backend cold start stays a known limitation until the owner upgrades.

Block announcement for a broken relative API, incorrect data destination, private-data exposure, missing required security checks or unusable essential forms. The performance/UI candidates do not automatically block this first release; shipping does not mark them fixed. If end-to-end submissions are not yet authorized/tested, explicitly record the gap instead of claiming forms are fully verified.

Immediate next action: review and publish the prepared CI/tooling commits, then create the new backend service. DNS details do not block the CI step. No Render service creation, DNS mutation or additional test message is performed by writing this plan.

## Deployment flow

Each repository deploys independently:

`push to main → GitHub Actions checks → Render build → deployment → verification`

Frontend checks: TypeScript, ESLint, Node tests and production build. Backend checks: ESLint and isolated Node tests. CI must not receive a live MongoDB URI, mail credentials or Turnstile secret. Backend contract tests use isolated adapters; they do not replace a deployed smoke test against Atlas.

Configure Render **Auto-Deploy: After CI Checks Pass** on both production services. Keep the validation job unconditional on `main` (no path filters or skipped validation). Render treats successful, neutral and skipped GitHub conclusions as passing, so this is not a substitute for branch protection. When available in the GitHub repository's plan, require the validation check before merging to `main`, restrict direct pushes, and use short-lived branches for changes. PR validation does not publish production.

Only commits pushed to the linked `main` branch can trigger production deployments. Other branches and local commits do not publish. Changes to the two repositories are not an atomic release: maintain compatible API contracts and publish an additive backend change before a frontend change that depends on it.

## Backend first

Create a new **Web Service** from `ConfidentDeveloperBackend` on `main`, using the native Node runtime. Preserve the existing grading service on `assignment-2`.

| Setting | Value |
| --- | --- |
| Runtime | Node.js 22 (repository `.nvmrc`) |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check | `/api/health` |
| Auto-deploy | After CI Checks Pass |
| Instance | Free initially (confirmed by owner) |

The server reads Render's `PORT`. Do not force the local port in hosted configuration. Choose a region appropriate for the Atlas cluster and expected visitors.

Configure the backend environment through Render, not committed files:

- `NODE_ENV=production`.
- `MONGODB_URI`: the intended Atlas cluster with database name `portfolio`. Confirm which existing database contains the approved content. Do not run import scripts or admin creation as deploy hooks.
- `CLIENT_ORIGINS`: include `https://confidentdeveloper.space`; add the actual Render frontend URL if used for verification. Add `https://www.confidentdeveloper.space` only if serving forms there instead of redirecting it. Do not use a wildcard.
- `ENABLE_COURSEWORK_API=false`.
- `TRUST_PROXY`: verify the actual proxy path, especially frontend rewrite → backend. Configure a bounded hop count compatible with trusted forwarded IP headers; do not blindly enable `true` or assume a hop count without verifying rate-limit client IP behavior.
- The complete `CLOUDINARY_*` group for managed media operations; `GITHUB_USERNAME` and optional server-only `GITHUB_TOKEN`.
- Real `TURNSTILE_SECRET_KEY` matching the frontend site key. This backend rejects Cloudflare test secrets in production.
- If enabling email delivery, configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_NOTIFICATION_TO_EMAIL` together. Confirm a verified sender and notification destination. With no email configuration, the worker is disabled and durable jobs can remain pending. If using an existing DB, inspect existing pending jobs before enabling the worker: enabling it can dispatch them.
- Optional `RESEND_WEBHOOK_SECRET` only after configuring the actual provider webhook destination and event subscriptions.

Atlas must permit connections from the chosen backend hosting network. Verify `/api/health` reports a connected database and that public lists return the intended published content.

## Frontend second

Create a **Static Site** from this repository on `main`.

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |
| Node version | 22 |
| Auto-deploy | After CI Checks Pass |

Set `VITE_TURNSTILE_SITE_KEY` to the real public key. Register the actual frontend hostname(s) in Cloudflare Turnstile. Never copy backend secrets into frontend environment variables. `API_PROXY_TARGET` is local-only and does not create a hosted `/api` proxy.

Add these **Rewrite**, not Redirect, rules in this order, replacing the backend placeholder with its actual URL:

| Source | Destination |
| --- | --- |
| `/api/*` | `https://<backend-service>.onrender.com/api/*` |
| `/*` | `/index.html` |

Add `confidentdeveloper.space` under the frontend Static Site's Custom Domains. Configure only its relevant DNS records according to the actual DNS provider and Render's instructions; preserve email MX/TXT and other unrelated records. Verify the domain and TLS before announcing it. Render automatically adds `www` with a redirect to the apex when adding an apex domain. Exact DNS targets come from the created Static Site; do not invent them before creation.

Use the HTTPS frontend URL consistently. Verify external API rewrites preserve request methods, body, query, Origin and cookies. API errors must remain JSON/API status responses rather than falling through to SPA HTML. Do not apply long-lived public caching to API/authentication responses. Cookie-backed APIs and `Set-Cookie` responses must not be publicly cached.

For fingerprinted `/assets/*`, evaluate `Cache-Control: public, max-age=31536000, immutable`; HTML must remain revalidatable to discover a new build. Verify actual Render behavior before adding duplicate cache rules. Check compression for JS/CSS and Rive WASM; local preview sent WASM without compression. Repeated deploys and lazy chunks require a brief stale-client smoke test; do not assume rollback instantly replaces already cached documents or runtime state.

## Verify before announcing the site

1. Public HTML and assets load over HTTPS; direct `/projects/:slug`, `/services/:slug`, `/about`, `/references`, `/contact` and unknown paths render intentionally.
2. Browser Network shows relative `/api` requests, expected API statuses and actual cache/compression headers. Errors are not cached as successful HTML.
3. Origin-protected Profile interactions work through the frontend domain; visitor cookies are set and preserved as intended, and per-client rate limiting uses correct IPs.
4. Turnstile issues tokens on the actual hostname and the backend validates hostname/action. Check failure and expiry without sending real messages.
5. Coordinate explicit test submissions before testing successful Contact/References mutations. Do not send them as an automatic CI smoke test. A publicly enabled Contact form can receive real inquiries and notifications; confirm readiness before launch.
6. Confirm resume download, media, video/Rive, mobile navigation, keyboard focus, 200% zoom and reduced motion. The local audit still has outstanding checks.
7. Verify a failed CI run prevents auto-deployment, then verify a passing pushed commit appears in Render and the deployed version. Keep known-good commit IDs for both services.

Production fixes may continue after deployment, but known authentication, private-data exposure, broken essential submissions or data-loss issues should block announcement. Performance candidates remain in `PRE_RELEASE_AUDIT.md` until fixed and remeasured; publishing does not mark them resolved.

## Rollback

Use Render's deploy history to redeploy a known-good commit, and revert the corresponding Git commit before the next automatic deployment. The two services may need separate rollbacks. A code rollback does not undo database writes or retract email; keep release changes backward-compatible and avoid destructive data changes in startup/deploy steps.

## References

- https://render.com/docs/deploys
- https://render.com/docs/git-provider
- https://render.com/docs/redirects-rewrites
- https://render.com/docs/deploy-node-express-app
