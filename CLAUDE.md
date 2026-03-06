# CLAUDE.md

This file covers **architecture and workflow**. Design standards, component rules, and visual specifications live in `DESIGN_BRIEF.md` — read that file before making any UI changes.

## Before making any changes in a new Claude Code or Cursor session, confirm:
1. You have read this file
2. You have read `tokens.css` and the relevant file in `styles/`
3. You have read the existing `index.html` to understand the current structure
4. You will not modify any JavaScript without explicit permission
5. You will not hardcode any colour values

---

## What this is

A static, no-build-step web music player styled as a retro MiniDisc player. Serve with any static file server — the browser fetches `playlist.json` at runtime.

---

## Commands

**Serve locally** (required for audio and fetch to work — cannot open `index.html` directly from the filesystem):
```bash
npx serve .
# or
python3 -m http.server 8080
```

**Regenerate playlist after adding/removing tracks:**
```bash
node generate-playlist.js
```
This scans `music/` for `.mp3`, `.m4a`, `.ogg`, `.wav` files and writes `playlist.json`. Edit `playlist.json` afterward to set accurate `title`/`artist` values per track.

---

## Architecture

Key files:

- **`index.html`** — Static shell. Images use `data-asset="filename.svg"` instead of `src`; JavaScript resolves the real path at runtime based on the active theme.
- **`script.js`** — All player logic. Fetches `playlist.json`, drives the Web Audio API analyser/visualiser, handles playback state, theming, and UI events. **Do not modify without explicit permission.**
- **`tokens.css`** — All CSS custom properties (colours, shadows, radii, transitions) for both themes. Every colour value in the project lives here.
- **`styles.css`** — Entry point only. Imports all partials from `styles/`. No styles live here directly.
- **`styles/`** — CSS partials, each with a single responsibility:
  - `core.css` — resets, body, container, title section
  - `screen.css` — LCD display, progress bar, visualizer
  - `buttons.css` — `.btn` system and all button size variants
  - `slider.css` — volume range input styling
  - `power.css` — power state, LED, no-power overlay, glitch keyframes
  - `responsive.css` — all `@media` queries
  - `animations.css` — all `@keyframes`

---

## Theming

Two themes: `light` and `dark`. Applied via `data-theme` attribute on `<html>`. All theme values are CSS custom properties in `tokens.css`. Theme preference persists via `localStorage` key `mixtape-theme`.

Each theme has a folder at `assets/themes/<theme>/` containing **12 SVG icon files**: eject, info, minus, moon, pause, play, plus, skip-back, skip-forward, stop, sun, tamagotchi. Both folders use identical filenames.

---

## Playlist

`playlist.json` is a flat JSON array: `[{ "title": "...", "artist": "...", "file": "music/..." }]`. `script.js` also accepts `{ tracks: [...] }` or `{ playlist: [...] }` wrapper shapes. `generate-playlist.js` produces the flat array format.

---

## Assets

- `assets/shared/` — theme-independent files: `bit.svg` (favicon), `button-click.mp3` (UI sound), `noise.png` (grain texture overlay)
- `assets/themes/light/` and `assets/themes/dark/` — 12 SVG icon files each (identical filenames)

---

## File structure

```
mix-tape/
├── index.html
├── script.js              ← do not modify without explicit permission
├── styles.css             ← imports only; all styles live in styles/
├── styles/                ← CSS partials (one concern each)
│   ├── core.css
│   ├── screen.css
│   ├── buttons.css
│   ├── slider.css
│   ├── power.css
│   ├── responsive.css
│   └── animations.css
├── tokens.css             ← all CSS custom properties, both themes
├── playlist.json          ← do not modify
├── generate-playlist.js   ← do not modify
├── DESIGN_BRIEF.md        ← authority for design and visual decisions
├── CLAUDE.md              ← authority for architecture and workflow (this file)
├── playground.html        ← scratch/experimental file, not production
├── assets/
│   ├── shared/
│   │   ├── bit.svg
│   │   ├── button-click.mp3
│   │   └── noise.png
│   └── themes/
│       ├── light/         ← 12 SVG icon files
│       └── dark/          ← 12 SVG icon files (same names)
└── music/                 ← mp3 files, do not modify
```
