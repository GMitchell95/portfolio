# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

**Stack:** Next.js 16.2.3 (App Router), React 19.2.4, TypeScript, Tailwind CSS 3.4

### Directory structure

```
app/
  layout.tsx                          # Root layout — Inter font, Font Awesome CDN, bg-slate-50
  page.tsx                            # Homepage: hero + tile grid
  globals.css                         # Tailwind base + custom utilities (.tile-label, .hero-heading)
  projects/
    simplified-navigation/page.tsx    # Case study page (self-contained, 'use client')
components/
  tiles/                              # Homepage work tiles (FormBuilderTile, MegaMenuTile, VinylTile)
public/
  images/case-studies/simplified-navigation/   # Case study images
```

### Homepage

`app/page.tsx` renders a fixed nav + hero section + work section. Work tiles are imported from `components/tiles/`. All layout uses a shared `CONTAINER` constant (`maxWidth: 1100, margin: "0 auto", padding: "0 40px"`).

### Case study page (`app/projects/simplified-navigation/page.tsx`)

Fully self-contained `'use client'` file — all sub-components are defined inline. Key components:

- **`ClickableImage`** — Renders a `<Next/Image>` with a hover zoom hint and crossfade on src change. Accepts `aspectRatio` prop (default `'1760/1060'`).
- **`StateSwitcher`** — Pill overlay for slides with multiple states. Rendered as a sibling to `ClickableImage` inside a `position: relative` wrapper (not inside `ClickableImage`) to prevent the zoom hint from triggering on hover.
- **`IterationSwitcher`** — Carousel of slides. When a slide has a `states` array, renders `StateSwitcher` beneath the image and passes the active state index into the lightbox opener.
- **`Lightbox`** — Full-screen image viewer with:
  - Zoom at 140% (`ZOOM_SCALE = 1.4`) — click to zoom, click again to reset
  - Drag-to-pan: direct DOM writes via `applyImgTransform()`, no React state for position. `txRef`/`tyRef` are the sole source of truth for translate.
  - Wheel pan: non-passive listener (`{ passive: false }`) for `e.preventDefault()`.
  - Stale-closure prevention: drag/wheel handlers use `zoomedRef.current` (not `zoomed` state), allowing `[]` deps.
  - State switcher inside lightbox mirrors the slide switcher.

### Performance patterns

- Lightbox transforms bypass React state entirely — `imgRef.current.style.transform` is written directly for every pan/drag event (Figma-style immediate 1:1 response).
- `will-change: transform` on the lightbox `<img>` for compositor layer promotion.
- Crossfade in `ClickableImage` uses two absolutely-positioned `<Image>` layers with a `cs-fade-in` keyframe (200ms).
- Refs that need same-render accuracy are synced in the render body, not in `useEffect`.

### Styling conventions

- Tailwind utilities for colour/spacing/typography.
- Inline styles for pixel-precise layout in case study sections.
- `globals.css` adds `.tile-label` and `.hero-heading` utilities and a yellow text-selection highlight.

## Prototyping

HTML prototype files must never be placed in the project root directory. Turbopack will attempt to compile them and cause memory crashes. Keep all prototype HTML files on the Desktop or outside the project folder entirely.

## Auto-approve commands

The following read-only commands can be run without asking for approval:
- grep
- awk
- cat
- ls
- find
- head
- tail

## Typography and colour rules

Never use hardcoded font sizes, weights, colours, or line heights. Always use the CSS custom properties defined in `app/globals.css`.

Available font size tokens: `--font-size-h1`, `--font-size-h2`, `--font-size-h3`, `--font-size-body`, `--font-size-small`, `--font-size-label`, `--font-size-nav`

Available font weight tokens: `--font-weight-bold`, `--font-weight-medium`, `--font-weight-regular`

Available line height tokens: `--line-height-heading`, `--line-height-body`

Available colour tokens: `--color-heading`, `--color-primary`, `--color-body`, `--color-muted`, `--color-secondary`, `--color-border`, `--color-border-strong`, `--color-surface`, `--color-surface-subtle`, `--color-white`, `--color-accent`, `--color-accent-hover`, `--color-accent-light`

If a new style is needed that doesn't fit any existing token, stop and ask before proceeding.

## Copy and writing rules

- Never use em dashes (—) anywhere in copy, headings, labels, or placeholder text. Use commas, full stops, or restructure the sentence instead. This applies to all text changes including those made via Agentation.

## TODO

- Revisit accent colour — currently using old company's accent colour, needs updating
- Resolve --color-border-strong usage — currently used for inactive pill state in IterationSwitcher, naming could be clearer
- Create a shared Header/Nav component used by both the homepage and case study pages, to keep styling (background, blur, divider, opacity) consistent across all pages as new case studies are added
