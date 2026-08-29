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
    eyebrow: "Verified media provenance",
    heading: "Restoring trust in news and information.",
    subtext: "indelible.world built a protocol for establishing verifiable, timestamped authorship of digital content, without relying on any centralized platform, server, or authority.",
    // Prompt in the top-right corner, fades in a beat after the page loads.
    scrollCue: "Scroll down to see how",
    features: [
      {
        icon: "⏱️",
        title: "Article Timestamping",
        body: "Fingerprints of articles are certified with verified timestamps that cannot be altered or erased."
      },
      {
        icon: "👥",
        title: "Authorship Attestation",
        body: "Articles can be verifiably attributed to a specific news organization."
      },
      {
        icon: "💬",
        title: "Native Quote Verification",
        body: "Quotes can be attributed to their original authors without requiring the full text of the article on standby."
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
      highlightPhrase: "refused to support"
    },
    inaccurate: {
      label: "ALTERED",
      source: "Circulating online",
      text: "…Senators Thom Tillis of North Carolina and John Cornyn of Texas elected to support Mr. Blanche’s nomination since he committed in writing to dropping a $1.8 billion fund…",
      highlightPhrase: "elected to support"
    }
  },

  // Beat 3: two blocks that slide in to replace the quotes column.
  attestations: {
    // Larger lead-in line that slides in first, holds, then slides back out
    // before the verified/invalid blocks take its place.
    leadText: "Quotes can be checked against an immutable fingerprint of the original published text...",
    // upperText/lowerText take either a single string or an array of strings —
    // an array renders as separate paragraphs within the same card.
    upperLabel: "VERIFIED",
    upperText: [
      '"Published by nytimes.com at 6/22/2026, 8:38:00 PM."'
    ],
    lowerLabel: "INVALID",
    lowerText: '"The quote could not be verified against the true source."'
  },

  // Beat 4: the article returns on the left, then every letter of it flies
  // across and scrambles into the fingerprint on the right — nothing but the
  // fingerprint is ever written to the chain.
  fingerprint: {
    // Small caption above the hash panel, fades in as the letters fly.
    caption: "We use cryptography to generate a unique fingerprint of your published text.",
    hashLabel: "STORED FINGERPRINT",
    // Each character becomes one landing slot for the article's letters, so its
    // length sets how the hash fills in.
    hash: "bafyrei3f8a1c05d7b26e94af0c5183be27d4f6a9152c7e0db438f1c6a2e59d70b4183c",
    note: "We store the article's fingerprint (and fingerprint only) to a public, timestamped ledger. The article text cannot be reconstructed from it, only checked against it."
  },

  // Beat 3.5: beat 3's two blocks clear off to the left and right, and these
  // three pillars rise into the space they leave, hold, then clear out for
  // beat 5. Three items are assumed by the layout (a 3-up grid).
  ownership: {
    heading: "Every article stays in your control.",
    items: [
      {
        icon: "🔑",
        title: "Keys",
        body: "Root signing keys (a sort of ultimate stamp) never leave the newsroom. You only delegate access to a secure Indelible key which can be revoked at any time."
      },
      {
        icon: "🎛️",
        title: "Control",
        body: "You can completely revoke a key's ability to sign articles on your behalf at any time, and you have seven days to revoke any erroneous attestations. The system never certifies articles without your permission."
      },
      {
        icon: "©",
        title: "Rights",
        body: "Copyright and licensing stay with you. The record we store proves authorship but never transfers or shares ownership of the work. The full text of the article is never republished without your permission."
      }
    ]
  },

  // Beat 5: after the pillars above clear, this crashes into the empty space.
  bigNumber: {
    amount: "$0",
    caption: "Free Verifications Forever & Free Certifications for Pilot Partners",
    footnote: "AI-powered misinformation is a growing problem that Indelible is building the solution to. Let's solve it today."
  }
};
