# AGENTS.md

## Project Overview

This repository contains the frontend for a production-oriented personal portfolio website built with React, TypeScript, and Vite. A separate Node.js, Express, Mongoose, and MongoDB Atlas repository provides portfolio content, references, users, and other dynamic features.

The site should remain clean, maintainable, reusable, and easy to extend in the future.

The portfolio is also being developed as part of COMP229 coursework. Backend coursework is implemented and submitted from its own repository. This frontend should consume that API through a typed integration layer without duplicating backend responsibilities.

## Current Product Scope

- The six primary routes are Home, Projects, Services, About Me, References, and Contact Me.
- Build Home first. Treat its sections as a preview of the dedicated routes rather than duplicating the complete content of those pages.
- Home uses normal document scrolling. Its major sections are designed as `100vh` sections, with the footer incorporated into the final contact section.
- Use Inter throughout the product, varying only size, weight, line height, and other typographic properties required by the designs.
- Navigation links open dedicated routes. The desktop navigation hides while scrolling down and returns while scrolling up.
- The section control in the lower-right corner scrolls to the top. The hero scroll affordance points down.
- Toronto time is live. `KEEP BUILDING` is decorative text.
- Desktop project cards flip independently with a 3D tap/click interaction. The circular flip icon is an affordance for the same action.
- Home displays three configurable featured projects. Project data must support Home selection, main-project selection, and explicit display ordering.
- The Services preview behaves as a single-open-item accordion. Desktop activation is by hover; keyboard focus and touch must have equivalent accessible behavior.
- The References section is a real, scrollable guestbook backed by MongoDB, with pagination or incremental loading.
- Submitting a reference starts with a message field. `Enter` continues to the details modal, while `Shift+Enter` inserts a newline. All modal fields are required.
- The profile card uses real GitHub data. Its resume button downloads the resume, and its likes and views are real persisted interactions.
- The final `HIT ME UP` call to action opens the contact panel shown in the approved design.

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
- Keep page-specific components close to their page when they are not reusable elsewhere.
- Avoid large monolithic page components.
- Extract repeated UI patterns into reusable components.
- Keep business/content data separate from presentation where practical.
- Keep persistent, site-wide visual layers such as the cloud background outside routed page content so route changes do not restart their animation.

## Routing

- Use client-side routing so navigation between portfolio pages does not reload the document.
- Keep the shared layout mounted across route changes.
- Page transitions are optional and should remain subtle if introduced after the core pages are visually complete.

## Data

- Do not hardcode project, service, or reference content directly into large JSX blocks when it can live in `src/data`.
- Define reusable TypeScript types in `src/types`.
- Structure data so it can later be replaced by a CMS or API without major UI rewrites.
- Treat the backend response as the source of truth for dynamic content while keeping UI-specific transformations outside presentation components.
- Normalize alternate request property names at the API boundary instead of storing duplicate fields such as `firstname` and `firstName`.
- The coursework fields are the minimum schema. Extend them with fields required by the approved UI without breaking the required API contracts or Postman collection.

## Backend Integration

- Keep all Express, Mongoose, MongoDB, authentication, and server deployment code in the separate backend repository. Do not create a `server/` application in this repository.
- Access the backend only through HTTP APIs and a typed frontend service layer. Do not connect to MongoDB from browser code.
- Configure the API base URL through a Vite environment variable and provide a safe `.env.example`. Never commit secrets or a populated `.env`.
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
- Prefer lightweight CSS or platform animation primitives for simple motion. Do not select or install a final animation library until a concrete interaction requires it.
- Rive may be used for supplied animation assets when the relevant section is implemented.
- Honor `prefers-reduced-motion`. Use an intentionally composed static version of the same background, stop continuous motion, and replace spatial transitions such as 3D flips with an immediate state change or restrained crossfade.
- Do not invent hover, active, transition, or loading behavior where the design has not yet defined it. Confirm it when implementing the relevant component.
- Mobile project cards will use an equal-sized, swipeable carousel with centered snapping and independent tap-to-flip behavior. Use the approved Rolex reference and later responsive examples when that work begins.

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
