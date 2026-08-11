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

  // Beat 3: two blocks that slide in to replace the quotes column.
  beat3: {
    // Larger lead-in line that slides in first, holds, then slides back out
    // before the verified/invalid blocks take its place.
    leadText: "Each quote is checked against an immutable fingerprint of the original published text...",
    // upperText/lowerText take either a single string or an array of strings —
    // an array renders as separate paragraphs within the same card.
    upperLabel: "VERIFIED",
    upperText: [
      "Published by 0xD2f2c95962632B4742703CC058889c624380C748 at 6/22/2026, 8:38:00 PM.",
      "ENS: nytimes.eth, indelibleworld.eth, test25.eth"
    ],
    lowerLabel: "INVALID",
    lowerText: "    The Merkle proof could not be verified against the on-chain attestation."
  },

  // Beat 4: the article returns on the left, then every letter of it flies
  // across and scrambles into the fingerprint on the right — nothing but the
  // fingerprint is ever written to the chain.
  beat4: {
    hashLabel: "STORED ON-CHAIN",
    hashPrefix: "0x",
    // Must be a plain hex string — each character becomes one landing slot for
    // the article's letters, so its length sets how the hash fills in.
    hash: "3f8a1c05d7b26e94af0c5183be27d4f6a9152c7e0db438f1c6a2e59d70b4183c",
    note: "This fingerprint is all that is stored. The article itself never leaves the newsroom — the text cannot be reconstructed from it, only checked against it."
  },

  // Beat 5: both beat 3 blocks clear off to the left and right, and this
  // crashes into the empty space they leave behind.
  beat5: {
    amount: "$0",
    caption: "Free Certifications & Verifications"
  }
};
