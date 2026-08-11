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

  document.querySelector("#lead-text p").textContent = cfg.beat3.leadText;

  fillFillerCard(document.getElementById("filler-upper"), cfg.beat3.upperLabel, cfg.beat3.upperText);
  fillFillerCard(document.getElementById("filler-lower"), cfg.beat3.lowerLabel, cfg.beat3.lowerText);

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

  // ---------- Intro fade-out ----------

  const introSpacer = document.querySelector(".intro-spacer");
  const introStage = document.querySelector(".intro-stage");

  function updateIntroProgress() {
    const rect = introSpacer.getBoundingClientRect();
    // .intro-stage has no fixed height — it's sized by its own (variable
    // length) copy, so measure it live rather than assuming it's a full
    // viewport tall. See the identical fix on .split-stage's scrollable
    // for why using window.innerHeight here would drift out of sync with
    // when the pin actually releases.
    const scrollable = introSpacer.offsetHeight - introStage.offsetHeight;
    const progress = clamp(-rect.top / Math.max(scrollable, 1), 0, 1);

    // Fades out between 60%-100% scroll, identical timing to .hero-stage's
    // own fade below — the front page is pulled up underneath it the same
    // way .hero-spacer is pulled up underneath this section.
    const fadeT = clamp((progress - 0.6) / (1 - 0.6), 0, 1);
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

  // Keyed to absolute vh scrolled (like updateSplitProgress below), not a
  // fraction of the total, so the pause added after the highlight doesn't
  // also change the highlighter's own fade-in speed.
  function updateHeroProgress() {
    const rect = heroSpacer.getBoundingClientRect();
    const scrollable = heroSpacer.offsetHeight - window.innerHeight;
    const scrolledPx = clamp(-rect.top, 0, Math.max(scrollable, 1));

    // Highlighter fades in over the article.
    const highlightT = clamp((scrolledPx - vh(24)) / (vh(54) - vh(24)), 0, 1);
    highlightBox.style.opacity = String(highlightT);

    // Front page fades out after a pause (54-87vh) that gives the highlight
    // a moment to register before anything else starts moving. The two-column
    // section is pulled up underneath it (see .split-spacer's negative margin
    // in css/style.css) for the fade's 48vh duration, so the digital article
    // appears exactly as the front page dissolves, instead of only after
    // it's gone — that duration (87-135vh) must stay 48vh for the two to
    // stay in sync even if the pause before it changes.
    const fadeT = clamp((scrolledPx - vh(87)) / (vh(135) - vh(87)), 0, 1);
    heroStage.style.opacity = String(1 - fadeT);
    heroStage.style.pointerEvents = fadeT > 0 ? "none" : "auto";
  }

  // ---------- Split-stage pin progress ----------
  // Beats within the pin are keyed to absolute vh scrolled since it stuck
  // (not a fraction of the total), so extending the hold for a later beat
  // never stretches or speeds up an earlier one. Budget is mapped out atop
  // .split-spacer in css/style.css — keep the two in sync.

  function vh(n) {
    return (n / 100) * window.innerHeight;
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
  const markEls = document.querySelectorAll("mark.flag");
  const MARK_MAX_ALPHA = { "flag-verified": 0.28, "flag-altered": 0.4 };
  const MARK_COLOR_VAR = { "flag-verified": "--accent-green", "flag-altered": "--accent-pink" };

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

    // Beat 2: highlights fade in once the split section has settled at the
    // top of the viewport, and fade back out on the same curve when
    // scrolling back up — continuously tied to scroll position, same as
    // .hero-highlight, rather than a one-time reveal that only runs forward.
    const markT = clamp((scrolledPx - vh(10.5)) / (vh(24.5) - vh(10.5)), 0, 1);
    markEls.forEach((m) => {
      const tone = m.classList.contains("flag-verified") ? "flag-verified" : "flag-altered";
      m.style.backgroundColor = `hsla(var(${MARK_COLOR_VAR[tone]}), ${markT * MARK_MAX_ALPHA[tone]})`;
    });

    // Beat 3: article fades out fully first, then quotes slides into its
    // place — sequential, not simultaneous. Starts at 55vh, not 40vh, to
    // leave a longer pause (24.5-55vh) after the Carolina marks finish
    // fading in, so the highlight has a moment to register.
    const fadeT = clamp((scrolledPx - vh(55)) / (vh(65) - vh(55)), 0, 1);
    articleClip.style.opacity = String(1 - fadeT);

    const slideT = clamp((scrolledPx - vh(65)) / (vh(77) - vh(65)), 0, 1);
    quotesEl.style.transform = `translateX(${quotesShiftX() * slideT}px)`;

    // Beat 3: lead-in line slides in from the right, holds, then exits via a
    // cross dissolve (opacity only, no reverse slide) rather than sliding
    // back out the way it came in.
    const leadEnterT = clamp((scrolledPx - vh(95)) / (vh(113) - vh(95)), 0, 1);
    const leadExitT = clamp((scrolledPx - vh(129)) / (vh(145) - vh(129)), 0, 1);
    leadColumn.style.transform = `translateX(${(1 - leadEnterT) * 100}%)`;
    leadColumn.style.opacity = String(1 - leadExitT);

    // Beat 3: verified/invalid column slides in from the right to where
    // quotes started, once the lead-in line has dissolved away. Rests further
    // right than a 100% shift so its box-shadow's blur radius doesn't creep
    // into .split-grid's clipped (overflow-x: hidden) area while off-screen.
    const enterT = clamp((scrolledPx - vh(145)) / (vh(181) - vh(145)), 0, 1);
    revealColumn.style.transform = `translateX(${(1 - enterT) * 140}%)`;

    positionFillerCards();
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
  window.addEventListener("resize", onScrollOrResize);
  frontPageImg.addEventListener("load", onScrollOrResize);
  onScrollOrResize();

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
