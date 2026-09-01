import type { PracticeArea } from "../practice-areas";

export const willContests: PracticeArea = {
  slug: "will-contests",
  parent: "trust-litigation",
  title: "Will contests",
  headline: "The will isn’t what Mom or Dad said it would be.",
  seoTitle: "Will Contest Lawyer in San Jose",
  description:
    "Cut out of a will, or a will that appeared late? How to contest a will in California, the " +
    "120-day deadline after probate, and how Rothrock Legal handles it in San Jose.",
  summary:
    "A California will can be challenged for forgery, fraud, undue influence, lack of capacity, or " +
    "a defect in how it was signed. You can object before the will is admitted to probate, or " +
    "petition to revoke probate within 120 days after it is admitted (Probate Code § 8270). After " +
    "that, the door usually closes.",
  card: {
    headline: "We were cut out, and the will doesn’t say why.",
    answer:
      "A will can be challenged for forgery, fraud, undue influence, or lack of capacity – on " +
      "a clock.",
    icon: "file-x",
  },
  deadline: {
    headline: "Object before probate, or within 120 days after.",
    body:
      "If a petition to probate the will has been filed, you can object at the hearing. Once the " +
      "will is admitted, a petition to revoke probate must be filed within 120 days (Probate Code " +
      "§ 8270). Related claims, like elder abuse, run on their own clocks.",
  },
  statutes: [
    {
      cite: "Probate Code § 6100.5",
      plain: "The test for whether someone had the capacity to make a will.",
    },
    {
      cite: "Probate Code § 8270",
      plain:
        "120 days after a will is admitted to probate to petition to revoke it.",
    },
    {
      cite: "Probate Code § 21380",
      plain:
        "Gifts to the drafter or a care custodian are presumed to be the product of fraud or undue influence.",
    },
    {
      cite: "Welfare and Institutions Code § 15610.70",
      plain: "The definition of undue influence California courts apply.",
    },
  ],
  faq: [
    {
      question: "How long do I have to contest a will in California?",
      answer:
        "Before the will is admitted to probate, you can object at the hearing on the petition. " +
        "After admission, a petition to revoke probate must be filed within 120 days (Probate Code " +
        "section 8270). Deadlines depend on your facts; confirm yours with a lawyer.",
    },
    {
      question: "Can I contest a will if I was left out entirely?",
      answer:
        "Yes, if you would inherit under an earlier will or under California’s intestacy " +
        "rules if this will fails. Being left out is not by itself a ground; the question is whether " +
        "the will is valid.",
    },
    {
      question: "What makes a will invalid?",
      answer:
        "Lack of testamentary capacity, undue influence, fraud, forgery, duress, mistake, or a " +
        "signing that did not meet the formalities. A handwritten will has its own rules.",
    },
    {
      question: "The will was signed at the hospital. Does that matter?",
      answer:
        "It often does. Timing, who arranged the signing, who benefited, and the medical chart for " +
        "that day are the core of most capacity and undue influence cases.",
    },
  ],
  categories: ["Will Contests", "Deadlines", "Probate Process"],
  author: "arthur-rothrock",
  updatedAt: "2026-09-01",
};
