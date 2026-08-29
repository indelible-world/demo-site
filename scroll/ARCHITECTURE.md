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
| `css/style.css` | Layout and type. Spacer heights are just a pre-JS fallback — js/main.js's timelines set the real heights. |
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

Each section builds its own **timeline** once, near the top of its block in
`js/main.js`, via `createTimeline()`:

```js
const timeline = createTimeline();
timeline.hold(48);                       // a pause with nothing animating
const introFade = timeline.beat(30);     // reserves 30vh, returns { start, end }
const nextBeat = timeline.beat(20, { overlap: 10 }); // starts 10vh before introFade ends
```

`beat(length, { buffer, overlap })` reserves `length` vh, optionally followed
by `buffer` vh of hold, and returns the `{ start, end }` window (in vh scrolled
since the stage pinned) that beat occupies. `overlap` starts the beat that many
vh *before* the current cursor, so it runs concurrently with the tail of
whatever came right before instead of strictly after it. `hold(length)`
reserves a plain pause.

Read progress out of a window with `beatT(scrolledPx, beat)`, which replaces
hand-written `clamp((scrolledPx - vh(START)) / (vh(END) - vh(START)), 0, 1)`
math:

```js
const scrolledPx = clamp(-rect.top, 0, Math.max(scrollable, 1));
const t = beatT(scrolledPx, introFade);
```

Because every beat is stated as a length relative to the cursor rather than a
hand-computed absolute threshold, **moving, resizing, or reordering a beat only
means editing that one `beat()`/`hold()` call** — everything declared after it
in the same timeline shifts automatically. There is nothing to keep in sync by
hand across separate beats.

`scrollable` for a sticky element is `spacerHeight - stageHeight` — **not**
`spacerHeight - window.innerHeight`. `.intro-stage` and `.split-stage` have no
fixed height (they're sized by their own copy), so using the viewport height
there desynchronises the budget from when the pin actually releases.

Each spacer's actual height is set from its timeline: `sizeSpacer(spacer,
stage, timeline)` sets `height = stage.offsetHeight + vh(timeline.total)`, run
once on load/resize (not on every scroll tick, since changing a spacer's height
while scrolling would itself move the scroll position). `.hero-stage` is a
fixed `100vh` rather than content-sized, so its spacer is sized against
`window.innerHeight` instead. The `height` values written directly in
`css/style.css` are only a pre-JS fallback; **the timeline in `js/main.js` is
the single source of truth for scroll budgets** — there is no separate budget
to keep in sync in CSS.

### Everything is scroll-position-driven, not transition-driven

Opacity/transform/color are written directly from scroll progress each frame
(inside one `requestAnimationFrame` tick in `onScrollOrResize`). This is
deliberate: a CSS transition or a one-shot "reveal" class plays forward only,
so scrolling back up leaves the storyboard in the wrong state. The only
transition-based reveal left is the generic `IntersectionObserver` /
`.is-visible` entrance on `.article-clip` and `.quote-card`.

## The beats

### Beat 0 — intro (`.intro-spacer` / `.intro-stage`)
Logo, mission statement, three feature blurbs from the config. Starts fading
from the very first pixel scrolled (`introTimeline` has no leading `hold()`) so
the front page underneath begins revealing immediately rather than after a
wait — see `introTimeline` in `js/main.js`.

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

### Beat 3.5 — ownership (same stage)
1. Beat 3's two blocks clear the stage in opposite directions: `.quotes`
   (already parked in the article's column) continues off to the left, and
   `.reveal-column` retreats off to the right the way it came in. Both exits
   are layered onto the same `transform` their earlier beats set, so the two
   phases compose rather than fight.
2. `.ownership-block` rises into the space they vacate — heading first, then
   the keys/control/rights pillars on a per-item stagger, so the three read in
   sequence rather than appearing as one slab.
3. It holds, then lifts away and dissolves so beat 5 can land on the same spot.

Copy comes from `cfg.ownership` (`heading` plus an `items` array of
`{ icon, title, body }`); the 3-up grid assumes three items.

### Beat 5 — the price (same stage)
`.price-block` drops into the space beat 3.5's pillars vacate, oversized and
easing down to full size so it reads as an impact rather than a fade.

`.price-column` and `.ownership-column` both span `grid-column: 1 / -1` rather
than sharing column 2, so they centre across the whole grid; they're still
vertically centred on the quote cards' span via `centerOn()` so they land on the
same eye line every other beat has held. The drop carries the motion because
`.split-grid` clips the x axis but leaves y visible.

### Beat 6 — call to action (same stage)
The price holds, then lifts away the same way the ownership pillars did, and
`.cta-block` (heading + button, from `cfg.cta`) rises into the space it
vacates and holds through the end of the scroll.

`.cta-column` spans `grid-column: 1 / -1` like `.price-column`, and is
vertically centred on the quote cards' span via the same `centerOn()` call.

### Beat 7 — links (same stage)
`.cta-links` (the `indelible.world` / docs links) slides up beneath the CTA
once it's settled. It's animated on its own opacity/transform, separate from
`.cta-block`'s, so the heading/button read as staying fixed in place while
only the links move in underneath them.

## Conventions worth keeping

- Copy lives in `clients/*.js`, never in HTML or JS.
- New beats extend the existing `.split-spacer` budget; bump its `height` if
  the last beat's end approaches the current budget.
- Add new thresholds to both `updateSplitProgress()` and the CSS budget comment
  in the same edit.
- Prefer deriving positions from measured geometry over hard-coded pixels;
  everything must survive a window resize (`onScrollOrResize` re-runs the whole
  pass on `resize`, and beat 4 invalidates its cached measurements there).
