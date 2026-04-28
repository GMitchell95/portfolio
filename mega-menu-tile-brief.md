# MegaMenuTile — Claude Code Brief

## Overview
Build a new interactive tile component called `MegaMenuTile` and add it to the Selected Work section in `app/page.tsx`. The full working prototype is at `mega-menu-tile.html` in the project root — use it as the source of truth for all interactions, animations, layout and visual details.

---

## File to create
`components/tiles/MegaMenuTile.tsx`

---

## Tech notes
- React functional component, TypeScript
- Tailwind CSS v3 for all styling
- No external animation libraries — all transitions via Tailwind or inline CSS
- Shadcn breadcrumb component for the breadcrumb at the bottom
- Use `next/image` if any images are needed (none expected)
- Icons: inline SVGs only — all icon SVG paths are in the prototype HTML file. Do not use Font Awesome for this component.

---

## Component structure

The tile is a self-contained white card (`560px` tall, `border-radius: 16px`, `1px zinc-200 border`) containing:

1. **App header** — full width, `64px` tall, white bg, `1px zinc-200` bottom border, `border-radius: 16px 16px 0 0`
2. **Page body** — fills remaining height, vertical linear gradient from white (top) to violet-400 at 5% opacity (bottom), contains simulated page content bars/cards at low opacity

---

## Header layout

The header uses `position: relative` with two children:

### Nav pill (centred)
- `position: relative` container wrapping the pill and the mega menu anchor
- Pill: `zinc-50` bg, `1px zinc-100` border, `border-radius: 16px`, `4px` padding, `box-shadow: 0 1px 3px rgba(0,0,0,0.02)`
- Three tab buttons inside: Design, Bidding, Analysis
- Each tab: `height: 34px`, `padding: 0 12px`, `border-radius: 12px`, `font-size: 14px`, `font-weight: 500`
- **Sliding active indicator:** absolutely positioned white element inside the pill that animates `left` and `width` between tabs using `transition: left 0.27s ease-in-out, width 0.27s ease-in-out`. Use a `useEffect` + `ref` to measure each tab button's `offsetLeft` and `offsetWidth` and apply them to the slider.
- Active tab text: accent colour `#4443B4`. Inactive: `zinc-500`. Hover: `zinc-700`
- Tab icons: inline SVGs from the prototype (pencil = Design, gavel = Bidding, magnifying glass waveform = Analysis). Icon size `16×16px`. `fill="currentColor"` so colour inherits from tab.
- Clicking a tab only switches active state — never opens/closes the menu
- `outline: 1px solid rgba(0,0,0,0.02)` on the slider

### Chevron button (right of pill)
- `position: absolute`, `left: calc(100% + 4px)`, `top: 50%`, `transform: translateY(-50%)`
- Ghost icon button: transparent bg, no border, `36×36px`, `border-radius: 12px`
- Default: transparent. Hover: `zinc-100` bg. When menu open: `zinc-50` bg.
- Chevron SVG flips `rotate(180deg)` when menu is open using `transition: transform 0.2s ease`
- Clicking chevron toggles the mega menu open/closed
- `⌘K` keyboard shortcut also toggles (listen on the tile container)

---

## Mega menu panel

Anchored `4px` below the nav pill via a `position: absolute` anchor div (`top: calc(100% + 4px)`, `left: 50%`, `transform: translateX(-50%)`).

### Panel styles
- `width: 660px`, white bg, `border-radius: 16px`, `1px zinc-200` border
- `box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)`
- **Open/close animation:** `transform: scale(0.9→1)`, `opacity: 0→1`, `transform-origin: top center`
- Transition: `opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)`
- `pointer-events: none` when closed, `pointer-events: all` when open
- Close on outside click, close on `Escape`

### Search input
- `12px` padding around it (top, left, right), `8px` below
- Input container: `height: 36px`, `border-radius: 10px`, `1px zinc-200` border, `zinc-50` bg
- Focus state: accent border + `box-shadow: 0 0 0 3px rgba(68,67,180,0.12)`, white bg
- Left: search icon SVG (`16×16px`, `zinc-400`)
- Right: `⌘` and `K` kbd chips — white bg, `1px zinc-200` border, `border-radius: 6px`, `height: 24px`, `zinc-500` text

### Three-column grid
CSS grid: `grid-template-columns: 1fr 1px 1fr 1px 1fr`

Column dividers: `background: zinc-100`, `margin: 4px 0 12px`

**Menu items — same content regardless of active tab:**

Column 1 (Design):
- Event info (subtitles icon)
- Bid sheet (table-list icon)
- RFI (clipboard-question icon)
- Suppliers (user-group icon)
- Schedule (calendar-lines-pen icon)
- Settings (gear icon)

Column 2 (Bidding):
- Messages (envelope/Vector icon)
- Breakdown (chart-bar icon)

Column 3 (Analysis):
- Bid analysis (file-magnifying-glass icon)
- RFI analysis (clipboard-question icon — the `__1__1` variant)
- Scenario analysis (magnifying-glass-chart icon)

All icon SVG paths are in `mega-menu-tile.html`. Use `fill="currentColor"` on all paths. Each icon is wrapped in a `36×36px` container with `border-radius: 8px`, `zinc-100` bg. Hover: `zinc-200` bg.

**Menu item styles:**
- `padding: 8px`, `border-radius: 12px`, `gap: 12px` between icon and label
- Label: `14px`, `font-weight: 500`, `zinc-800`
- Hover bg: `zinc-50`

### Search filtering
- `startsWith` match on label text (case insensitive)
- Non-matching items hidden (`display: none`)
- On open: first visible item gets highlighted state (`zinc-50` bg)
- `↑` `↓` arrows move highlight up/down within a column
- `←` `→` arrows jump to same row position in adjacent column (skip empty cols)
- `Enter` selects highlighted item — updates nav tab + breadcrumb + closes menu
- Filter resets on close

---

## Breadcrumb (bottom left of tile)

Use the **shadcn breadcrumb component** (`components/ui/breadcrumb`). Install if not already present.

Position: `absolute`, `bottom: 20px`, `left: 24px`

Display inline with a label:
```
Page location  |  Design > RFI
```

- "Page location" label: `12px`, `font-weight: 500`, `zinc-400`, `letter-spacing: 0.02em`
- Divider: `1px` wide, `14px` tall, `zinc-200`
- Breadcrumb text: `13px`, `font-weight: 500`
- Parent link: `zinc-400`, hover `zinc-700`
- Current page: `zinc-700`
- Separator: chevron-right SVG, `zinc-300`

**Breadcrumb state logic:**
- Default: shows active tab name only e.g. `Design`
- Click a tab → breadcrumb updates to that tab name
- Select a menu item:
  - Column 1 item → `Design > [Page]`
  - Column 2 item → `Bidding > [Page]`
  - Column 3 item → `Analysis > [Page]`
- Clicking the parent in the breadcrumb resets to parent only
- Selecting a menu item also slides the nav tab to the column's parent

---

## Page body (simulated content)

Below the header, fills remaining space. Contains low-opacity (`opacity: 0.28`) placeholder bars and cards to simulate a page. Background: `linear-gradient(to bottom, #ffffff 0%, rgba(167,139,250,0.05) 100%)`.

---

## State summary

```ts
const [isOpen, setIsOpen] = useState(false)
const [activeTab, setActiveTab] = useState<'design' | 'bidding' | 'analysis'>('design')
const [highlightedIndex, setHighlightedIndex] = useState<number | null>(0)
const [searchQuery, setSearchQuery] = useState('')
const [breadcrumb, setBreadcrumb] = useState<{ parent: string; page?: string }>({ parent: 'Design' })
```

---

## Adding to page.tsx

Add `<MegaMenuTile />` to the Selected Work section in `app/page.tsx`, below the existing `<FormBuilderTile />`. Use the same tile label row pattern:

```tsx
<div className="tile-label-row"> {/* flex, space-between, mb-2 */}
  <span className="tile-label">Mega menu</span> {/* 12px, weight 500, zinc-500 */}
  <div className="flex items-center gap-1 text-xs text-zinc-400">
    <span>Click to open or press</span>
    <kbd className="...">⌘ K</kbd>
  </div>
</div>
<MegaMenuTile />
```

---

## Reference
All visual details, SVG icon paths, spacing values and interaction behaviour are in `mega-menu-tile.html` in the project root. When in doubt, match the prototype exactly.
