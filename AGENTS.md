# AGENTS.md

## Project Overview

This repository contains the frontend for a production-oriented personal portfolio website built with React, TypeScript, and Vite. A separate Node.js, Express, Mongoose, and MongoDB Atlas repository provides portfolio content, references, users, and other dynamic features.

The site should remain clean, maintainable, reusable, and easy to extend in the future.

The portfolio is also being developed as part of COMP229 coursework. Backend coursework is implemented and submitted from its own repository. This frontend should consume that API through a typed integration layer without duplicating backend responsibilities.

## Current Product Scope

- The six primary routes are Home, Projects, Services, About Me, References, and Contact Me.
- Home is feature-complete for the approved scope. Treat its sections as previews of the dedicated routes rather than duplicating the complete content of those pages; further Home changes should be visual polish or bug fixes unless a new product requirement is agreed.
- Projects is feature-complete for the approved scope. Treat further changes as visual polish or bug fixes unless a new product requirement is agreed.
- Home uses normal document scrolling. Its major sections are designed as `100vh` sections, with the footer incorporated into the final contact section.
- The Home Hero-to-Projects transition keeps both sections in normal document flow: Hero content fades near the section boundary, then the Projects heading and project cards enter sequentially from below according to scroll progress. Do not turn the Hero into a pinned Projects background or add transition dimming and blur.
- The Home Projects-to-Services transition also remains in normal document flow: project content exits upward, the Services heading receives a distinct title-only phase, and the service rows then enter sequentially from below. Keep the final section spacing unchanged and create the separation through scroll phases rather than spacer content.
- The Home Services-to-Profile transition follows the same normal-flow pattern: service rows exit upward, the Profile heading receives a distinct title-only phase, and the profile card then enters from below. Do not add spacer content or register the profile view before the animated card is substantially visible.
- The Home Profile-to-References transition remains in normal document flow: the profile card exits upward, the References heading receives a distinct title-only phase, and the guestbook panel then enters from below. Keep the section spacing unchanged and do not add spacer content or pin either section.
- The Home Contact section remains in normal document flow and reveals its heading, call-to-action button, then landscape and embedded footer in distinct scroll-progress phases. Do not add spacer content or pin the section.
- Use Inter throughout the product, varying only size, weight, line height, and other typographic properties required by the designs.
- Navigation links open dedicated routes. The desktop navigation hides while scrolling down and returns while scrolling up. On mobile, the fixed identity and burger control hide and return together using the same scroll-direction behavior.
- Desktop primary-navigation changes use a directional route-transition coordinator based on the six-item navigation order. A navigation action moves directly from the current primary route to the selected route without mounting or animating intermediate routes; the current route owns its exit choreography, the destination owns its entrance choreography, and the persistent cloud layer owns the shared travel motion. Keep modified-link behavior native, use an immediate navigation on mobile and for reduced-motion visitors, and do not run the global transition within the same primary route such as between a Services index and detail.
- The dedicated Projects route uses the approved browser-window composition: each published project is a URL-backed tab, the selected project loads its detail by slug, and project browser colors come from the public theme contract. Across desktop and mobile, the browser contains one native horizontal scroll-snap rail with every screenshot in backend order followed by project metadata as the final slide; viewport changes alter only shared layout tokens, not the content structure or interaction model. Each panel preserves stable typography, spacing, and vertical composition while scaling to fit the available browser area; wider screenshots derive a capped, proportionally wider, potentially multi-screen panel from their API aspect ratio. On wide desktop frames, distribute otherwise unused rail width across screenshot surfaces while keeping metadata compact and aligned to the right frame inset. Projects without links omit the Links section rather than rendering an empty placeholder. Switching project tabs resets the rail to the first screenshot.
- The dedicated Projects route owns its desktop primary-route entrance and exit choreography. Animate the real browser wrapper as one visual object with no separate colored transition surface: begin with nearly all of the full-size browser beyond the destination-side viewport edge, expose its clipped rounded leading bulge, unfold that clip while the wrapper is still mostly off-screen, and then finish the slide with its normal geometry. Reverse the sequence only after the departing browser is mostly beyond the opposite edge. Never scale the browser or separately animate its tabs, screenshots, or metadata. Keep the title motion restrained, and keep direct visits, mobile, reduced motion, index-to-slug redirects, and project-tab changes free from this global choreography.
- The Projects route remains locked to one viewport with no vertical page or browser-frame scrolling. On desktop, the fixed navigation remains visible as an overlay and the available lower viewport space enlarges the browser frame, allowing multiple rail panels to remain visible when space permits. On mobile, the title and complete tab group are centered while they fit, with the tabs falling back to start-aligned horizontal scrolling on narrower viewports; the browser frame reaches the bottom edge. Mobile screenshot slides align to the shared left page gutter, the final metadata slide aligns to the matching right page gutter, and adjacent slides remain visible at the edge.
- The section control in the lower-right corner scrolls to the top. The hero scroll affordance points down and plays two synchronized downward cues before each pause.
- Toronto time is live. `KEEP BUILDING` is decorative text.
- The Home Hero portrait/sun follows a subtle idle arc, moves away when a fine pointer enters its proximity radius, and returns to its designed position when the pointer leaves the Hero. Disable these decorative movements for touch/coarse pointers and `prefers-reduced-motion`.
- Desktop project cards flip independently with a 3D tap/click interaction. The circular flip icon is an affordance for the same action.
- Home displays three configurable featured projects. Project data must support Home selection, main-project selection, and explicit display ordering.
- The dedicated Projects route uses a nested `/projects` and `/projects/:slug` flow. The index loads the backend-ordered public list and replace-redirects to its first slug; direct detail visits load the list and selected detail in parallel. Keep the parent route mounted across tab navigation, cache visited details only for that mounted route session, and preserve intentional loading, empty, retryable-error, configuration-error, and unknown-slug states.
- The dedicated Services route uses a nested `/services` and `/services/:slug` flow. The index keeps the backend-ordered public list as its own closed state without redirecting; direct detail visits load the list and selected detail in parallel. Keep the parent route mounted across navigation, cache visited details only for that mounted route session, map frontend-owned service icons, tones, and tool icons in the presentation layer, and preserve intentional loading, empty, retryable-error, configuration-error, and unknown-slug states.
- The dedicated Services index is locked to one viewport on desktop. It presents every published Service as a full-row URL-backed link in backend order, uses content-driven row widths with the left edge flush to the viewport and the shared right page gutter, and does not reuse the expandable Home accordion interaction. With a fine pointer, the colored row surface previews navigation by following the pointer horizontally while a forward control stays on its moving edge; update that geometry outside React rendering, keep neighboring rows fixed, provide a stable keyboard-focus preview, and disable pointer tracking and repeated hints for reduced motion. Activating a row prefetches its detail into the mounted route-session cache while a parent-owned transition layer expands the selected surface over the still-mounted index and moves later identities into the first-row anchor before navigation reveals the resolved detail route. On desktop, finish the Forward-to-Back movement during that expansion. On mobile, reuse the exact Home Services identity geometry—tone-specific row widths from the shared presentation mapping, matching compact row height and inline padding, a 12px title/icon gap, the same title typography, and the same icon cap—and reveal Back only as the surface approaches its expanded state because closed mobile rows have no Forward control. Closing reverses the sequence: detail cards leave leftward in reverse content order, the index mounts underneath a full-frame transition layer, and that layer measures and collapses into the selected row; desktop returns Back to Forward, while mobile hides Back before reaching the closed row. Preserve normal modified-link navigation, and present route changes immediately for reduced motion.
- The dedicated Services detail fills the available route width and reaches the lower viewport edge. It uses one native horizontal scroll-snap content rail whose backend-ordered showcase is followed by its information content. Each image or video owns one rail panel, while consecutive Rive animations are grouped in stacks of up to three previews. When detail content appears, reveal each showcase and information card from left to right through its own mask in content order; cap the stagger for variable asset counts, do not disturb rail geometry, and present the completed state immediately for reduced motion. On desktop and tablet, the information panel retains a 530px design minimum and expands into rail width unused by shorter showcases up to its 742px large-screen cap; Description, capabilities, and the combined Tools/Used In row share the same calculated Rive-tile height while content fits, and if one row needs more height all three rows redistribute the available space down to their content-safe minimums. On large viewports, showcase surfaces, gaps, card spacing, typography, and resource icons scale together from the 560px reference composition up to a shared 1.4 maximum; beyond that cap the frame remains full-height while the rail content stays fixed and leaves intentional free space. On mobile, information becomes two adjacent horizontal snap positions without duplicated content: Description and capabilities split the first position while they fit, but that position becomes keyboard- and touch-scrollable vertically when either card needs more height, allowing capability chips to retain their wrapped layout without clipping; Tools and Used In then stack vertically in the second position with large centered vertical icon lists and left-aligned labels. The rail returns to its first panel when the selected Service changes. Do not size the layout around a fixed asset count. A video keeps its API preview as the poster, attaches its MP4 only after the panel first becomes visible, plays muted and inline exactly once, pauses while outside the rail, and reveals the supplied centered Replay control over a dimmed final frame after ending; reduced-motion visitors start it manually. Animation groups keep their API previews until the group first becomes visible, then lazy-load the locally hosted Canvas runtime and each `.riv` from its API URL, start every successfully loaded single state machine together, and preserve a preview for any failed asset. On fine pointers, the complete tile owns hover and writes the bound `hovered` ViewModel property while embedded canvas listeners remain disabled; coarse pointers do not intercept rail gestures. Pause active machines outside the rail or while the document is hidden, clean them up with the detail route, and never load the Rive runtime for reduced-motion visitors.
- The Services index rows and detail header share one responsive geometry for title position, icon position, row height, and spacing. Opening the first Service must not move its title or icon; opening any later Service moves that identity into the same first-row anchor used by the first item. On mobile, keep the opened detail identity at the same tone-specific Home Services width as its closed row while the detail surface itself expands, and reserve one 10px grid gap after the header so the identity and Back control cannot overlap the content rail.
- The Services preview starts collapsed and allows at most one open item. Desktop rows use full-width hover zones, expand horizontally, and remain responsive while scrolling moves them beneath a stationary fine pointer. Mobile rows expand downward on tap, widen toward the right gutter, and move the following rows through normal layout; keyboard focus must provide equivalent accessible behavior.
- Home Services content comes from `GET /api/v1/services?placement=home` in backend order. Do not fall back to hardcoded service content; map the backend's allowlisted `icon` and `tone` keys to frontend-owned SVG assets and visual themes in the presentation layer.
- Home Profile statistics come from the backend's latest persisted GitHub snapshot through `GET /api/v1/github-summary`; never request GitHub directly from the browser or replace a temporarily stale snapshot with hardcoded counts. Profile-post content and persisted likes/views come from the public Profile Post API. Register a view only after the profile card actually enters the viewport, not when Home initially loads.
- The References section is a real, scrollable guestbook backed by MongoDB, with pagination or incremental loading.
- Submitting a reference starts with a message field. `Enter` continues to the details modal, while `Shift+Enter` inserts a newline. All modal fields are required.
- References use the public `/api/v1/references` contract and preserve backend ordering. Retain the one-time submission management token in versioned local browser storage with only its reference ID; never persist the submitter's email or testimonial alongside it, and send the token only through the ownership header required by the status and deletion endpoints.
- When no approved references exist, render the backend-composed `emptyState` from the same public References response, including its Site Profile identity, managed avatar URL, message, and content date. Do not duplicate that content in frontend configuration or replace it with a hardcoded fallback.
- Reference submissions use an explicitly rendered Cloudflare Turnstile widget with the `reference_submit` action and interaction-only appearance. Configure its public site key through `VITE_TURNSTILE_SITE_KEY`; keep the secret key and token verification exclusively on the backend.
- After a successful submission, show the returned owned reference separately without changing the backend order of public references, and restore its current state from the ownership endpoint after reload. Keep pending and rejected submissions visible and disable another submission until the visitor withdraws or deletes them; show rejected status without exposing private moderation reasons. Once a submission is approved or its ownership credential is no longer valid, clear the local credential and rely on the public reference list.
- The profile card uses real GitHub data. Its resume button downloads the resume, and its likes and views are real persisted interactions.
- The final `HIT ME UP` call to action opens the contact panel shown in the approved design.
- The contact panel opens as one calm overlapping composition: the overlay begins immediately, the drawer follows from the right, and its content fades in before the drawer settles. Reduced-motion mode presents the completed state immediately.
- On mobile portrait viewports, the contact panel keeps the full default form and submit action within one screen by using a compact two-column identity row and reduced control spacing; internal scrolling remains available for unusually short viewports, validation feedback, and security challenges.

## General Principles

- Prefer thoughtful, robust solutions that remain easy to understand and maintain.
- Use advanced patterns when they provide clear value, but avoid unnecessary complexity.
- Keep components small and focused on a single responsibility.
- Reuse existing components before creating new ones.
- Avoid duplicated logic and duplicated styles.
- Use clear, descriptive, contextual names for variables, functions, components, and files.
- Do not introduce abstractions without a concrete benefit.
- Do not add dependencies unless they are clearly needed.
- Preserve the existing visual design and project structure.
- When implementing from a Figma reference, prioritize visual fidelity before adding optional enhancements.

## Figma and Design Fidelity

- The approved Figma mockups are the primary source of truth for the website's visual implementation.
- Match the Figma designs as closely as practical, including layout, spacing, typography, sizing, colors, border radii, shadows, hierarchy, and positioning.
- Preserve the custom visual language of the project instead of replacing it with generic portfolio patterns.
- Do not redesign, simplify, rearrange, or reinterpret an approved Figma section unless explicitly requested.
- When a Figma design contains an intentional interaction, reproduce the interaction rather than implementing only its static appearance.
- Reuse shared design patterns consistently across pages when they are visually identical in Figma.
- Responsive adaptations may change layout when necessary, but should preserve the same visual hierarchy, identity, and interaction intent.
- If a Figma detail is ambiguous or technically impractical, ask for clarification or choose the implementation that most closely preserves the intended design.

## React

- Use functional components.
- Use TypeScript for all React components and data structures.
- Keep reusable UI in `src/components`.
- Use `src/features/<domain>` when a domain spans multiple surfaces such as API access, dedicated routes, and Home preview sections. A feature owns its domain API module, model/types, hooks, presentation mapping, and domain-specific UI; add those subdirectories only when they have concrete responsibilities.
- Keep route-composition pages in `src/pages`. Home composes preview sections from domain features, while cross-feature layout and UI remain outside feature directories.
- Keep page-specific components close to their page when they are not reusable elsewhere.
- Avoid large monolithic page components.
- Extract repeated UI patterns into reusable components.
- Keep business/content data separate from presentation where practical.
- Keep persistent, site-wide visual layers such as the cloud background outside routed page content so route changes do not restart their animation.

## Routing

- Use client-side routing so navigation between portfolio pages does not reload the document.
- Keep the shared layout mounted across route changes.
- Keep the shared site shell sized to the full visual viewport so the document scrollbar never changes route width or horizontal alignment. Do not reserve a permanent root scrollbar gutter or add modal padding compensation; let the native document scrollbar appear only when content actually scrolls, and hide root vertical overflow while the viewport-locked Projects or Services route is mounted. The fixed navigation remains centered against the same visual viewport across that switch.
- Page transitions are optional and should remain subtle if introduced after the core pages are visually complete.

## Data

- Do not hardcode project, service, or reference content directly into large JSX blocks when it can live in `src/data`.
- Keep the stable Home Hero identity copy, timezone, and social destinations in typed frontend configuration under `src/data`. Toronto time is computed in the browser; revisit this ownership only if a managed public Profile API is implemented.
- Define reusable TypeScript types in `src/types`.
- Structure data so it can later be replaced by a CMS or API without major UI rewrites.
- Treat the backend response as the source of truth for dynamic content while keeping UI-specific transformations outside presentation components.
- Normalize alternate request property names at the API boundary instead of storing duplicate fields such as `firstname` and `firstName`.
- The coursework fields are the minimum schema. Extend them with fields required by the approved UI without breaking the required API contracts or Postman collection.

## Backend Integration

- Keep all Express, Mongoose, MongoDB, authentication, and server deployment code in the separate backend repository. Do not create a `server/` application in this repository.
- Access the backend only through HTTP APIs and a typed frontend service layer. Do not connect to MongoDB from browser code.
- Browser API requests must use relative `/api/...` URLs and must not configure or expose an absolute backend base URL. Local development uses a Vite `/api` proxy whose server-only target may be configured with `API_PROXY_TARGET` and defaults to `http://localhost:3000`. Document it in a safe `.env.example`; never commit secrets or a populated `.env`.
- Keep generic envelope parsing, relative-path enforcement, request cancellation, and transport-error normalization in the shared HTTP client. Keep endpoint paths and public DTO ownership in their domain feature, and keep presentation formatting out of the transport layer.
- The backend exposes portfolio resources including references, projects, services, and users. Keep frontend types aligned with the public API rather than with database implementation details.
- Expect successful API envelopes to use `success`, `message`, and, where applicable, `data`, with public identifiers named `id` rather than `_id`.
- Keep loading, empty, error, retry, and unavailable-backend states intentional in all data-driven UI.
- When an API contract changes, update the frontend types, mapping layer, affected UI, and relevant documentation together.

## Styling

- Reuse design tokens such as colors, spacing, border radii, shadows, and typography.
- Avoid repeating the same literal CSS values across many files.
- Keep responsive behavior intentional.
- Preserve the visual language of the Figma design.
- Do not change the design direction unless explicitly requested.

## Motion and Interaction

- Use a single persistent cloud background across routes. It is fixed relative to the viewport and does not respond to page scrolling.
- Clouds move continuously from left to right with a slow, subtle drift. Do not morph, resize, or distractingly accelerate them.
- During desktop primary-route transitions, keep the continuous drift on the individual clouds and animate a separate persistent gust layer. The departing gust first makes a short anticipation movement opposite the navigation direction and then sweeps with the route; reset it only while invisible during the handoff, then let it enter from the destination side with continuous deceleration into the normal drift and no reverse-direction settle. Do not run the gust for mobile, reduced motion, Home section scrolling, or navigation within one primary route.
- Prefer lightweight CSS or platform animation primitives for simple motion. Do not select or install a final animation library until a concrete interaction requires it.
- Rive may be used for supplied animation assets when the relevant section is implemented.
- Honor `prefers-reduced-motion`. Use an intentionally composed static version of the same background, stop continuous motion, and replace spatial transitions such as 3D flips with an immediate state change or restrained crossfade.
- Do not invent hover, active, transition, or loading behavior where the design has not yet defined it. Confirm it when implementing the relevant component.
- Mobile project cards use an equal-sized, swipeable carousel with centered snapping and independent tap-to-flip behavior, following the approved Rolex reference and responsive examples.

## Asset Management

- Ask for the original asset before implementing a design element whose source file has not been provided. Do not crop production assets from the PNG mockups.
- Prefer SVG for suitable vector artwork and icons, and optimized WebP, AVIF, or PNG for raster artwork according to visual requirements.
- Use the existing `src/assets` hierarchy and organize assets by both type and domain where useful:
    - `src/assets/images/profile`
    - `src/assets/images/projects`
    - `src/assets/images/backgrounds`
    - `src/assets/images/decorations`
    - `src/assets/icons/navigation`
    - `src/assets/icons/social`
    - `src/assets/icons/services`
    - `src/assets/icons/actions`
    - `src/assets/animations/rive`
- Use descriptive filenames and keep decorative and content-bearing assets distinguishable for accessibility.

## Code Quality

- Code should pass ESLint before a task is considered complete.
- Use the Node.js test runner for framework-independent TypeScript modules until browser or component testing introduces a concrete need for an additional test dependency.
- Avoid unused imports, variables, and dead code.
- Handle errors where failure is possible.
- Add comments only when they explain non-obvious logic.
- Do not add comments that merely restate the code.
- Prefer self-explanatory code.

## Accessibility

- Use semantic HTML where appropriate.
- Interactive elements must be keyboard accessible.
- Images should have meaningful `alt` text unless decorative.
- Buttons and links should have clear accessible labels.
- Provide touch and keyboard equivalents for hover-only desktop interactions.
- Decorative clouds and background artwork must not be announced by assistive technology or intercept pointer input.
- Modals and contact panels require focus management, keyboard dismissal, appropriate dialog semantics, and focus restoration.

## File Structure

Use the existing project structure instead of creating new top-level folders without a clear reason.

Main folders:

- `src/assets`
- `src/components`
- `src/features`
- `src/pages`
- `src/data`
- `src/types`
- `src/styles`

## Git Workflow

- Before major commits, review `AGENTS.md` and update it when the implementation introduces or changes architectural decisions, product behavior, workflow requirements, or known constraints.
- Do not modify `AGENTS.md` for implementation details that do not change documented project decisions.
- If a change introduces no new decision, explicitly verify that `AGENTS.md` is still accurate before committing.
- Include relevant `AGENTS.md` updates in the same commit as the implementation that made them necessary.
- Never commit credentials, MongoDB connection strings, access tokens, populated environment files, or other secrets.
- Keep commits focused and make meaningful commits after major implementation stages, as required by the coursework.

## Before Finishing a Task

Always:

1. Check for TypeScript errors.
2. Run linting.
3. Run relevant API integration tests when the frontend API layer is affected.
4. Verify that existing pages and API contracts still work.
5. Review `AGENTS.md` and update it when decisions or requirements changed.
6. Avoid unrelated changes.
7. Summarize the files changed and the main decisions made.
