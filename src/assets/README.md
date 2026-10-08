# Frontend assets

This directory contains static presentation assets that ship with the frontend build.

## Upload locations

- `fonts/` — self-hosted font files such as Inter WOFF2 assets.
- `images/profile/` — the local Hero/profile portrait.
- `images/backgrounds/` — persistent background artwork such as clouds.
- `images/decorations/` — decorative foreground artwork such as the footer landscape.
- `icons/navigation/` — navigation-specific icons.
- `icons/social/` — social platform icons.
- `icons/services/` — service category icons mapped from service icon keys.
- `icons/actions/` — reusable action icons such as flip, external-link, close, and scroll controls.
- `animations/rive/` — supplied Rive files when an approved section requires them.

Use original exported assets rather than crops from the PNG mockups. Prefer SVG for suitable vector artwork and optimized WebP, AVIF, or PNG for raster artwork.

Project logos, Home previews, and screenshots do not belong here. They are managed by the backend and must be rendered from the URLs and metadata returned by the Projects API.
