(function () {
  const cfg = window.SITE_CONFIG;
  if (!cfg) {
    console.error("SITE_CONFIG not found — check that clients/default.js loaded before main.js");
    return;
  }

  // ---------- Populate content from config ----------

  document.getElementById("intro-logo").textContent = cfg.intro.logo;
  document.getElementById("intro-eyebrow").textContent = cfg.intro.eyebrow;
  document.getElementById("intro-heading").textContent = cfg.intro.heading;
  document.getElementById("intro-subtext").textContent = cfg.intro.subtext;
  document.getElementById("intro-scroll-cue-text").textContent =
    cfg.intro.scrollCue || "Scroll down to see how";

  const introFeaturesEl = document.getElementById("intro-features");
  (cfg.intro.features || []).forEach((f) => {
    const item = document.createElement("div");
    item.className = "intro-feature";
    item.innerHTML =
      '<div class="intro-feature-icon"></div><h3></h3><p></p>';
    item.querySelector(".intro-feature-icon").textContent = f.icon;
    item.querySelector("h3").textContent = f.title;
    item.querySelector("p").textContent = f.body;
    introFeaturesEl.appendChild(item);
  });

  const frontPageImg = document.getElementById("front-page-img");
  frontPageImg.src = cfg.frontPage.image;
  frontPageImg.alt = cfg.frontPage.alt || "";

  const articleHeaderImg = document.getElementById("article-header-img");
  articleHeaderImg.src = cfg.article.headerImage;
  articleHeaderImg.alt = cfg.article.headerImageAlt || "";

  // Renders text into `container`, wrapping `phrase` (if present) in a
  // <mark> whose highlight color is driven continuously by scroll progress
  // (see updateSplitProgress below) — text itself is always fully legible,
  // only the highlight color fades in/out.
  function renderWithHighlight(container, text, phrase, tone) {
    if (phrase && text.includes(phrase)) {
      const [before, after] = text.split(phrase);
      container.appendChild(document.createTextNode(before));
      const mark = document.createElement("mark");
      mark.className = "flag flag-" + tone;
      mark.textContent = phrase;
      container.appendChild(mark);
      container.appendChild(document.createTextNode(after));
    } else {
      container.textContent = text;
    }
  }

  const articleBody = document.getElementById("article-body");
  (cfg.article.paragraphs || []).forEach((text) => {
    const p = document.createElement("p");
    renderWithHighlight(p, text, cfg.quotes.accurate.highlightPhrase, "verified");
    articleBody.appendChild(p);
  });

  fillQuoteCard(document.getElementById("quote-accurate"), cfg.quotes.accurate, "verified");
  fillQuoteCard(document.getElementById("quote-inaccurate"), cfg.quotes.inaccurate, "altered");

  function fillQuoteCard(card, data, tone) {
    card.querySelector(".quote-badge").textContent = data.label;
    card.querySelector("cite").textContent = data.source;
    const blockquote = card.querySelector("blockquote");
    blockquote.textContent = "";
    renderWithHighlight(blockquote, data.text, data.highlightPhrase, tone);
  }

  document.querySelector("#lead-text p").textContent = cfg.attestations.leadText;

  fillFillerCard(document.getElementById("filler-upper"), cfg.attestations.upperLabel, cfg.attestations.upperText);
  fillFillerCard(document.getElementById("filler-lower"), cfg.attestations.lowerLabel, cfg.attestations.lowerText);

  // `text` may be a string or an array of strings — an array renders one
  // paragraph per entry, so a card's copy can be broken into separate blocks.
  function fillFillerCard(card, label, text) {
    card.querySelector(".quote-badge").textContent = label;
    card.querySelectorAll("p").forEach((p) => p.remove());
    (Array.isArray(text) ? text : [text]).forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      card.appendChild(p);
    });
  }

  document.getElementById("ownership-heading").textContent = cfg.ownership.heading;
  const ownershipItemsEl = document.getElementById("ownership-items");
  (cfg.ownership.items || []).forEach((item) => {
    const el = document.createElement("div");
    el.className = "ownership-item";
    el.innerHTML = '<div class="ownership-item-icon"></div><h3></h3><p></p>';
    el.querySelector(".ownership-item-icon").textContent = item.icon;
    el.querySelector("h3").textContent = item.title;
    el.querySelector("p").textContent = item.body;
    ownershipItemsEl.appendChild(el);
  });
  const ownershipItemEls = Array.from(ownershipItemsEl.children);

  document.getElementById("price-amount").textContent = cfg.bigNumber.amount;
  document.getElementById("price-caption").textContent = cfg.bigNumber.caption;
  document.getElementById("price-footnote").textContent = cfg.bigNumber.footnote || "";

  // Beat 4: the hash is built one <span> per hex digit, because each digit is
  // a landing slot the article's letters are aimed at individually.
  const hashPanel = document.getElementById("hash-panel");
  const hashValueEl = document.getElementById("hash-value");
  const hashNoteEl = document.getElementById("hash-note");
  const hashCaptionEl = document.getElementById("hash-caption");
  hashPanel.querySelector(".quote-badge").textContent = cfg.fingerprint.hashLabel;
  hashNoteEl.textContent = cfg.fingerprint.note;
  hashCaptionEl.textContent = cfg.fingerprint.caption || "";

  const hashDigitEls = [];
  cfg.fingerprint.hash.split("").forEach((ch) => {
    const span = document.createElement("span");
    span.className = "hash-digit";
    span.textContent = ch;
    hashDigitEls.push(span);
    hashValueEl.appendChild(span);
  });

  // ---------- Scroll timeline helpers ----------
  // A beat is a { start, end } window, in vh scrolled since its stage
  // pinned. Each section below builds its own timeline out of beat()/hold()
  // calls stated purely as lengths — and buffers/overlaps relative to
  // whatever came before — never as hand-computed absolute thresholds. That
  // means moving, resizing, or reordering a beat reflows every beat after it
  // in that section automatically, with no other beat's numbers to touch.
  function createTimeline() {
    let cursor = 0;
    return {
      // Reserves `length` vh for a beat, then advances the cursor past it
      // plus `buffer` vh of hold before whatever comes next. Pass `overlap`
      // to have this beat start that many vh before the current cursor —
      // i.e. run concurrently with the tail of the previous beat, or in
      // parallel with a beat just added — instead of strictly after it.
      beat(length, { buffer = 0, overlap = 0 } = {}) {
        const start = cursor - overlap;
        const end = start + length;
        cursor = Math.max(cursor, end) + buffer;
        return { start, end };
      },
      // Reserves a hold with no animated beat of its own.
      hold(length) {
        cursor += length;
      },
      // Total vh this timeline's stage needs to stay pinned for.
      get total() {
        return cursor;
      }
    };
  }

  // Progress (0-1) of `scrolledPx` through a beat's { start, end } window.
  function beatT(scrolledPx, beat) {
    return clamp((scrolledPx - vh(beat.start)) / (vh(beat.end - beat.start) || 1), 0, 1);
  }

  // Sets a spacer's height from its stage's own live (content-driven) height
  // plus its timeline's scroll budget — the single source of truth for both
  // is the timeline itself, so tuning a beat never means also editing CSS.
  function sizeSpacer(spacer, stage, timeline) {
    spacer.style.height = stage.offsetHeight + vh(timeline.total) + "px";
  }

  // ---------- Intro fade-out ----------

  const introSpacer = document.querySelector(".intro-spacer");
  const introStage = document.querySelector(".intro-stage");

  // .hero-spacer's margin-top in css/style.css pulls it up to overlap the
  // tail of .intro-spacer by this much — kept as its own named constant
  // (rather than a bare number below) since .intro-fade's length must stay
  // >= this for the front page to already be visible for the entire window
  // where it's pulled up underneath the intro.
  const INTRO_HERO_OVERLAP_VH = 32;

  // Fades from the very first pixel scrolled — no hold first — so the front
  // page underneath starts revealing immediately instead of only after a
  // long hold, and finishes revealing well before the old fade would even
  // have started.
  const introTimeline = createTimeline();
  const introFade = introTimeline.beat(Math.max(32, INTRO_HERO_OVERLAP_VH));

  function updateIntroProgress() {
    const rect = introSpacer.getBoundingClientRect();
    // .intro-stage has no fixed height — it's sized by its own (variable
    // length) copy, so measure it live rather than assuming it's a full
    // viewport tall. See the identical fix on .split-stage's scrollable
    // for why using window.innerHeight here would drift out of sync with
    // when the pin actually releases.
    const scrollable = introSpacer.offsetHeight - introStage.offsetHeight;
    const scrolledPx = clamp(-rect.top, 0, Math.max(scrollable, 1));

    const fadeT = beatT(scrolledPx, introFade);
    introStage.style.opacity = String(1 - fadeT);
    introStage.style.pointerEvents = fadeT > 0 ? "none" : "auto";
  }

  // ---------- Hero scroll-linked highlight ----------

  const heroSpacer = document.querySelector(".hero-spacer");
  const heroStage = document.querySelector(".hero-stage");
  const heroFrame = document.querySelector(".hero-frame");
  const highlightBox = document.getElementById("hero-highlight-box");
  const hl = cfg.frontPage.highlight;

  function positionHighlight() {
    // Image is rendered with object-fit: contain inside heroFrame, so its
    // actual on-screen box may be letterboxed relative to heroFrame's box.
    const frameRect = heroFrame.getBoundingClientRect();
    const naturalW = frontPageImg.naturalWidth || 1;
    const naturalH = frontPageImg.naturalHeight || 1;
    const frameRatio = frameRect.width / frameRect.height;
    const imgRatio = naturalW / naturalH;

    let renderW, renderH, offsetX, offsetY;
    if (imgRatio > frameRatio) {
      renderW = frameRect.width;
      renderH = renderW / imgRatio;
      offsetX = 0;
      offsetY = (frameRect.height - renderH) / 2;
    } else {
      renderH = frameRect.height;
      renderW = renderH * imgRatio;
      offsetY = 0;
      offsetX = (frameRect.width - renderW) / 2;
    }

    highlightBox.style.left = offsetX + (hl.left / 100) * renderW + "px";
    highlightBox.style.top = offsetY + (hl.top / 100) * renderH + "px";
    highlightBox.style.width = (hl.width / 100) * renderW + "px";
    highlightBox.style.height = (hl.height / 100) * renderH + "px";
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // .split-spacer's margin-top in css/style.css pulls it up to overlap the
  // tail of .hero-spacer by this much — the fade-out beat below is kept the
  // same length so the digital article appears exactly as the front page
  // finishes dissolving.
  const HERO_SPLIT_OVERLAP_VH = 48;

  const heroTimeline = createTimeline();
  heroTimeline.hold(24);
  const heroHighlight = heroTimeline.beat(30);
  heroTimeline.hold(33);
  const heroFadeOut = heroTimeline.beat(HERO_SPLIT_OVERLAP_VH);

  function updateHeroProgress() {
    const rect = heroSpacer.getBoundingClientRect();
    const scrollable = heroSpacer.offsetHeight - viewportHeight;
    const scrolledPx = clamp(-rect.top, 0, Math.max(scrollable, 1));

    // Highlighter fades in over the article.
    highlightBox.style.opacity = String(beatT(scrolledPx, heroHighlight));

    // Front page fades out after a pause that gives the highlight a moment
    // to register before anything else starts moving. The two-column
    // section is pulled up underneath it (see .split-spacer's negative
    // margin in css/style.css) for this fade's duration, so the digital
    // article appears exactly as the front page dissolves, instead of only
    // after it's gone.
    const fadeT = beatT(scrolledPx, heroFadeOut);
    heroStage.style.opacity = String(1 - fadeT);
    heroStage.style.pointerEvents = fadeT > 0 ? "none" : "auto";
  }

  // ---------- Split-stage pin progress ----------
  // The whole beat sequence for this stage is built once below as a single
  // timeline: each call reserves a length (and optional trailing buffer, or
  // negative "overlap" into whatever came right before it), so moving a beat,
  // resizing one, or inserting a new one between two others just means
  // editing that one call — everything after it in the sequence shifts
  // automatically instead of needing its own absolute vh values updated.

  // Cached rather than read live: mobile browsers fire resize (and change
  // innerHeight) as the URL bar collapses/expands mid-scroll, which would
  // otherwise shift every beat threshold under the user's feet.
  let viewportHeight = window.innerHeight;
  function vh(n) {
    return (n / 100) * viewportHeight;
  }

  const splitSpacer = document.querySelector(".split-spacer");
  const splitStage = document.querySelector(".split-stage");
  const splitGrid = document.querySelector(".split-grid");
  const articleClip = document.querySelector(".article-clip");
  const quotesEl = document.querySelector(".quotes");
  const quoteAccurateEl = document.getElementById("quote-accurate");
  const quoteInaccurateEl = document.getElementById("quote-inaccurate");
  const leadColumn = document.querySelector(".lead-column");
  const leadTextEl = document.getElementById("lead-text");
  const revealColumn = document.querySelector(".reveal-column");
  const fillerUpperEl = document.getElementById("filler-upper");
  const fillerLowerEl = document.getElementById("filler-lower");
  const ownershipBlockEl = document.getElementById("ownership-block");
  const priceBlockEl = document.getElementById("price-block");
  const markEls = document.querySelectorAll("mark.flag");
  const MARK_MAX_ALPHA = { "flag-verified": 0.28, "flag-altered": 0.4 };
  const MARK_COLOR_VAR = { "flag-verified": "--accent-green", "flag-altered": "--accent-red" };

  // Beat 4 runs FIRST here: the article's letters scatter into the hash and
  // fly home before the quotes arrive (see ARCHITECTURE.md for the full
  // beat-by-beat narrative). Each `hold()` is a pause with nothing of its own;
  // each `beat()` reserves that animation's length and returns the window
  // `beatT()` reads progress from. `overlap` starts a beat that many vh before
  // the previous one finished, so two beats can run concurrently without
  // either one's length needing to account for the other.
  const splitTimeline = createTimeline();
  splitTimeline.hold(8); // article + hash panel sit in place, as published
  const fingerprintFlight = splitTimeline.beat(108); // letters fly out into the hash
  const fingerprintNote = splitTimeline.beat(30); // "nothing is stored" note fades in
  splitTimeline.hold(54);
  const fingerprintReturn = splitTimeline.beat(45); // letters fade back in at home
  // Hash panel dissolves (taking the note with it) as the quotes fade in,
  // overlapping the tail of the letters' return so the article refills as
  // the cards arrive.
  const quotesHashOut = splitTimeline.beat(18, { overlap: 15 });
  splitTimeline.hold(6);
  const quotesMarks = splitTimeline.beat(14); // quote/article marks fade in
  splitTimeline.hold(30); // lets the marks register before beat 3
  const attestationsArticleFade = splitTimeline.beat(10); // article fades out fully
  const attestationsQuotesSlide = splitTimeline.beat(12); // quotes slide into its place
  splitTimeline.hold(18);
  const attestationsLeadEnter = splitTimeline.beat(18); // lead-in line slides in
  splitTimeline.hold(16);
  const attestationsLeadExit = splitTimeline.beat(16); // lead-in line dissolves out
  // Verified/invalid column slides in from the right, overlapping the lead-in
  // line's exit above so the two run together rather than back to back.
  const attestationsRevealEnter = splitTimeline.beat(38, { overlap: attestationsLeadExit.end - attestationsLeadExit.start });
  splitTimeline.hold(42);
  const attestationsClear = splitTimeline.beat(18); // beat 3's two blocks slide off
  // Pillars rise into the space just vacated, overlapping the tail of that exit.
  const ownershipPillarsRise = splitTimeline.beat(28, { overlap: 4 });
  splitTimeline.hold(78); // pillars stay up to be read
  const ownershipPillarsLift = splitTimeline.beat(18); // pillars lift away
  // The price crashes into the space they vacated, overlapping the tail of
  // the pillars' exit above.
  const bigNumberCrash = splitTimeline.beat(36, { overlap: 6 });
  splitTimeline.hold(204); // then releases into normal scroll

  // How far .quotes must travel left to land where .article-clip's column
  // sits, derived from the grid's own (untransformed) geometry rather than
  // the columns' live rects — those move once the slide starts, which would
  // make measuring them directly a moving target.
  function quotesShiftX() {
    const gridRect = splitGrid.getBoundingClientRect();
    const gapPx = parseFloat(getComputedStyle(splitGrid).columnGap) || 0;
    const articleFr = 1.1;
    const quotesFr = 1;
    const articleColWidth = (gridRect.width - gapPx) * (articleFr / (articleFr + quotesFr));
    return -(articleColWidth + gapPx);
  }

  // .reveal-column shares .quotes' grid cell, but its two filler cards hold
  // different (lorem ipsum) text, so they won't naturally end up the same
  // height as the quote cards. Center each filler card on its corresponding
  // quote card's vertical midpoint instead of trusting equal flex gaps.
  function centerOn(fillerEl, quoteEl, quotesTop) {
    const quoteRect = quoteEl.getBoundingClientRect();
    const quoteCenter = quoteRect.top + quoteRect.height / 2 - quotesTop;
    const fillerHeight = fillerEl.getBoundingClientRect().height;
    fillerEl.style.top = quoteCenter - fillerHeight / 2 + "px";
  }

  function positionFillerCards() {
    const quotesTop = quotesEl.getBoundingClientRect().top;
    centerOn(fillerUpperEl, quoteAccurateEl, quotesTop);
    centerOn(fillerLowerEl, quoteInaccurateEl, quotesTop);
    // Lead-in line centers on the combined span of both quote cards, not
    // either one individually — it reads as one line, not paired with either.
    centerOn(leadTextEl, quotesEl, quotesTop);
    centerOn(hashPanel, quotesEl, quotesTop);
    // Sits just above the panel's own top edge — .hash-column has no height
    // of its own (both children are absolutely positioned), so the caption
    // can't be anchored with CSS alone the way .hash-panel's `top` is.
    const hashPanelTop = parseFloat(hashPanel.style.top) || 0;
    const captionHeight = hashCaptionEl.getBoundingClientRect().height;
    hashCaptionEl.style.top = hashPanelTop - captionHeight - 14 + "px";
    // Beats 3.5 and 5 span both columns, but still center on the quote cards'
    // span so they land on the same eye line everything else has held.
    centerOn(ownershipBlockEl, quotesEl, quotesTop);
    centerOn(priceBlockEl, quotesEl, quotesTop);
  }

  // ---------- Beat 4: article letters fly into the hash ----------

  const hashColumn = document.querySelector(".hash-column");
  const HEX = "0123456789abcdef";
  // How much of a window one individual letter's own trip occupies; the
  // remainder is the stagger spread across all letters. The return is a fade,
  // not a flight, so it wants a shorter per-letter duration than the outbound.
  // Both stay fixed regardless of how long fingerprintFlight/fingerprintReturn are tuned
  // to be — the per-letter animation length and the stagger spread across all
  // letters (derived from the beat's own length below) are independent knobs.
  const LETTER_FLIGHT_VH = 26;
  const LETTER_FADE_VH = 8;

  // Deterministic per-index pseudo-random. Math.random() per frame would make
  // each letter re-roll its arc every scroll tick and jitter in place.
  function rand(seed) {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  // Wraps every non-space character in its own <span class="char">. Spaces stay
  // as plain text nodes, and .char is `display: inline` until the beat engages,
  // so the article's line breaking is byte-for-byte unchanged while it's just
  // being read on the left.
  function splitIntoChars(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.nodeValue.split("").forEach((ch) => {
        if (/\s/.test(ch)) {
          frag.appendChild(document.createTextNode(ch));
          return;
        }
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });

    return Array.from(root.querySelectorAll(".char"));
  }

  const charEls = splitIntoChars(articleBody);

  // Flight personality per letter, rolled once: arc bow, spin, stagger offset,
  // which hash slot it lands on, and the hex digit it scrambles into.
  const charFx = charEls.map((_, i) => ({
    arcX: (rand(i + 1) - 0.5) * 240,
    arcY: (rand(i + 101) - 0.5) * 320,
    spin: (rand(i + 201) - 0.5) * 720,
    jitter: rand(i + 301),
    slot: Math.floor(rand(i + 401) * Math.max(hashDigitEls.length, 1)),
    digit: HEX[Math.floor(rand(i + 501) * HEX.length)],
    original: charEls[i].textContent
  }));

  let charLayout = null;
  let charsEngaged = false;

  // Measured once and cached: pulling the letters out of flow destroys the
  // geometry we need, so it has to be read while the article is still intact.
  function measureCharLayout() {
    if (charLayout) return charLayout;
    positionFillerCards();

    const bodyRect = articleBody.getBoundingClientRect();
    const slots = hashDigitEls.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - bodyRect.left,
        y: r.top - bodyRect.top,
        h: r.height
      };
    });

    const paras = Array.from(articleBody.querySelectorAll("p")).map((p) => ({
      el: p,
      height: p.getBoundingClientRect().height
    }));

    const chars = charEls.map((el, i) => {
      const r = el.getBoundingClientRect();
      const left = r.left - bodyRect.left;
      const top = r.top - bodyRect.top;
      const slot = slots[charFx[i].slot] || { x: left, y: top, h: r.height };
      return {
        el,
        left,
        top,
        dx: slot.x - left,
        dy: slot.y - top
      };
    });

    charLayout = { chars, paras };
    return charLayout;
  }

  // Freezes the paragraph boxes, pins each letter at the offset it already
  // occupied, then switches them to absolute — so the article looks identical
  // at the moment it becomes animatable.
  function engageChars() {
    if (charsEngaged) return;
    const layout = measureCharLayout();
    layout.paras.forEach((p) => {
      p.el.style.height = p.height + "px";
    });
    layout.chars.forEach((c) => {
      c.el.style.left = c.left + "px";
      c.el.style.top = c.top + "px";
    });
    articleBody.classList.add("is-flying");
    charsEngaged = true;
  }

  // `resetHash` only when releasing above the beat: on the way out the panel is
  // mid-fade and still visible, so clearing the digits there would flash the
  // hash dimming just before it disappears.
  function releaseChars(resetHash) {
    if (!charsEngaged) return;
    articleBody.classList.remove("is-flying");
    charLayout.paras.forEach((p) => {
      p.el.style.height = "";
    });
    charLayout.chars.forEach((c, i) => {
      c.el.style.cssText = "";
      c.el.textContent = charFx[i].original;
    });
    if (resetHash) hashDigitEls.forEach((el) => el.classList.remove("is-filled"));
    charsEngaged = false;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function updateCharFlight(scrolledPx) {
    // Released outside the beat entirely, not just parked at t=0: the chars have
    // to be back in normal flow for beat 2, or the <mark> wrapping "North
    // Carolina" collapses to zero width around its out-of-flow children and its
    // highlight never renders.
    const engaged =
      scrolledPx >= vh(fingerprintFlight.start - 2) && scrolledPx <= vh(fingerprintReturn.end + 2);
    if (!engaged) {
      releaseChars(scrolledPx < vh(fingerprintFlight.start - 2));
      return;
    }
    engageChars();

    const outStagger = vh(fingerprintFlight.end - fingerprintFlight.start - LETTER_FLIGHT_VH);
    const backStagger = vh(fingerprintReturn.end - fingerprintReturn.start - LETTER_FADE_VH);
    const n = charLayout.chars.length;

    charLayout.chars.forEach((c, i) => {
      const fx = charFx[i];
      // Mostly reading order, lightly shuffled, so the article empties from the
      // top down without the letters leaving in a rigid mechanical sweep.
      const order = (i / Math.max(n - 1, 1)) * 0.85 + fx.jitter * 0.15;
      const out = clamp(
        (scrolledPx - (vh(fingerprintFlight.start) + order * outStagger)) / vh(LETTER_FLIGHT_VH),
        0, 1
      );
      // Reuses `order`, so the article replenishes from the top in the same
      // sequence it emptied.
      const back = clamp(
        (scrolledPx - (vh(fingerprintReturn.start) + order * backStagger)) / vh(LETTER_FADE_VH),
        0, 1
      );

      // The letter is already invisible at the far end of its arc, so dropping
      // the transform and ramping opacity from home reads as the text
      // replenishing in place rather than flying back down.
      if (back > 0) {
        c.el.style.transform = "";
        c.el.style.opacity = back >= 1 ? "" : String(back);
        if (c.el.textContent !== fx.original) c.el.textContent = fx.original;
        return;
      }

      const t = out;
      if (t === 0) {
        c.el.style.transform = "";
        c.el.style.opacity = "";
        if (c.el.textContent !== fx.original) c.el.textContent = fx.original;
        return;
      }

      const e = easeInOut(t);
      const bow = Math.sin(Math.PI * t);
      // arcX/arcY are rolled once as fixed pixel amounts against a desktop-
      // width layout, so on narrower viewports they overshoot far past where
      // the same letters land on desktop — scale them down with viewport
      // width to keep the arc's on-screen size consistent across devices.
      const arcScale = clamp(viewportWidth / 1200, 0.35, 1);
      const x = c.dx * e + fx.arcX * bow * arcScale;
      const y = c.dy * e + fx.arcY * bow * arcScale;
      const rot = fx.spin * e;
      const scale = 1 - 0.15 * e;
      // Fades out only over the last stretch, so it's still legible as a letter
      // for most of the trip and only dissolves as it merges into the hash.
      const opacity = 1 - clamp((t - 0.7) / 0.3, 0, 1);

      c.el.style.transform =
        `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
      c.el.style.opacity = String(opacity);

      // Scrambles into a hex digit mid-flight — the letter arrives as part of
      // the fingerprint, not as itself.
      const shown = t > 0.5 ? fx.digit : fx.original;
      if (c.el.textContent !== shown) c.el.textContent = shown;
    });

    // Hash resolves left to right off overall flight progress rather than off
    // whichever letter happens to land on each slot first — slots are assigned
    // at random, so per-slot arrival would fill it in a scattered order. Once
    // resolved it stays resolved: the fingerprint persists, and it leaves only
    // with the whole panel's fade in beat 2.
    const outT = beatT(scrolledPx, fingerprintFlight);
    const filled = Math.round(outT * hashDigitEls.length);
    hashDigitEls.forEach((el, i) => {
      el.classList.toggle("is-filled", i < filled);
    });
  }

  function updateSplitProgress() {
    const rect = splitSpacer.getBoundingClientRect();
    // .split-stage has no fixed height (unlike .hero-stage's 100vh) — it's
    // sized by its own content, which is rarely exactly one viewport tall.
    // The real point where a top:0 sticky element releases is spacerHeight
    // minus ITS OWN height, not minus the viewport — using innerHeight here
    // let the hold budget below fall out of sync with when the element
    // actually unpins, so it would start scrolling away mid-"hold".
    const scrollable = splitSpacer.offsetHeight - splitStage.offsetHeight;
    const scrolledPx = clamp(-rect.top, 0, Math.max(scrollable, 1));

    // Beat 4 (first): the hash panel is simply part of the stage, sitting in its
    // column from the start, so it scrolls in with the article rather than
    // animating in on its own. Its only move is dissolving out for beat 2, once
    // the letters have flown out and faded home again.
    const hashOutT = beatT(scrolledPx, quotesHashOut);
    hashColumn.style.opacity = String(1 - hashOutT);

    updateCharFlight(scrolledPx);

    // Fades in over just the first sliver of the flight, so it's fully visible
    // for nearly the whole time the letters are airborne, not still ramping up.
    const captionInEnd = fingerprintFlight.start + (fingerprintFlight.end - fingerprintFlight.start) * 0.15;
    hashCaptionEl.style.opacity = String(
      beatT(scrolledPx, { start: fingerprintFlight.start, end: captionInEnd })
    );

    // Stays up once shown — it leaves with the panel's own fade, not on its own.
    hashNoteEl.style.opacity = String(beatT(scrolledPx, fingerprintNote));

    // Beat 2: the quotes cross-fade in as the hash leaves, overlapping the tail
    // of the letters' return so the article refills as the cards arrive.
    const quotesInT = beatT(scrolledPx, quotesHashOut);

    // Beat 2: highlights fade in, and fade back out on the same curve when
    // scrolling back up — continuously tied to scroll position, same as
    // .hero-highlight, rather than a one-time reveal that only runs forward.
    const markT = beatT(scrolledPx, quotesMarks);
    markEls.forEach((m) => {
      const tone = m.classList.contains("flag-verified") ? "flag-verified" : "flag-altered";
      m.style.backgroundColor = `hsla(var(${MARK_COLOR_VAR[tone]}), ${markT * MARK_MAX_ALPHA[tone]})`;
    });

    // Beat 3: article fades out fully first, then quotes slides into its
    // place — sequential, not simultaneous. The hold before it gives the
    // Carolina marks a moment to register.
    const fadeT = beatT(scrolledPx, attestationsArticleFade);
    articleClip.style.opacity = String(1 - fadeT);

    const slideT = beatT(scrolledPx, attestationsQuotesSlide);
    quotesEl.style.opacity = String(quotesInT);


    // Beat 3: lead-in line slides in from the right, holds, then exits via a
    // cross dissolve (opacity only, no reverse slide) rather than sliding
    // back out the way it came in.
    const leadEnterT = beatT(scrolledPx, attestationsLeadEnter);
    const leadExitT = beatT(scrolledPx, attestationsLeadExit);
    leadColumn.style.transform = `translateX(${(1 - leadEnterT) * 100}%)`;
    leadColumn.style.opacity = String(1 - leadExitT);

    // Beat 3: verified/invalid column slides in from the right to where
    // quotes started, starting as the lead-in line begins dissolving so the two
    // overlap rather than running back to back. Rests further right than a 100%
    // shift so its box-shadow's blur radius doesn't creep into .split-grid's
    // clipped (overflow-x: hidden) area while off-screen.
    const enterT = beatT(scrolledPx, attestationsRevealEnter);

    // Beat 3.5: beat 3's two blocks clear the stage in opposite directions —
    // the quotes (already parked in the article's column) continue off left,
    // the verified/invalid column retreats off right the way it came in.
    const clearT = easeInOut(beatT(scrolledPx, attestationsClear));
    const quotesX = quotesShiftX() * slideT - clearT * splitGrid.getBoundingClientRect().width;
    quotesEl.style.transform = `translateX(${quotesX}px)`;
    revealColumn.style.transform = `translateX(${((1 - enterT) + clearT) * 140}%)`;

    // Beat 3.5: the three pillars rise into the space just vacated, each on its
    // own stagger, hold, then lift away together so beat 5 can land there.
    const ownIn = beatT(scrolledPx, ownershipPillarsRise);
    const ownOut = beatT(scrolledPx, ownershipPillarsLift);
    ownershipBlockEl.style.opacity = String(clamp(ownIn / 0.25, 0, 1) * (1 - ownOut));
    const ownHeadE = 1 - Math.pow(1 - clamp(ownIn / 0.5, 0, 1), 3);
    ownershipBlockEl.style.transform = `translateY(${(1 - ownHeadE) * 5 - ownOut * 6}vh)`;
    // Staggered across the last three quarters of the entrance, so the heading
    // is already settled as the first pillar arrives.
    const OWN_SPAN = 0.75;
    ownershipItemEls.forEach((el, i) => {
      const start = 0.25 + (i / Math.max(ownershipItemEls.length, 1)) * OWN_SPAN;
      const t = clamp((ownIn - start) / (OWN_SPAN / Math.max(ownershipItemEls.length, 1)), 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      el.style.opacity = String(t);
      el.style.transform = `translateY(${(1 - e) * 4}vh)`;
    });

    // Beat 5: drops in oversized and slams down to full size, so it reads as an
    // impact rather than a fade — hence ease-out only, no symmetric ease. Scale
    // overshoot stays modest because .split-grid clips the x axis; the drop
    // carries the weight instead, since the y axis is unclipped.
    const crashT = beatT(scrolledPx, bigNumberCrash);
    const crashE = 1 - Math.pow(1 - crashT, 3);
    priceBlockEl.style.opacity = String(clamp(crashT / 0.3, 0, 1));
    priceBlockEl.style.transform =
      `translateY(${(1 - crashE) * -26}vh) scale(${1.55 - 0.55 * crashE})`;

    positionFillerCards();
  }

  // Spacer heights are derived from each section's own timeline total (plus
  // its stage's live content height) rather than hard-coded in CSS, so
  // lengthening or reordering beats above is the only edit tuning ever needs
  // — nothing to keep in sync on the CSS side.
  function sizeSpacers() {
    sizeSpacer(introSpacer, introStage, introTimeline);
    // .hero-stage is a fixed 100vh (see css/style.css), not content-sized
    // like the other two stages, so its own height is viewportHeight rather
    // than an offsetHeight measurement.
    heroSpacer.style.height = viewportHeight + vh(heroTimeline.total) + "px";
    sizeSpacer(splitSpacer, splitStage, splitTimeline);
  }

  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateIntroProgress();
      positionHighlight();
      updateHeroProgress();
      updateSplitProgress();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  // Sizing runs separately from the scroll-driven pass above (and isn't
  // re-run on every scroll tick): it changes each spacer's height, which
  // would itself shift scroll position if it ran while the user was mid-scroll.
  function resizeSpacersAndRefresh() {
    sizeSpacers();
    onScrollOrResize();
  }
  let viewportWidth = window.innerWidth;
  // Beat 4's letter positions are pixel measurements of the old layout, so they
  // have to be thrown away and re-measured against the new one.
  window.addEventListener("resize", () => {
    // Mobile browsers also fire resize when the URL bar collapses/expands
    // during scroll — only width moving means an actual layout change.
    if (window.innerWidth === viewportWidth) return;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    releaseChars(true);
    charLayout = null;
    resizeSpacersAndRefresh();
  });
  frontPageImg.addEventListener("load", resizeSpacersAndRefresh);
  resizeSpacersAndRefresh();

  // ---------- Generic reveal-on-scroll ----------

  const revealTargets = document.querySelectorAll(
    ".article-clip, .quote-card"
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  revealTargets.forEach((el) => observer.observe(el));
})();
