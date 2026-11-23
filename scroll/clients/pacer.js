// Per-client content config.
// To create a new prospect's version: copy this file, edit the values below,
// drop that client's images into assets/images/, and point index.html's
// <script src="clients/..."> at the new file. No HTML/CSS/JS changes needed.

window.SITE_CONFIG = {
  clientName: "PACER Client",

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
        title: "Opinion Timestamping",
        body: "Fingerprints of court opinions and filings are certified with verified timestamps that cannot be altered or erased."
      },
      {
        icon: "👥",
        title: "Court Attestation",
        body: "Opinions and filings can be verifiably attributed to the specific court that issued them."
      },
      {
        icon: "💬",
        title: "Native Quote Verification",
        body: "Quotes can be attributed to their original authors without requiring the full text of the opinion on standby."
      }
    ]
  },

  frontPage: {
    image: "assets/images/pacer/frontpage.png",
    alt: "First page of the Fifth Circuit opinion in State of Texas v. Blanche, No. 24-10386",
    // Bounding box of the article to highlight, as % of the image's own
    // width/height (not the screen) — so it stays aligned at any window size.
    highlight: { left: 17.0, top: 39.5, width: 67.0, height: 60.5 }
  },

  article: {
    // Screenshot of the digital article's headline/byline/photo block.
    headerImage: "assets/images/pacer/article.png",
    headerImageAlt: "Fifth Circuit opinion, State of Texas v. Blanche, No. 24-10386, Document 342-1, filed 11/20/2026",
    // The sentence quoted on the right appears verbatim in the first paragraph
    // (transcribed from the screenshot at the top of this card).
    paragraphs: [
      "We conclude that the enrolled-bill rule does not bar our review because Texas’s constitutional challenge does not implicate a dispute of fact regarding the Act’s passage. We further conclude that the Act’s passage was unconstitutional because the Quorum Clause does not allow proxies to be included when establishing a quorum. The Clause’s text, context, original understanding, and unbroken historical application all indicate that Members of Congress must be present for quorum purposes—as the Supreme Court expressly held over 125 years ago, and as Congress has done ever since the Founding. “Proxy presence” does not count. While the chambers of the legislature have much discretion regarding their rules of procedure, the Quorum Clause’s constraints on congressional power cannot be circumvented by congressional fiat. We therefore affirm the judgment of the district court.",
      "In the early days of the global COVID pandemic, the House of Representatives adopted House Resolution 965:",
      "[A]t any time after the Speaker . . . is notified . . . that a public health emergency due to a novel coronavirus is in effect, the Speaker . . . may designate a period . . . during which a Member who is designated by another Member as a proxy . . . may cast the vote of such other Member or record the presence of such other Member in the House."
    ]
  },

  quotes: {
    accurate: {
      label: "ORIGINAL",
      source: "As issued by the court",
      text: "…We further conclude that the Act’s passage was unconstitutional because the Quorum Clause does not allow proxies to be included when establishing a quorum…",
      highlightPhrase: "does not allow proxies"
    },
    inaccurate: {
      label: "ALTERED",
      source: "Circulating online",
      text: "…We further conclude that the Act’s passage was constitutional because the Quorum Clause does allow proxies to be included when establishing a quorum…",
      highlightPhrase: "does allow proxies"
    }
  },

  // Beat 3: two blocks that slide in to replace the quotes column.
  attestations: {
    // Larger lead-in line that slides in first, holds, then slides back out
    // before the verified/invalid blocks take its place.
    leadText: "Quotes can be checked against an immutable fingerprint of the original opinion as filed...",
    // upperText/lowerText take either a single string or an array of strings —
    // an array renders as separate paragraphs within the same card.
    upperLabel: "VERIFIED",
    upperText: [
      '"Filed with the U.S. Court of Appeals for the Fifth Circuit on 11/20/2026 (Case 24-10386, Document 342-1)."'
    ],
    lowerLabel: "INVALID",
    lowerText: '"The quote could not be verified against the opinion filed with the court."'
  },

  // Beat 4: the article returns on the left, then every letter of it flies
  // across and scrambles into the fingerprint on the right — nothing but the
  // fingerprint is ever written to the chain.
  fingerprint: {
    // Small caption above the hash panel, fades in as the letters fly.
    caption: "We use cryptography to generate a unique fingerprint of the filed opinion.",
    hashLabel: "STORED FINGERPRINT",
    // Each character becomes one landing slot for the article's letters, so its
    // length sets how the hash fills in.
    hash: "bafkreieg2sfnrcluxzzzhk6m2oeprqe7sxw4slnfpr6ws5j3krfyr435vi",
    note: "We store the opinion's fingerprint (and fingerprint only) to a public, timestamped ledger. The opinion text cannot be reconstructed from it, only checked against it."
  },

  // Beat 3.5: beat 3's two blocks clear off to the left and right, and these
  // three pillars rise into the space they leave, hold, then clear out for
  // beat 5. Three items are assumed by the layout (a 3-up grid).
  ownership: {
    heading: "Every filing stays in the court's control.",
    items: [
      {
        icon: "🔑",
        title: "Keys",
        body: "Root signing keys (a sort of ultimate stamp) never leave the court. You only delegate access to a secure Indelible key which can be revoked at any time."
      },
      {
        icon: "🎛️",
        title: "Control",
        body: "You can completely revoke a key's ability to sign opinions on the court's behalf at any time, and you have seven days to revoke any erroneous attestations. The system never certifies an opinion without the court's permission."
      },
      {
        icon: "©",
        title: "Rights",
        body: "The record we store proves which court issued an opinion, and when, but never alters the official record. The full text of the opinion is never republished or stored by Indelible."
      }
    ]
  },

  // Beat 5: after the pillars above clear, this crashes into the empty space.
  bigNumber: {
    amount: "$0",
    caption: "Free Verifications Forever & Free Certifications for Pilot Partners",
    footnote: "AI-generated alterations of public records are a growing problem that Indelible is building the solution to. Let's solve it today."
  },

  // Beat 6: after the price above lifts away, this rises into the space it
  // leaves and holds through the end of the scroll.
  cta: {
    heading: "Contact us to learn more",
    buttonText: "Get in touch",
    buttonHref: "https://indelible.world/#contact"
  }
};
