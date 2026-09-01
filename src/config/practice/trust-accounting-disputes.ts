import type { PracticeArea } from "../practice-areas";

export const trustAccountingDisputes: PracticeArea = {
  slug: "trust-accounting-disputes",
  parent: "trust-litigation",
  title: "Accountings & information",
  headline: "The trustee won’t show us the numbers.",
  seoTitle: "Trust Accounting Dispute Attorney in San Jose",
  description:
    "Beneficiaries have a right to information and a yearly accounting. When a trustee stalls, the court can order one. Trust accounting disputes in San Jose.",
  summary:
    "A California trustee must keep beneficiaries reasonably informed, answer reasonable requests " +
    "for information, and account at least once a year (Probate Code §§ 16060–16062). If the " +
    "trustee stalls, a petition under Probate Code § 17200 asks the court to compel an accounting. " +
    "Once an accounting arrives, the clock to object starts running.",
  card: {
    headline: "The trustee won’t show us the accounting.",
    answer:
      "Beneficiaries have a right to information. A trustee who stalls can be ordered by the court " +
      "to account.",
    icon: "ledger",
  },
  deadline: {
    headline:
      "A written demand starts the trustee’s clock. Their accounting starts yours.",
    body:
      "After a written request, a trustee has 60 days to provide the information before you can " +
      "petition the court (Probate Code § 17200(b)(7)). When an accounting arrives, objections must " +
      "be filed within the time the court sets, and claims based on what it discloses generally " +
      "expire three years later (Probate Code § 16460).",
  },
  statutes: [
    {
      cite: "Probate Code § 16060",
      plain: "The trustee must keep beneficiaries reasonably informed.",
    },
    {
      cite: "Probate Code § 16061",
      plain:
        "The trustee must answer a beneficiary’s reasonable request for information.",
    },
    {
      cite: "Probate Code § 16062",
      plain:
        "An accounting at least annually, at the end of the trust, and on a change of trustee.",
    },
    {
      cite: "Probate Code § 16063",
      plain: "What a proper accounting has to contain.",
    },
    {
      cite: "Probate Code § 17200",
      plain:
        "The petition to compel an accounting or information from a trustee.",
    },
  ],
  faq: [
    {
      question: "Am I entitled to see the trust?",
      answer:
        "If you are a beneficiary or an heir of the person who made the trust, yes. Once the trust " +
        "becomes irrevocable, the trustee must provide a copy of the terms on request (Probate Code " +
        "section 16061.7).",
    },
    {
      question: "How often must a trustee account?",
      answer:
        "At least once a year, when the trust ends, and when a trustee changes (Probate Code " +
        "section 16062). The trust document can waive some of this, but a court can still order an " +
        "accounting when there is reason to.",
    },
    {
      question: "What if the accounting looks wrong?",
      answer:
        "You can file objections and ask the court to surcharge the trustee for any loss. Do it " +
        "promptly; an accounting that fairly discloses a problem starts a three-year limit on " +
        "claims about it.",
    },
    {
      question:
        "Can a trustee refuse to give me information because I am contesting the trust?",
      answer:
        "No. The duty to inform does not switch off because you disagree with the trustee. A " +
        "court can compel the information and, where the refusal is unreasonable, charge the " +
        "trustee with the cost.",
    },
  ],
  categories: ["Trustees & Fiduciaries", "Probate Process"],
  author: "arthur-rothrock",
  updatedAt: "2026-09-01",
};
