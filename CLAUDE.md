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
