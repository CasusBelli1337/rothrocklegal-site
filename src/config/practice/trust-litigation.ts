import type { PracticeArea } from "../practice-areas";

export const trustLitigation: PracticeArea = {
  slug: "trust-litigation",
  hub: true,
  title: "Trust & Estate Litigation",
  headline:
    "When a trust or will doesn’t look right, we find out what happened.",
  seoTitle: "Trust & Estate Litigation Lawyers – San Jose & Santa Clara County",
  description:
    "Trust contests, will contests, undue influence, trustee breach, accountings, and elder financial abuse for families in San Jose and the Bay Area.",
  summary:
    "Trust and estate litigation is the court process for fixing what went wrong with a trust, a " +
    "will, or the person running it. Most of these cases turn on three questions: what changed, " +
    "who benefited, and when you found out. In California, the clock can be as short as 120 days " +
    "after a trustee’s notice (Probate Code § 16061.8).",
  card: {
    headline: "A second spouse is keeping everything.",
    answer:
      "Blended-family disputes turn on what the trust says, what changed, and when.",
    icon: "users",
    href: "/trust-litigation/#common-situations",
  },
  deadline: {
    headline: "Most trust contests run on a 120-day clock. Some have less.",
    body:
      "Once a trustee mails the notice required by Probate Code § 16061.7, you usually have 120 " +
      "days to contest the trust. Will contests, elder abuse claims, and accounting disputes each " +
      "have their own clock.",
  },
  statutes: [
    {
      cite: "Probate Code § 16061.7",
      plain: "The notice a trustee must send when a trust becomes irrevocable.",
    },
    {
      cite: "Probate Code § 16061.8",
      plain: "The 120-day window to contest a trust after that notice.",
    },
    {
      cite: "Probate Code § 17200",
      plain:
        "The petition that brings almost every trust dispute before the probate court.",
    },
    {
      cite: "Probate Code § 850",
      plain: "The petition to bring property back into a trust or estate.",
    },
    {
      cite: "Welfare and Institutions Code § 15610.30",
      plain: "The definition of financial elder abuse.",
    },
  ],
  faq: [
    {
      question: "What counts as trust and estate litigation?",
      answer:
        "Any dispute that ends up in probate court over a trust, a will, or the person running one: " +
        "contests, undue influence and capacity claims, breach of fiduciary duty, trustee removal, " +
        "accountings, Probate Code section 850 property petitions, and financial elder abuse.",
    },
    {
      question: "Which court hears these cases in Santa Clara County?",
      answer:
        "The Probate Division of Santa Clara County Superior Court at 191 N. First Street in San " +
        "Jose. Cases from the Peninsula and East Bay go to the San Mateo, Alameda, or San Francisco " +
        "Superior Courts.",
    },
    {
      question: "Do I need to hire a lawyer, or can I handle this myself?",
      answer:
        "You can file on your own, but trust contests have short deadlines, formal pleading rules, " +
        "and a burden of proof that rewards preparation. One conversation will tell you whether " +
        "your situation needs a lawyer.",
    },
    {
      question: "What if the trustee is my sibling?",
      answer:
        "That is the most common situation we see. The law treats a sibling trustee exactly like a " +
        "professional one: the same duties, the same accountings, the same consequences for breaking " +
        "them.",
    },
  ],
  categories: ["Trust Contests", "Deadlines", "Trustees & Fiduciaries"],
  author: "arthur-rothrock",
  updatedAt: "2026-09-01",
};
