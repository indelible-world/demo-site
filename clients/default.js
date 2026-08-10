// Per-client content config.
// To create a new prospect's version: copy this file, edit the values below,
// drop that client's images into assets/images/, and point index.html's
// <script src="clients/..."> at the new file. No HTML/CSS/JS changes needed.

window.SITE_CONFIG = {
  clientName: "Demo Client",

  // Beat 0: intro slide, sourced from indelible.world (logo + hero copy,
  // skipping the two CTA buttons; the three feature blurbs are kept).
  intro: {
    logo: "Indelible",
    eyebrow: "Blockchain-verified provenance",
    heading: "Restoring trust in news and information.",
    subtext: "An immutable, transparent system for content verification and attribution — so authentic information is easily verifiable, creators are properly credited, and misinformation is rapidly identifiable.",
    features: [
      {
        icon: "🔒",
        title: "Immutable Verification",
        body: "Content is permanently recorded with blockchain-verified provenance that cannot be altered or erased."
      },
      {
        icon: "👥",
        title: "Creator Attribution",
        body: "Every piece of content is traceable to its original source, ensuring proper credit and accountability."
      },
      {
        icon: "✔️",
        title: "Trust at a Glance",
        body: "Instantly distinguish verified, authentic content from unverified or manipulated information."
      }
    ]
  },

  frontPage: {
    image: "assets/images/frontpage.png",
    alt: "The New York Times front page",
    // Bounding box of the article to highlight, as % of the image's own
    // width/height (not the screen) — so it stays aligned at any window size.
    highlight: { left: 82.8, top: 21.0, width: 16.6, height: 79.0 }
  },

  article: {
    // Screenshot of the digital article's headline/byline/photo block.
    headerImage: "assets/images/article.png",
    headerImageAlt: "Digital article: \"Documents Blanche Released to Ease Path to Confirmation Leave Loopholes,\" by Devlin Barrett",
    // Cutoff lands right after the sentence being quoted on the right,
    // so the paragraph text hands off into the two competing quote versions.
    paragraphs: [
      "A pair of documents issued by the acting attorney general, Todd Blanche, that narrow or dissolve aspects of a deal to resolve President Trump’s lawsuit against the I.R.S. have met the demands of two Republican holdouts.",
      "Senators Thom Tillis of North Carolina and John Cornyn of Texas refused to support Mr. Blanche’s nomination unless he committed in writing to dropping a $1.8 billion fund funneling taxpayer money to the president’s allies and putting stricter limits on a part of the plan that provides sweeping protections to Mr. Trump and those in his inner circle from I.R.S. audits."
    ]
  },

  quotes: {
    accurate: {
      label: "ORIGINAL",
      source: "As published",
      text: "…Senators Thom Tillis of North Carolina and John Cornyn of Texas refused to support Mr. Blanche’s nomination unless he committed in writing to dropping a $1.8 billion fund…",
      highlightPhrase: "North Carolina"
    },
    inaccurate: {
      label: "ALTERED",
      source: "Circulating online",
      text: "…Senators Thom Tillis of South Carolina and John Cornyn of Texas refused to support Mr. Blanche’s nomination unless he committed in writing to dropping a $1.8 billion fund…",
      highlightPhrase: "South Carolina"
    }
  },

  // Beat 3: placeholder copy for the two blocks that slide in to replace
  // the quotes column. Swap for real content once this beat is designed.
  beat3: {
    // Larger lead-in line that slides in first, holds, then slides back out
    // before the verified/invalid blocks take its place.
    leadText: "Each quote is checked against an immutable fingerprint of the original published text...",
    upperLabel: "VERIFIED",
    upperText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    lowerLabel: "INVALID",
    lowerText: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  }
};
