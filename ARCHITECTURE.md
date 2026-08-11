# newsroom-scroll — how this repo works

A single-page, scroll-driven storyboard demo for Indelible. It walks a viewer
through: a print front page → the same story as a digital article → two
competing versions of one quote → on-chain verification → the fact that the
article text itself is never stored, only a one-way fingerprint.

Everything is vanilla HTML/CSS/JS. No build step, no dependencies, no server —
open `index.html` in a browser.

## Files

| File | Role |
| --- | --- |
| `index.html` | Structure only. One `<section>` per beat group, empty elements that JS fills. |
| `clients/default.js` | **All copy and image paths.** Sets `window.SITE_CONFIG`. Loaded *before* `js/main.js`. |
| `js/main.js` | Populates the DOM from the config, then drives every animation from scroll position. |
| `css/style.css` | Layout, type, and the scroll-budget comments that document each section's timing. |
| `assets/images/` | Front-page and article screenshots referenced by the config. |

## Making a client version

Copy `clients/default.js`, edit the strings, drop that client's images into
`assets/images/`, and point `index.html`'s `<script src="clients/…">` at the new
file. No HTML/CSS/JS changes should ever be needed for new copy.

## The core mechanic: spacer + sticky stage

Every animated section is a tall `*-spacer` containing a `position: sticky;
top: 0` `*-stage`. The spacer's height *is* the animation's scroll budget: the
stage pins to the top of the viewport and stays there while the page scrolls
through the spacer, then releases.

Consecutive sections use a negative `margin-top` (`-48vh`) plus descending
`z-index` so the next section is already pulled up *underneath* the current one
while it fades out — the crossfade lands the new content exactly as the old one
dissolves, instead of only after it's gone.

### Timing convention (important)

Beats are keyed to **absolute vh scrolled since the stage pinned**, via the
`vh(n)` helper — never to a fraction of the total budget. That way, lengthening
a hold for a later beat can never stretch or speed up an earlier one.

```js
const scrolledPx = clamp(-rect.top, 0, Math.max(scrollable, 1));
const t = clamp((scrolledPx - vh(START)) / (vh(END) - vh(START)), 0, 1);
```

`scrollable` for a sticky element is `spacerHeight - stageHeight` — **not**
`spacerHeight - window.innerHeight`. `.intro-stage` and `.split-stage` have no
fixed height (they're sized by their own copy), so using the viewport height
there desynchronises the budget from when the pin actually releases.

Every threshold is mirrored in a scroll-budget comment above the matching
`*-spacer` rule in `css/style.css`. **Keep the two in sync.**

### Everything is scroll-position-driven, not transition-driven

Opacity/transform/color are written directly from scroll progress each frame
(inside one `requestAnimationFrame` tick in `onScrollOrResize`). This is
deliberate: a CSS transition or a one-shot "reveal" class plays forward only,
so scrolling back up leaves the storyboard in the wrong state. The only
transition-based reveal left is the generic `IntersectionObserver` /
`.is-visible` entrance on `.article-clip` and `.quote-card`.

## The beats

### Beat 0 — intro (`.intro-spacer` / `.intro-stage`)
Logo, mission statement, three feature blurbs from the config. Holds, then
fades out over the last 40% of its budget.

### Beat 1 — print front page (`.hero-spacer` / `.hero-stage`)
Full-bleed front-page image with a yellow highlighter (`#hero-highlight-box`)
drawn over one article.

`positionHighlight()` converts the config's `frontPage.highlight` percentages
into pixels. The image uses `object-fit: contain`, so its rendered box may be
letterboxed inside `.hero-frame`; the function recomputes that box from the
image's natural aspect ratio each frame so the highlight stays aligned at any
window size. `.hero-frame` is sized in `%` rather than `vw/vh` on purpose —
percentages resolve against the actual rendered box (scrollbar already
subtracted), which `vw` does not.

### Beat 2 — the same story, digital (`.split-spacer` / `.split-stage`)
Two-column grid: the digital article on the left (`.article-clip`), the
ORIGINAL and ALTERED versions of one quote on the right (`.quotes`).

`renderWithHighlight()` wraps the differing phrase (`North Carolina` /
`South Carolina`) in `<mark class="flag flag-…">`. The mark's *background
colour* is animated from scroll progress; the text itself is always fully
legible.

### Beat 3 — verification (same stage)
1. `.article-clip` fades out.
2. `.quotes` slides left into the article's column. The distance comes from
   `quotesShiftX()`, computed from the grid's own untransformed geometry —
   measuring the live column rects would be a moving target once the slide
   starts.
3. `.lead-column` slides in from the right, holds, then cross-dissolves out
   (opacity only, no reverse slide).
4. `.reveal-column` (VERIFIED / INVALID cards) slides in from the right.

`.lead-column`, `.reveal-column` and `.hash-column` all share grid cell
`column 2 / row 1` with `.quotes`, so each lands exactly where the quotes
started. `.article-clip` and `.quotes` therefore need **explicit** grid
placement too: explicitly-positioned items are placed before auto-flow runs,
so an unplaced `.quotes` would get pushed to row 2.

`.reveal-column` rests at `translateX(140%)`, not `100%`, so its `box-shadow`
blur clears `.split-grid`'s `overflow-x: hidden` edge instead of leaking into
view. That clip lives on `.split-grid` and **must not** move to an ancestor of
`.split-stage` — that would break `position: sticky`.

Cards that share a cell are absolutely positioned and centred by JS
(`centerOn()` / `positionFillerCards()`), because each card holds a different
amount of copy and equal flex gaps alone wouldn't line them up with the quote
cards they replace.

### Beat 4 — nothing is stored (same stage)
1. The quotes and VERIFIED/INVALID columns dissolve away and `.article-clip`
   fades back in, in its original position with the highlight marks faded out —
   the article exactly as first published.
2. `.hash-column` fades in on the right.
3. Every character of the article body flies individually across to the hash,
   scattering, spinning, scrambling into a hex digit and fading out as it
   arrives. The hash resolves left-to-right as the letters land.
4. The "no article text is ever stored" note fades in.

How the letter flight works:

- `splitIntoChars()` wraps each non-space character of `.article-body` in
  `<span class="char">`. Spaces stay as plain text nodes and the spans stay
  `display: inline` by default, so the article's line-breaking is unchanged
  while it's just being read.
- Layout is measured once, lazily (`measureCharLayout()`), and cached: each
  char's offset within `.article-body`, each paragraph's height, and each
  char's delta to its randomly-assigned slot in the hash string.
- `engageChars()` freezes the paragraph heights, pins every char at its
  measured offset, and switches them to `position: absolute` (via
  `.article-body.is-flying`). Because the positions were measured first, the
  article looks identical at the moment it becomes animatable. `releaseChars()`
  undoes all of it when you scroll back above the beat.
- Per-char randomness (arc, spin, stagger, hash slot, replacement hex digit)
  comes from a deterministic hash-based `rand(seed)`, computed once at init —
  `Math.random()` per frame would make the letters jitter.

## Conventions worth keeping

- Copy lives in `clients/*.js`, never in HTML or JS.
- New beats extend the existing `.split-spacer` budget; bump its `height` if
  the last beat's end approaches the current budget.
- Add new thresholds to both `updateSplitProgress()` and the CSS budget comment
  in the same edit.
- Prefer deriving positions from measured geometry over hard-coded pixels;
  everything must survive a window resize (`onScrollOrResize` re-runs the whole
  pass on `resize`, and beat 4 invalidates its cached measurements there).
