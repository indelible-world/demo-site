// Per-client content config.
// To create a new prospect's version: copy this file, edit the values below,
// drop that client's images into assets/images/, and point index.html's
// <script src="clients/..."> at the new file. No HTML/CSS/JS changes needed.

window.SITE_CONFIG = {
  clientName: "NEJM Client",

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
    image: "assets/images/nejm/frontpage.png",
    alt: "New England Journal of Medicine front page",
    // Bounding box of the article to highlight, as % of the image's own
    // width/height (not the screen) — so it stays aligned at any window size.
    highlight: { left: 0.2, top: 70.0, width: 65, height: 30.0 }
  },

  article: {
    // Screenshot of the digital article's headline/byline/photo block.
    headerImage: "assets/images/nejm/article.png",
    headerImageAlt: "Digital article: \"Balanced Fluid or 0.9% Saline in Children Treated for Septic Shock,\"",
    // Cutoff lands right after the sentence being quoted on the right,
    // so the paragraph text hands off into the two competing quote versions.
    paragraphs: [
      "Whether treatment with balanced crystalloid fluid leads to better outcomes than 0.9% saline in children treated for septic shock is debated.",
      "In this pragmatic clinical trial conducted at 47 emergency departments in five countries, patients (2 months to <18 years of age) with suspected septic shock and abnormal perfusion were randomly assigned to receive fluid resuscitation with either balanced fluid or 0.9% saline for up to 48 hours. The primary outcome was a major adverse kidney event (a composite of death, new renal-replacement therapy, or persistent kidney dysfunction) at 30 days after enrollment or hospital discharge, whichever occurred first.",
      "Of 9041 enrolled patients, 277 (6.1%) in the balanced-fluid group and 282 (6.2%) in the 0.9%-saline group withdrew from the trial, leaving 4235 and 4247 patients, respectively, for analysis. A primary-outcome event occurred in 137 patients (3.4%) in the balanced-fluid group and in 124 (3.0%) in the 0.9%-saline group (difference, 0.4 percentage points; 95% confidence interval [CI], −0.5 to 1.3; risk ratio, 1.10; 95% CI, 0.88 to 1.40; P=0.85). The median number of hospital-free days during 28 days after enrollment was 23 (interquartile range, 19 to 25) in both groups. Hyperchloremia occurred in 868 patients (31.4%) in the balanced-fluid group and in 1383 (49.0%) in the 0.9%-saline group; hypernatremia in 52 (1.8%) and 89 (3.1%), respectively; and hyperlactatemia in 260 (19.8%) and 228 (16.7%). No differences in other safety outcomes or adverse events were seen.",
    ]
  },

  quotes: {
    accurate: {
      label: "ORIGINAL",
      source: "As published",
      text: "…The primary outcome was a major adverse kidney event (a composite of death, new renal-replacement therapy, or persistent kidney dysfunction) at 30 days after enrollment or hospital discharge, whichever occurred first…",
      highlightPhrase: "adverse kidney event"
    },
    inaccurate: {
      label: "ALTERED",
      source: "Circulating online",
      text: "…The primary outcome was a major positive kidney transformation at 30 days after enrollment or hospital discharge, whichever occurred first…",
      highlightPhrase: "positive kidney transformation"
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
      '"Published in nejm.org at 4/23/2026, 2:38:00 PM."'
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
  },

  // Beat 6: after the price above lifts away, this rises into the space it
  // leaves and holds through the end of the scroll.
  cta: {
    heading: "Contact us to learn more",
    buttonText: "Get in touch",
    buttonHref: "https://indelible.world/#contact"
  }
};
