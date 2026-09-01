import type { PracticeArea } from "../practice-areas";

export const trustContests: PracticeArea = {
  slug: "trust-contests",
  parent: "trust-litigation",
  title: "Trust contests",
  headline: "Someone changed the trust, and it doesn’t add up.",
  seoTitle: "Trust Contest Attorney in San Jose",
  description:
    "A late amendment, a new beneficiary, a trust that suddenly favors one child. How to contest a " +
    "trust in California, the 120-day deadline, and what we do about it in San Jose.",
  summary:
    "You can contest a California trust if it was changed through undue influence, fraud, forgery, " +
    "or by someone who lacked capacity. The deadline is usually 120 days from the trustee’s " +
    "notice under Probate Code § 16061.7 (Probate Code § 16061.8). We look at who was in the room " +
    "and what the paper says.",
  card: {
    headline: "A sibling changed Mom’s trust.",
    answer:
      "Late amendments, a new beneficiary, a trust that suddenly favors one child. We look at who " +
      "was in the room and what the paper says.",
    icon: "pen",
  },
  deadline: {
    headline: "120 days from the trustee’s notice. Sometimes less.",
    body:
      "When a trustee serves the notice required by Probate Code § 16061.7, you have 120 days to " +
      "file a contest, or 60 days from the day the trust terms are delivered to you if that comes " +
      "later. Miss it and the court will usually not hear the contest at all.",
  },
  statutes: [
    {
      cite: "Probate Code § 16061.7",
      plain:
        "The trustee must serve notice within 60 days after the trust becomes irrevocable.",
    },
    {
      cite: "Probate Code § 16061.8",
      plain: "120 days from that notice to bring a contest.",
    },
    {
      cite: "Probate Code § 17200",
      plain:
        "The petition used to ask the court to decide whether an amendment is valid.",
    },
    {
      cite: "Probate Code § 21380",
      plain:
        "A gift to the person who drafted the amendment, or to a caregiver, is presumed to be the product of fraud or undue influence.",
    },
    {
      cite: "Probate Code § 21311",
      plain:
        "No-contest clauses reach only a narrow set of contests, and never one brought with probable cause.",
    },
  ],
  faq: [
    {
      question: "How long do I have to contest a trust in California?",
      answer:
        "Usually 120 days from the date the trustee serves the notice required by Probate Code " +
        "section 16061.7, or 60 days from the delivery of the trust terms, whichever is later. If no " +
        "notice was ever served, the clock may not have started. Confirm your dates with a lawyer.",
    },
    {
      question: "What are the grounds for contesting a trust?",
      answer:
        "Undue influence, lack of capacity, fraud, forgery, mistake, and failure to follow the " +
        "formalities the trust itself requires for an amendment. Most contests we see combine undue " +
        "influence with a capacity problem.",
    },
    {
      question: "Will a no-contest clause cost me my inheritance?",
      answer:
        "Rarely. California enforces no-contest clauses only against a narrow set of contests, and " +
        "a contest brought with probable cause is protected (Probate Code section 21311). We evaluate " +
        "the clause before anything is filed.",
    },
    {
      question: "What if I never received a notice?",
      answer:
        "Then the 120-day window may not have started, but do not rely on that. Trustees sometimes " +
        "serve notice at an old address, and other deadlines can still run. Bring us whatever mail " +
        "you have.",
    },
  ],
  categories: ["Trust Contests", "Deadlines", "Undue Influence & Capacity"],
  author: "arthur-rothrock",
  updatedAt: "2026-09-01",
};
