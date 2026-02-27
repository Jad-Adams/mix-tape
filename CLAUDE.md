# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build-step web music player styled as a retro MiniDisc player. Serve with any static file server — the browser fetches `playlist.json` at runtime.

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

## Architecture

Three files do all the work:

- **`index.html`** — Static shell. Images use `data-asset="filename.svg"` instead of `src`; JavaScript resolves the real path at runtime based on the active theme.
- **`script.js`** — All player logic. Fetches `playlist.json`, drives the Web Audio API analyser/visualiser, handles playback state, theming, and UI events.
- **`styles.css`** — All styling. Theme variables are declared on `:root`/`[data-theme="light"]` and `[data-theme="dark"]`. Responsive layout switches at `900px` (desktop → mobile stacked layout).

## Theming

Themes are `light`, `dark`, and `grey` (grey is referenced in `setTheme` validation but has no asset folder yet — it falls back to light). Each theme needs a folder at `assets/themes/<theme>/` containing the same set of asset files as `light/` and `dark/`.

The `data-asset` attribute on `<img>` tags is the mechanism: `refreshThemeImages()` walks all such images and sets `src = assets/themes/<currentTheme>/<data-asset value>`. Theme preference persists via `localStorage` key `mixtape-theme`.

## Playlist

`playlist.json` is a flat JSON array: `[{ "title": "...", "artist": "...", "file": "music/..." }]`. The `script.js` also accepts `{ tracks: [...] }` or `{ playlist: [...] }` wrapper shapes. `generate-playlist.js` produces the flat array format.

## Assets

- `assets/shared/` — theme-independent files (favicon `bit.svg`, button click sound)
- `assets/themes/light/` and `assets/themes/dark/` — parallel sets of the same filenames; add a new theme by adding a new folder with all the same files
- `music/` — audio files; subdirectories are supported and walked recursively by `generate-playlist.js`
