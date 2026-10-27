# Website design preferences

- All new images, videos, and media frames should use the shared `--media-radius` (10 px) rounded corners on desktop and mobile, as requested by the user.
- Preserve transparent image backgrounds. Media containers should not introduce an opaque white backdrop unless the user asks for one.
- Keep project pages on the shared template, fonts, spacing, and layouts. Add project content through `projects/<slug>/project.json`, `copy.md`, and numbered media, then rebuild with `scripts/build-projects.py`.

- Every project Overview must end with a thin full-width divider matching the reference (#d4d4d4, 1 px). Use the shared project stylesheet and avoid duplicate adjacent dividers.

- Project pages should retain the reference entrance animation: the title, opening image, and overview gently fade upward by 24 px over 800 ms, staggered by 100 ms. Respect reduced-motion preferences.
