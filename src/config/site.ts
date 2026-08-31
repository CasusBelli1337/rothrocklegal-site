/**
 * Single source of truth for site-wide values.
 * Change firm details, nav, palette, and canonical host here — not in components.
 */

export const site = {
  name: "Rothrock Legal",
  tagline: "Tech-Assisted Legal Services: Better Results, Lower Costs",
  /** Canonical production host (after DNS cutover from Wix). */
  canonicalHost: "https://www.rothrocklegal.com",
  phone: "(408) 420-7034",
  phoneHref: "tel:+14084207034",
  email: "arothrock@rothrocklegal.com",
  /** Contact-form CCs so a submission is never missed by a single inbox. */
  formCc: ["jonathan@rothrocklegal.com", "glin@rothrocklegal.com"],
  location: "Silicon Valley, California",
  copyrightYear: 2026,
  aboutBlurb:
    "At Rothrock Legal, we understand the unique challenge that litigation presents and will give " +
    "you the confidence to handle it head on. Our founder, Arthur E. Rothrock, is not only an " +
    "experienced litigator but also the Co-founder and CEO of Legion LegalTech, Corp. a " +
    "groundbreaking AI legal technology company.",
} as const;

export interface NavLink {
  label: string;
  href: string;
}

/** Header navigation (Contact Us renders as the button beside these). */
export const nav: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about/" },
  { label: "News and Events", href: "/news-and-events/" },
  { label: "FAQ", href: "/faq/" },
  { label: "For Lawyers", href: "/for-lawyers-by-lawyers/" },
] as const;

export const contactCta: NavLink = { label: "Contact Us", href: "/contact/" };

/** Footer "Quick Links" column. */
export const footerLinks: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about/" },
  { label: "News and Events", href: "/news-and-events/" },
  { label: "FAQ", href: "/faq/" },
  { label: "For Lawyers, By Lawyers", href: "/for-lawyers-by-lawyers/" },
  { label: "IP Considerations", href: "/ip-considerations/" },
  { label: "AI Glossary", href: "/ai-glossary/" },
] as const;

/** Footer legal links (draft pages pending attorney review). */
export const legalLinks: readonly NavLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Disclaimer", href: "/disclaimer/" },
] as const;

export const social = {
  linkedin: "https://www.linkedin.com/in/rothrocka/",
} as const;

/**
 * Brand palette, as captured from the live Wix site (notes/fonts-and-colors.md).
 * The two maroons are preserved deliberately — bands/footer vs buttons/cards
 * drifted apart in the Wix editor and the rebuild keeps both (see CHANGES.md).
 * Mirrored as CSS custom properties in globals.css.
 */
export const palette = {
  maroonBand: "#66043D",
  maroonButton: "#672C44",
  gold: "#ECA217",
  navy: "#00305B",
  navyLight: "#0F4C85",
  buttonBorder: "#9E6185",
  ink: "#34011C",
  offwhite: "#FCF8FA",
  panel: "#FAFAFA",
} as const;

/** Prefix a public asset path with the basePath injected by GitHub Pages CI. */
export function asset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
