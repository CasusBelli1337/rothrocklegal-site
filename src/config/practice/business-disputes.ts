import type { PracticeArea } from "../practice-areas";

export const businessDisputes: PracticeArea = {
  slug: "business-disputes",
  parent: "trust-litigation",
  secondary: true,
  title: "Business & partnership disputes",
  headline: "A partner or co-owner broke the deal.",
  seoTitle: "Business Dispute Attorney in San Jose",
  description:
    "Partnership breakups, LLC member and shareholder disputes, breach of contract, and fiduciary claims between co-owners. Business litigation in San Jose.",
  summary:
    "Partners, LLC members, and co-owners owe each other duties of loyalty and care, and their " +
    "agreements set the rules for money, control, and exit. When a partner takes more than their " +
    "share, freezes you out, or walks off with the business, the remedies range from an accounting " +
    "and damages to dissolution. Written contract claims generally carry a four-year limit (Code " +
    "of Civil Procedure § 337).",
  deadline: {
    headline: "Four years on a written agreement, two on a spoken one.",
    body:
      "Breach of a written contract must be sued on within four years (Code of Civil Procedure " +
      "§ 337) and an oral agreement within two (§ 339). Fraud claims run three years from " +
      "discovery (§ 338(d)). Waiting also weakens injunction and dissolution options.",
  },
  statutes: [
    {
      cite: "Code of Civil Procedure § 337",
      plain: "Four years to sue on a written contract.",
    },
    {
      cite: "Code of Civil Procedure § 339",
      plain: "Two years to sue on an oral contract.",
    },
    {
      cite: "Code of Civil Procedure § 338(d)",
      plain: "Three years from discovery for fraud.",
    },
    {
      cite: "Corporations Code § 16404",
      plain: "The duties of loyalty and care partners owe each other.",
    },
  ],
  faq: [
    {
      question: "Do you still handle business disputes?",
      answer:
        "Yes. Trust and estate litigation is the focus of the firm, but partnership, LLC, and " +
        "contract disputes between co-owners use the same skills, and many of our estate cases " +
        "involve a family business.",
    },
    {
      question: "My partner is running the business without me. What can I do?",
      answer:
        "Demand the books, then decide between a buyout, an accounting and damages claim, or " +
        "dissolution. The operating or partnership agreement usually controls the first move.",
    },
    {
      question: "How long do these cases take?",
      answer:
        "A few months when the agreement is clear and the numbers are available; a year or more " +
        "when a business valuation is contested. Most settle before trial.",
    },
  ],
  categories: ["Business Disputes"],
  author: "arthur-rothrock",
  updatedAt: "2026-09-01",
};
