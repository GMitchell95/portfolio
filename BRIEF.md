# Portfolio Site — Project Brief

This document defines the design system, technical decisions, and conventions for Glen Mitchell's personal portfolio site. Use this as the source of truth for all conversations in this project.

---

## About the site

A personal portfolio for a product and UI designer with ~8 years experience. The site is intentionally simple — work is shown up front through interactive tiles, with optional case study subpages for deeper detail. The site is a living document; tiles will be added and updated over time.

**Live URL:** https://portfolio-snowy-omega-kd19wqpkxe.vercel.app
**GitHub:** https://github.com/GMitchell95/portfolio
**Local dev:** `npm run dev` → localhost:3000

---

## Tech stack

- **Framework:** Next.js (app router), TypeScript
- **Styling:** Tailwind CSS v3
- **Deployment:** Vercel (free tier, auto-deploys on push to main)
- **Fonts:** Inter (Google Fonts, loaded via next/font/google)
- **Icons:** Font Awesome 6.5.1 (CDN, loaded in app/layout.tsx)
- **Lightbox:** PhotoSwipe v5

---

## Design principles

- Work shown up front — no click required to see it
- Interactive tiles where visitors can engage with actual UI components
- Simple, typographic, no unnecessary decoration
- Desktop first for now — mobile responsiveness to come later
- No serif fonts anywhere
- All spacing in multiples of 4px or 8px — no arbitrary values
- No uppercase text anywhere on the site
- No em dashes in any copy — use commas, full stops, or restructure the sentence

---

## Colour system

All colours are defined as CSS custom properties in `app/globals.css` and use Tailwind's Zinc palette as the base grey. Never use hardcoded hex values — use the CSS variables.

### CSS tokens (defined in :root in globals.css)

```css
:root {
  --color-heading: #18181B;     /* zinc-900 */
  --color-primary: #27272A;     /* zinc-800 */
  --color-body: #71717A;        /* zinc-500 */
  --color-muted: #A1A1AA;       /* zinc-400 */
  --color-secondary: #3F3F46;   /* zinc-700 */
  --color-border: #E4E4E7;      /* zinc-200 */
  --color-border-strong: #D4D4D8; /* zinc-300 */
  --color-surface: #F4F4F5;     /* zinc-100 */
  --color-surface-subtle: #FAFAFA; /* zinc-50 */
  --color-white: #FFFFFF;
  --color-accent: #4443B4;
  --color-accent-hover: #3332A0;
  --color-accent-light: #EBEBF8;
}
```

### Page colours
- **Page background:** Slate 50 (`bg-slate-50`)
- **Tile container background:** `var(--color-surface)` (zinc-100)
- **Card/surface background:** white

---

## Typography

One font throughout: **Inter**

### CSS tokens (defined in :root in globals.css)

```css
:root {
  --font-size-h1: 36px;
  --font-size-h2: 20px;
  --font-size-h3: 16px;
  --font-size-body: 15px;
  --font-size-small: 14px;
  --font-size-label: 12px;
  --font-size-nav: 13px;

  --font-weight-bold: 600;
  --font-weight-medium: 500;
  --font-weight-regular: 400;

  --line-height-heading: 1.3;
  --line-height-body: 1.5;
}
```

No uppercase text anywhere on the site. No serif fonts.

---

## Spacing

All spacing, padding, margin and gap values must be multiples of 4px or 8px.

- Small detail spacing: 4, 8, 12, 16px
- Larger spacing: 24, 32, 40, 48, 64, 80px

Never use arbitrary values like 5px, 7px, 14px, 22px etc.

---

## Layout

- **Max-width:** 1100px, centred with `margin: 0 auto`, `padding: 0 40px`
- **Tile container:** full width within the 1100px container, zinc-100 background, 16px border radius, 40px top and bottom padding
- **Tile label row:** flex row, space-between, label left-aligned, buttons right-aligned, 8px gap, 8px below row before tile container

---

## Button system

Reusable Button component lives at `components/ui/Button.tsx`.

### Variants
| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| primary | #4443B4 | white | none | #3332A0 |
| secondary | zinc-100 | zinc-800 | none | zinc-200 |
| outline | white | zinc-800 | zinc-200 + shadow-sm | zinc-50 bg, zinc-300 border |
| ghost | transparent | zinc-600 | none | zinc-100 bg, zinc-900 text |

### Sizes
| Size | Height | Padding | Font |
|---|---|---|---|
| sm | 32px (h-8) | 0 12px | 14px |
| md | 36px (h-9) | 0 16px | 14px |
| lg | 40px (h-10) | 0 24px | 14px |

### Shared properties
- Border radius: 8px
- Font: Inter, weight 500
- Transition: all 0.15s ease-out
- Active: scale(0.97)
- Focus ring: 0 0 0 3px rgba(68,67,180,0.2)
- Disabled: opacity 0.5, pointer-events none

---

## Project structure

```
portfolio/
├── app/
│   ├── globals.css                    — global styles, CSS tokens, PhotoSwipe overrides
│   ├── layout.tsx                     — Inter font, FA CDN link, Agentation (dev only), root layout
│   └── page.tsx                       — homepage (hero + work section)
├── components/
│   ├── case-studies/
│   │   └── simplified-navigation/
│   │       ├── types.ts               — Slide, SlideState, LightboxState interfaces
│   │       ├── icons.tsx              — ChevronLeft, ChevronRight
│   │       ├── ClickableImage.tsx     — image with zoom hint and lightbox trigger
│   │       ├── ClickableVideo.tsx     — video with zoom hint and PhotoSwipe lightbox
│   │       ├── StateSwitcher.tsx      — per-slide state pill switcher
│   │       ├── IterationSwitcher.tsx  — slide carousel with arrows and dots
│   │       └── Lightbox.tsx           — PhotoSwipe v5 lightbox
│   ├── tiles/
│   │   ├── FormBuilderTile.tsx
│   │   └── MegaMenuTile.tsx
│   └── ui/
│       └── Button.tsx
├── public/
│   ├── images/
│   │   └── case-studies/
│   │       └── simplified-navigation/ — all case study images
│   └── videos/                        — compressed mp4 screen recordings
├── CLAUDE.md                          — Claude Code instructions and conventions
├── next.config.ts                     — images.unoptimized: true
└── tailwind.config.js
```

---

## Tiles

### Current tiles
1. **Form builder** (`FormBuilderTile.tsx`) — question builder UI
2. **Mega menu** (`MegaMenuTile.tsx`) — interactive navigation component

### Tile conventions
- Tile container: zinc-100 bg, 16px radius, 40px padding top/bottom, full width
- Tile label: 12px, weight 500, zinc-500, sentence case, left-aligned
- Action buttons above tile: use `Button` component, `outline` variant, `sm` size
- Fixed container height — no jumping when content changes
- Desktop only for now

---

## Case study page — simplified navigation

**URL:** `/projects/simplified-navigation`

### Page structure
- Fixed sidebar nav (visible at ≥1200px)
- Scroll-triggered sticky header
- Sections: The brief, Explorations, Refined concept, Additional details, Interactive demo, Conclusion
- `scrollMarginTop: '39px'` on all sections for sidebar nav offset

### Key components
- `IterationSwitcher` — accepts a `slides` array, each slide can have optional `states` array for the StateSwitcher
- `StateSwitcher` — overlaid bottom-centre of the image, frosted glass pill, sliding active indicator
- `ClickableImage` — full width image with zoom hint, opens in PhotoSwipe lightbox on click
- `ClickableVideo` — same as ClickableImage but for video files
- `Lightbox` — PhotoSwipe v5, handles navigation, zoom, pan, state switching

### Image naming convention
All images stored in `public/images/case-studies/simplified-navigation/` with kebab-case filenames, no spaces.

### Video files
Stored in `public/videos/`, compressed mp4 via FFmpeg at CRF 28, 1280px wide, no audio.

---

## Prototyping

**CRITICAL: HTML prototype files must never be placed in the project root directory.** Turbopack will attempt to compile them and cause memory crashes. Keep all prototype HTML files on the Desktop or outside the project folder entirely.

Workflow:
1. Prototype interactions in HTML on the Desktop
2. Iterate until satisfied
3. Write a Claude Code brief for React implementation
4. Implement as a React component
5. Push to GitHub

---

## Shadow system

Following James McDonald's layered shadow formula:

```css
/* Subtle lift shadow */
box-shadow:
  0 0 0 1px rgba(0,0,0,0.03),   /* border replacement */
  0 1px 1px rgba(0,0,0,0.03),
  0 2px 2px rgba(0,0,0,0.03),
  0 4px 4px rgba(0,0,0,0.03),
  0 0 8px rgba(0,0,0,0.03);     /* even glow for lift */
```

---

## Workflow

### Development sessions
1. Open VS Code → open portfolio folder
2. Terminal: `npm run dev` (keeps running)
3. Claude Code terminal: `claude`
4. Paste brief, let it build, review at localhost:3000
5. Commit and push at end of every session

### Memory limits
- If Claude Code hits context limit, type `exit` then `claude` to start a fresh session
- Watch Activity Monitor — kill dev server with `Ctrl+C` if memory exceeds 14GB

### Committing
At end of each session:
> "Please commit all changes to GitHub with the message: [description]"

---

## Decisions log

| Decision | Rationale |
|---|---|
| Tailwind v3 not v4 | Better stability, Claude Code knows it well |
| Slate for page bg, Zinc for components | Slate's cool undertone suits the page; Zinc is neutral for UI |
| Inter throughout | Clean, legible at all sizes |
| Custom buttons not Shadcn | Keeps visual language consistent |
| CSS tokens in globals.css | Single source of truth for colours and typography |
| PhotoSwipe v5 for lightbox | Battle-tested, GPU-accelerated, handles zoom/pan/opening animation |
| unoptimized: true for images | Prevents Turbopack memory issues during compilation |
| No HTML files in project root | Turbopack compiles them and crashes the dev server |
| Components split into separate files | Keeps page.tsx lean, faster compilation |
| No em dashes | Design/copy decision — sentence case, commas instead |
| 4/8px spacing rhythm | Consistency with standard design systems |
| Desktop first | Ship faster, add mobile later |
