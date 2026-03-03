# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Design standards and component rules live in `DESIGN_BRIEF.md`. Read that file before making any UI changes.**

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

Five files do all the work:

- **`index.html`** — Static shell. Images use `data-asset="filename.svg"` instead of `src`; JavaScript resolves the real path at runtime based on the active theme.
- **`script.js`** — All player logic. Fetches `playlist.json`, drives the Web Audio API analyser/visualiser, handles playback state, theming, and UI events. **Do not modify without explicit permission.**
- **`tokens.css`** — All CSS custom properties (colours, shadows, radii, transitions) for both themes. Every colour value in the project lives here.
- **`styles.css`** — All layout and component styles. References tokens from `tokens.css`. No hardcoded colour values.
- **`button.css`** — Button component styles (neumorphic base/cap/shadow system).

---

## Theming

Two themes are implemented: `light` and `dark`. Themes are applied via a `data-theme` attribute on `<html>`. All theme values are CSS custom properties defined in `tokens.css`. Theme preference persists via `localStorage` key `mixtape-theme`.

Each theme has a folder at `assets/themes/<theme>/` containing 12 icon SVG files. Both folders use identical filenames. Adding a new theme requires adding a new folder with all 12 files.

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
├── styles.css
├── tokens.css             ← all CSS custom properties, both themes
├── button.css             ← button component styles
├── playlist.json          ← do not modify
├── generate-playlist.js   ← do not modify
├── DESIGN_BRIEF.md        ← authoritative design and code standards doc
├── CLAUDE.md              ← this file
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
