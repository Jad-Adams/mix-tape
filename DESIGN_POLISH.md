# Mobile Responsive Polish — mix-tape

A living handoff document. Update the **Status** section at the end of every session so the next Claude session (or human) can pick up immediately.

---

## Status

**All sessions complete + post-session fix applied.**
Sessions complete: Session 1 (page layout & typography), Session 2 (player shell & top bar), Session 3 (button cap, icons & eject alignment), Session 4 (volume slider height), Post-session fix (player no longer stretches to fill viewport)

**Important:** The session 1 notes below describe `.md-player-scale-wrap` getting `flex: 1` — this was later reverted. Do NOT add `flex: 1` to that element. See the post-session fix section at the bottom for what actually landed.

---

## Context

The player was built desktop-first. On mobile viewports:
- Title typography is oversized, pushing the player down out of the viewport
- Controls end up below the fold
- The player has internal scaling issues: outer radius too large, top bar too tall, button caps over-inset, icons too large, volume slider too short

**Target outcome (Figma node 2033-4771):**
- Compact album text anchored at the top of the screen
- Player fills the available viewport between header and footer
- "mixtape / Curated by Jad" anchored at the bottom right
- Player shell looks proportionally correct: tighter radius, compact top bar, smaller icons

**Figma reference:**
https://www.figma.com/design/XKG36wbyVOvmjbUlkx8UR7/%F0%9F%93%BB-SIDEPROJECT-mix-tape?node-id=2033-4771

---

## Key measurements (mobile targets)

| Element | Current | Target |
|---|---|---|
| Outer device border radius | `32px` (token `--radius-device`) | `10px` |
| Inner player border radius | `16px` | `6px` |
| Top bar height | unconstrained (~60px+) | `36px` |
| Power button width | `116px` | `80px` |
| Clock width | `116px` | `80px` |
| Clock font size | `21px` | `14px` |
| Button cap inset | `16px` | `8px` |
| Button cap border radius | `12px` | `6px` |
| Button icon size | `40px` | `24px` |
| Skip button height | `72px` | `60px` |
| Volume container height | unconstrained (~60px) | `60px` (match skip buttons) |
| Title (`mixtape`) font size | `48px` | `24px` |
| Subtitle font size | `18px` | `13px` |

---

## Rules (must follow in every session)

- No hardcoded colour values — always reference tokens from `tokens.css`
- No inline styles
- All mobile overrides go in `styles/responsive.css` inside the existing `@media (max-width: 900px)` block
- Do not modify `script.js`, `playlist.json`, or `generate-playlist.js`
- Desktop layout must be unaffected by any mobile changes

---

## Architecture reminder

```
styles/
  core.css        — layout, title section, top bar, player shell, footer
  responsive.css  — ALL @media queries (mobile, desktop, reduced-motion)
  buttons.css     — .btn system, transport/skip/utility sizing
  slider.css      — volume range input
  screen.css      — LCD display, progress bar, visualizer
  power.css       — power state, LED, glitch keyframes
tokens.css        — all CSS custom properties for both themes
index.html        — HTML structure
```

---

## Sessions

### Session 0 (complete) — Write this document

---

### Session 1 — Page layout & typography

**Goal:** Album text at top, player fills middle, mixtape/Jad at bottom. Typography no longer oversized on mobile.

**HTML change (`index.html`):**
Split `.title-section` into two elements:
- `.page-header` — contains only the album subtitle (`p.title-subtitle.body`)
- `.page-footer` — contains `h1.title-main` and `p.title-subtitle` ("Curated by Jad")

The player (`.md-player-scale-wrap`) sits between them in the DOM.

**`styles/core.css`:**
Add base styles for `.page-header` and `.page-footer` so desktop layout continues to work (desktop shows them stacked like the old `.title-section`).

**`styles/responsive.css` (inside `@media (max-width: 900px)`):**
- `body`: `padding: 0`
- `.container`: `min-height: 100svh; padding: 16px; justify-content: space-between; gap: 0`
- `.md-player-scale-wrap`: `flex: 1; min-height: 0; display: flex; align-items: stretch`
- `.page-header`: small album text — `padding-bottom: 12px`
- `.page-footer`: right-aligned — `text-align: right; padding-top: 12px`
- `.title-main`: `font-size: 24px`
- `.title-subtitle`: `font-size: 13px`

**Verify:** Mobile 375px viewport screenshot. Player fills the space; all text fits without scrolling.

---

### Session 2 — Player shell & top bar

**Goal:** Reduce outer radius to ~10px. Top bar compresses to 36px.

**`styles/responsive.css` (inside `@media (max-width: 900px)`):**
```css
.md-player       { border-radius: 10px; }
.md-player-inner { border-radius: 6px; }
.top-bar         { height: 36px; }
.power-btn       { width: 80px; }
.btn-cap.power-cap { inset: 6px; gap: 6px; }
.power-led       { width: 8px; height: 8px; }
.power-label     { font-size: 9px; letter-spacing: 1px; }
.speaker-grille  { height: 20px; }
.top-bar-clock   { width: 80px; padding: 6px 8px; }
.clock-display   { font-size: 14px; }
```

**Verify:** Screenshot the top bar. Compact and proportional.

---

### Session 3 — Button cap, icons & eject alignment

**Goal:** Caps fill more of the button base. Icons 24px. Eject centred.

**`styles/responsive.css` (inside `@media (max-width: 900px)`):**
```css
.btn-cap    { inset: 8px; border-radius: 6px; }
.btn img    { width: 24px; height: 24px; }
.btn-skip   { height: 60px; }
```

If eject icon is still misaligned after the above:
```css
.btn-transport-eject .btn-cap {
    display: flex;
    align-items: center;
    justify-content: center;
}
```

**Verify:** Screenshot all button rows. Icons proportional, eject centred.

---

### Session 4 — Volume slider height

**Goal:** Volume slider container matches skip button height.

**`styles/responsive.css` (inside `@media (max-width: 900px)`):**
```css
.volume-slider-container {
    height: 60px;
    padding: 0 16px;
}
```

Check slider thumb doesn't visually overflow the container. If it does, add `overflow: hidden` to `.volume-slider-container`.

**Verify:** Screenshot the volume row. Flush with adjacent sections.

---

---

## Post-session fix — Player hugs content (not stretch)

After all four sessions, the player shell was stretching to fill the full viewport height because `.md-player-scale-wrap` had `flex: 1`. This was reverted.

**What actually landed in `responsive.css` (inside `@media (max-width: 900px)`):**

```css
/* Player container — no flex:1, hugs content */
.md-player-scale-wrap {
    width: 100%;
    transform: none;
    margin-bottom: 0;
}

/* Footer pinned to bottom via margin-top: auto */
.page-footer {
    flex-shrink: 0;
    text-align: right;
    padding-top: 12px;
    margin-top: auto;
}
```

The `body { height: 100svh }` + `container { flex: 1 }` combination means the container fills the viewport. The player sits at natural content height, and `margin-top: auto` on `.page-footer` pushes it to the bottom.

---

## How to resume in a new session

1. Read this file (`DESIGN_POLISH.md`) first
2. Read the **Status** block at the top
3. If all sessions are complete, there is no planned work remaining
4. If adding new polish sessions, follow the same rules (no hardcoded colours, no inline styles, mobile overrides in `responsive.css`)
