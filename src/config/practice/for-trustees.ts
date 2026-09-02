import type { PracticeArea } from '../practice-areas';

export const forTrustees: PracticeArea = {
  slug: 'for-trustees',
  parent: 'trust-litigation',
  title: 'Representing trustees',
  headline: "You're the trustee, and now you're the one being accused.",
  seoTitle: 'Trustee Defense Attorney in San Jose',
  description:
    'A beneficiary wants an accounting, your removal, or your money. We defend family-member trustees in Santa Clara County. In good faith, the trust can pay.',
  summary:
    'A trustee who is served with a petition has to answer it, and a trustee who is asked for an ' +
    'accounting has to give one (Probate Code §§ 16060–16062). Neither means you did anything ' +
    'wrong. The court decides on the records, so the first job is getting the records and the ' +
    'accounting right. A trustee acting in good faith can hire a lawyer at the trust’s expense ' +
    '(Probate Code §§ 15684, 16247), with one catch explained below.',
  card: {
    headline: "I'm the trustee, and a beneficiary is coming after me.",
    answer:
      'Most family trustees never asked for the job. We defend accounting demands, removal ' +
      'petitions, and surcharge claims, and a trustee acting in good faith can hire a lawyer at ' +
      'the trust’s expense.',
    icon: 'shield',
  },
  deadline: {
    headline: 'The clocks run on you too.',
    body:
      'The notice you serve under Probate Code § 16061.7 starts the beneficiaries’ 120-day contest ' +
      'window (Probate Code § 16061.8), and only if it was served correctly. Once a petition is ' +
      'filed against you, the notice of hearing sets your date. Written objections are due before ' +
      'the hearing; if you do nothing, the court can grant what the petition asks.',
  },
  statutes: [
    {
      cite: 'Probate Code § 16000',
      plain: 'The starting duty: run the trust by its own terms.',
    },
    {
      cite: 'Probate Code §§ 16060–16062',
      plain: 'Keep beneficiaries informed, answer their requests, and account at least yearly.',
    },
    {
      cite: 'Probate Code § 16061.7',
      plain: 'The notice a trustee must serve within 60 days after the settlor dies.',
    },
    {
      cite: 'Probate Code § 15684',
      plain: 'The trust repays a trustee for expenses properly incurred in administering it.',
    },
    {
      cite: 'Probate Code § 16247',
      plain:
        'A trustee may hire lawyers, accountants, and appraisers to help administer the trust.',
    },
    {
      cite: 'Probate Code § 16440',
      plain:
        'What a trustee owes for a breach, and the court’s power to excuse one who acted reasonably and in good faith.',
    },
    {
      cite: 'Probate Code § 15642',
      plain:
        'The grounds for removal, and the cost order against a removal petition filed in bad faith.',
    },
  ],
  faq: [
    {
      question: 'I’m a family member, not a professional. Am I held to the same standard?',
      answer:
        'Yes. The Probate Code does not grade on a curve: a sibling trustee owes the same duties as ' +
        'a bank, meaning loyalty, impartiality, no self-dealing, prudent care, and a duty to account ' +
        '(Probate Code sections 16000 through 16064). The standard is a reasonable person acting in ' +
        'good faith, not perfection, and the court can excuse a trustee who acted reasonably and in ' +
        'good faith even when something went wrong (Probate Code section 16440).',
    },
    {
      question: 'Can the trust pay for my lawyer?',
      answer:
        'When you are defending the trust or your administration of it in good faith, the trust ' +
        'reimburses expenses properly incurred in administering it, and that includes counsel ' +
        '(Probate Code sections 15684 and 16247). The catch: if the court later finds you breached ' +
        'your duties, it can order those fees charged back to you personally. We tell you where ' +
        'that line runs before the first invoice goes to the trust.',
    },
    {
      question: 'Do I have to give my sibling an accounting?',
      answer:
        'If they are a beneficiary entitled to income or principal, almost always yes: at least once ' +
        'a year, and information on request within a reasonable time (Probate Code sections 16061 ' +
        'and 16062). Some trusts waive the annual accounting, and a beneficiary whose interest has ' +
        'not vested has narrower rights. Even then, refusing to answer is what turns a request into ' +
        'a petition.',
    },
    {
      question: 'They filed a petition to remove me. Will the court take me off the trust?',
      answer:
        'Only for cause: breach of trust, failing to act, excessive compensation, hostility between ' +
        'co-trustees that stalls the administration, or other good cause (Probate Code section ' +
        '15642). A beneficiary who disagrees with you is not cause. A trustee who kept records, ' +
        'answered questions, and followed the trust terms is in a far better position than one ' +
        'who did not.',
    },
    {
      question: 'What if I already made a mistake?',
      answer:
        'Tell your lawyer everything, early. Most trustee mistakes are fixable: a late accounting ' +
        'can be prepared, a commingled account can be unwound and documented, an uneven ' +
        'distribution can be trued up. The court reserves its harshest remedies for trustees who ' +
        'hide things, not for trustees who fix them.',
    },
  ],
  categories: ['For Trustees', 'Trustees & Fiduciaries'],
  author: 'arthur-rothrock',
  updatedAt: '2026-09-01',
};
