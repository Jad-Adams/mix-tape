# mix tape — UI Redesign Brief
**For use with Claude Code and Cursor AI sessions**
Always read this file before making any changes to the project.
Be aware that the user is not an engineer, but a designer looking to become a design engineer.

---

## Project overview

mix tape is a personal mixtape player website. It uses separate `index.html`, `script.js`, and `styles.css` files. The project is deployed on Vercel.

This brief covers a full UI redesign. The **goal is to replace all HTML structure and CSS styling** while preserving all existing JavaScript functionality exactly as-is.

---

## What must be preserved — do not touch

The following JavaScript features are working correctly and must not be modified, removed, or refactored:

- Audio playback engine
- JSON track loader (reads album/track data from a JSON file)
- Visualiser (canvas-based bar visualiser)
- Progress bar tracking (current time / duration)
- Skip forward and skip back logic
- Theme switching logic (already exists — extend it, do not replace it)

**Rule: If it is JavaScript, do not change it unless explicitly instructed.**

---

## What is being replaced

- All HTML markup (structure, class names, element hierarchy)
- All CSS (layout, colours, shadows, typography, component styles)
- Any inline styles

---

## Design philosophy

This player is inspired by late-90s Sony MiniDisc Walkman devices, interpreted through a modern, stylised retro lens — similar in craft to midlife.engineering. The aesthetic is physical and tactile. Every element should feel like it exists in three-dimensional space.

### The light source

The single most important design rule: **light comes from the top-left at roughly 10 o'clock.** Every shadow, every highlight, every gradient must obey this rule without exception. Consistency of the light source is what makes the design read as a physical object rather than a flat screen.

### The three depth layers

Every element on the player sits at one of three depths:

1. **Body** — the base surface of the device. Flat. No shadow of its own.
2. **Panel** — sections recessed into the body (button zones, slider zone). These have an **inset shadow**: darker top-left, lighter bottom-right.
3. **Button** — raised above the panel toward the user. These have a **drop shadow**: darker bottom-right, lighter top-left highlight edge.

The screen is the deepest element — more inset than any panel. It should feel like a window cut into the body.

### Shadow system

All shadows follow a consistent directional logic. Shadows use the tokens defined in `tokens.css`. Never hardcode shadow values.

**Raised element (button):**
```css
box-shadow:
  6px 6px 12px 6px rgba(0, 0, 0, 0.35),
  4px 4px 8px 4px rgba(0, 0, 0, 0.20),
  3px 3px 4px 0 rgba(0, 0, 0, 0.40),
  -2px -2px 6px 0 rgba(112, 112, 112, 0.40);
```

**Recessed element (panel):**
```css
box-shadow: var(--shadow-panel);
```
See `tokens.css` — `--shadow-panel` is defined per theme.

**Screen (deeply recessed):**
```css
box-shadow:
  20px 20px 40px 0 rgba(0, 0, 0, 0.20) inset,
  15px 15px 30px 0 rgba(0, 0, 0, 0.15) inset,
  10px 10px 20px 0 rgba(0, 0, 0, 0.15) inset,
  20px 20px 20px 0 rgba(0, 0, 0, 0.15) inset;
```

### Button pressed state

When a button is pressed (`:active`), apply inset shadows to simulate physical depression:
```css
box-shadow:
  -2px -2px 5px 4px rgba(0, 0, 0, 0.30) inset,
  8px 8px 7px 0 rgba(0, 0, 0, 0.20) inset,
  7px 7px 7px 0 rgba(0, 0, 0, 0.15) inset,
  5px 5px 4px 0 rgba(0, 0, 0, 0.15) inset,
  3px 3px 4px 0 rgba(0, 0, 0, 0.15) inset;
```

### Noise texture

A subtle noise texture is applied to the components to simulate the grain of real matte plastic. This is a tiled PNG image at low opacity (`3–5%`) using `mix-blend-mode: soft-light`. It should be a separate asset file referenced in CSS, not an inline base64 string.

---

## Typography

### Screen font
- **Font:** Share Tech Mono (Google Fonts)
- **Usage:** All text inside the player screen only
- **Colour:** Uses `--screen-text` token (LCD green in dark theme)

### UI font (copy outside the player)
- **Font:** Space Grotesk (Google Fonts)
- **Usage:** Page copy only — "mixtape", "curated by Jad", artist name
- **Hierarchy:**
  - "mixtape": large, regular weight
  - "curated by Jad": small, reduced opacity (~60%)
  - Artist name: small, truncated with `text-overflow: ellipsis`, displayed as an underlined link

---

## Layout

### Mobile (default)
- Player is vertical (portrait orientation)
- Copy sits above the player, left-aligned
- Player is centred horizontally on the page
- Player and copy together are vertically centred on the viewport

### Desktop (breakpoint: ~900px and above)
- Player rotates to horizontal (landscape orientation)
- Copy sits to the left of the player, left edge of copy aligns with left edge of player
- "mixtape" aligns to the top edge of the player
- The copy + player group is centred on the viewport as a unit
- Artist name truncates with ellipsis — never wraps or pushes the player

### Page background
- Changes with the active theme
- Dark theme: `var(--color-background)` — `#1c1c1c`
- Light theme: `var(--color-background)` — `#cac8c8`

---

## Themes

Two themes are implemented. Themes are applied by swapping a `data-theme` attribute on the `<body>` or root element. All theme values are CSS custom properties defined in `tokens.css`.

### Dark theme (default)
See `tokens.css` — `[data-theme="dark"]`

### Light theme
See `tokens.css` — `[data-theme="light"]`

The screen always uses the same dark green background and LCD green text regardless of theme. The screen is the one element that does not change between themes.

---

## Player components

The player is made up of these discrete components, each its own CSS block:

1. **Player shell** — outer container, rounded corners, body colour, drop shadow on page
2. **Top bar** — power button, speaker grille (dot grid), clock display
3. **Screen** — deeply recessed, dark green background, LCD green text, visualiser, progress bar
4. **Transport controls** — 4 buttons: eject, stop, pause, play
5. **Skip controls** — 2 wide buttons: skip back, skip forward
6. **Volume slider** — horizontal slider with custom thumb
7. **Utility buttons** — 4 buttons: light mode, dark mode, theme/skin picker, info
8. **Footer bar** — "MADE BY JAD" text, right-aligned

---

## Code standards — apply to every session

- **No hardcoded colour values anywhere.** Every colour, shadow, and border radius must reference a CSS custom property from `tokens.css`. All layout and component styles live in `styles.css`.
- **No unnecessary wrapper divs.** Use the minimum HTML elements needed. Prefer semantic elements.
- **No inline styles.**
- **CSS organised by component**, in the same order as the component list above.
- **Class names are lowercase, hyphenated.** Example: `.player-shell`, `.transport-controls`, `.screen-display`.
- **DRY CSS.** If three buttons share the same base style, write one `.btn` base class and extend it. Do not repeat shadow declarations.
- **All transitions are subtle.** Button press: `transition: box-shadow 80ms ease`. Theme switch: `transition: background-color 200ms ease`.

---

## File structure

```
mix-tape/
├── index.html
├── script.js              ← always ask for permission before modifying
├── styles.css             ← replace with new CSS
├── tokens.css             ← new file: all CSS custom properties, both themes
├── playlist.json          ← do not modify
├── generate-playlist.js   ← do not modify
├── DESIGN_BRIEF.md        ← this file (replaces CLAUDE.md)
├── assets/
│   ├── shared/
│   │   ├── bit.svg
│   │   ├── button-click.mp3
│   │   └── noise.png      ← new file to add: noise texture for player body
│   └── themes/
│       ├── light/         ← 11 icon/asset files
│       └── dark/          ← 11 icon/asset files (same names)
└── music/                 ← mp3 files, do not modify
```

Fonts are loaded via Google Fonts link in `index.html`, no local font files needed.

---

## Session startup checklist

Before making any changes in a new Claude Code or Cursor session, confirm:
1. You have read this file
2. You have read `tokens.css` and `styles.css`
3. You have read the existing `index.html` to understand the current JS structure
4. You will not modify any JavaScript without explicit permission
5. You will not hardcode any colour values
