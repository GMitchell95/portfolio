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
- **Fonts:** Inter, self-hosted via fontsource variable font package (@fontsource-variable/inter)
- **Icons:** Font Awesome 6.5.1 (CDN, loaded in app/layout.tsx)
- **Lightbox:** PhotoSwipe v5

---

## Design principles

- Work shown up front — no click required to see it
- Interactive tiles where visitors can engage with actual UI components
- Simple, typographic, no unnecessary decoration
- Mobile responsiveness is in scope and actively being built
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
  --color-body: #52525B;        /* zinc-600 */
  --color-muted: #71717A;       /* zinc-500 */
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
│   ├── globals.css           — global styles, sw-* classes for Selected Work section
│   ├── layout.tsx            — Inter font (fontsource), FA CDN link, root layout
│   └── page.tsx              — homepage (hero + Selected Work + work section)
├── components/
│   ├── tiles/
│   │   └── FormBuilderTile.tsx   — first interactive tile
│   └── ui/
│       └── Button.tsx            — reusable button component
├── hooks/
├── lib/
├── public/
│   └── images/
│       └── case-studies/
│           ├── electricity-tracker/
│           ├── simplified-navigation/
│           └── messages/
├── AGENTS.md
├── BRIEF.md
├── CLAUDE.md
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

### Adding new tiles
1. Prototype the component in a standalone HTML file in Claude
2. Refine all interactions, states, animations and edge cases
3. Write a Claude Code brief referencing the HTML prototype
4. Place the HTML prototype in the portfolio root folder so Claude Code can reference it
5. Implement as a React component in components/tiles/
6. Add to app/page.tsx
7. Delete the HTML prototype from the root folder once implementation is complete

---

## Selected Work section

A grid of three project tiles on the homepage, positioned 80px below the intro text. Each tile links to its case study page. Heights driven entirely by CSS container queries — no JS measurement.

### Projects
| Order | Title | Year | href |
|---|---|---|---|
| 1 | Electricity tracker | 2026 | /projects/electricity-tracker |
| 2 | Simplified navigation | 2026 | /projects/simplified-navigation |
| 3 | Messages | 2025 | /projects/messages |

### Grid
- Desktop (≥900px): grid-template-columns: 1fr 1.55fr 1.55fr, gap 24px
- Tablet (700–899px): same columns, gap 16px
- Mobile (<700px): grid-template-columns: 1fr (stacked), gap 32px

### Tile hover states (all tiles)
- Tint overlay: ::after pseudo-element, opacity 0 → 0.04 black, 0.2s ease-out, z-index 0, sits behind the image (z-index 1) so only the zinc-100 padding area darkens
- Image lift/rotate: translateY(-1px) rotate(1deg), 240ms ease-out

### Portrait tile (Electricity tracker)
- Asymmetric image container padding: 24px top, 24px left, 24px right, 0 bottom
- Image runs flush to the bottom edge, cropped from the top (object-position: top)
- Image border radius: 8px 8px 0 0
- Height: calc(87.1875cqw + 21px) desktop/tablet, calc(56.25cqw + 21px) mobile
- Mobile (<700px): image width 50%, centered in the full-width tile

### Landscape tiles (Simplified navigation, Messages)
- Full natural image size, no object-fit, no forced height
- Next <Image> with width={3200} height={1800}

### Year reveal on hover
- Hidden by default: opacity 0, translateY(-8px)
- On hover: opacity 1, translateY(0), 240ms ease-out
- No layout shift — hidden via opacity/transform, not display:none
- Normal font style — no tabular-nums, no monospace

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
| Fontsource self-hosted Inter | Avoids Google Fonts network dependency, same variable font quality |
| Mobile responsiveness in scope | Originally desktop-first, now actively being built for all screen sizes |
| CSS container queries for portrait tile height | Eliminates JS measurement, ResizeObserver, SSR flash — height derived from fixed grid ratio and image aspect ratio, correct at any viewport width |
| Tabular-nums applied contextually | Used only where numeric alignment or live updates matter (e.g. data tables, counters, timers inside tiles). Not applied to decorative numbers like years on the Selected Work section |
