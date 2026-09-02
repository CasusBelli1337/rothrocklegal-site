import type { PracticeArea } from '../practice-areas';

export const complexEstates: PracticeArea = {
  slug: 'complex-estates',
  parent: 'trust-litigation',
  title: 'Complex and high-value estates',
  headline:
    'Multiple properties, an LLC, a family business, five siblings, and a trust that says one thing while the deeds say another.',
  seoTitle: 'Complex & High-Value Estate Litigation Attorney in San Jose',
  description:
    'Multi-property estates, LLCs and family businesses held in trust, millions at issue. Complex trust and estate litigation in San Jose and on the Peninsula.',
  summary:
    'A complex estate case is one where the assets, the entities, or the family make the usual ' +
    'playbook fail: several properties, a business or LLC held in trust, siblings on both sides, ' +
    'and a trust that does not match the deeds. The same Probate Code applies (§§ 850, 17200). ' +
    'The case is won on records, valuation, and control of the assets while it runs.',
  card: {
    headline: 'Multiple properties, an LLC, a family business?',
    answer:
      'Bigger estates get the same clocks and a harder case. We run them with records at scale, ' +
      'forensic accountants, and control of the assets while the fight goes on.',
    icon: 'layers',
  },
  deadline: {
    headline: 'Bigger estates get the same clocks.',
    body:
      'A trust contest still has to be filed within 120 days of the trustee’s notice (Probate Code ' +
      '§§ 16061.7, 16061.8), no matter how many properties are in the trust. The practical clock ' +
      'is faster: a rental portfolio can be refinanced and an LLC interest sold while everyone ' +
      'argues about who is in charge.',
  },
  statutes: [
    {
      cite: 'Probate Code § 850',
      plain:
        'The petition that decides who owns property claimed by a trust or estate, including real property and entity interests.',
    },
    {
      cite: 'Probate Code § 859',
      plain:
        'Double the value, and possibly fees, when property was taken in bad faith, by undue influence, or through elder abuse.',
    },
    {
      cite: 'Probate Code § 17200',
      plain:
        'The petition that brings trust disputes before the probate court: instructions, accountings, and who controls what.',
    },
    {
      cite: 'Probate Code § 15642',
      plain:
        'Removal or suspension of a trustee, including the court’s power to hand the assets to a temporary trustee while the case runs.',
    },
    {
      cite: 'Probate Code § 16247',
      plain:
        'A trustee’s power to hire accountants, appraisers, and lawyers, which is how a complex trust gets valued and accounted for.',
    },
    {
      cite: 'Probate Code § 16420',
      plain: 'The remedies for breach, from surcharge to setting a transaction aside.',
    },
  ],
  faq: [
    {
      question: 'What makes a trust or estate case complex?',
      answer:
        'Usually the assets, not the law. Several properties in more than one county, a business or ' +
        'LLC held in trust, retirement and brokerage accounts with their own beneficiary ' +
        'designations, a blended family, and an estate large enough that every side can afford to ' +
        'fight. Add a trust that was amended more than once and you have a complex case.',
    },
    {
      question: 'How do you handle a family business held in trust?',
      answer:
        'First, who controls it today: who is the manager or officer, who holds the voting ' +
        'interest, and whether the trustee is on both sides of any transaction. Then we ask the ' +
        'court for the orders that keep the business running while the dispute is resolved, up to ' +
        'suspending the trustee’s powers and appointing a neutral (Probate Code section 15642). ' +
        'Valuation comes after control.',
    },
    {
      question: 'Can the court split up real estate the family cannot agree on?',
      answer:
        'Yes. Once property has been distributed to co-owners who cannot agree, a partition action ' +
        'forces a sale or a physical division. Before distribution, the probate court can instruct ' +
        'the trustee on whether to sell, hold, or distribute in kind (Probate Code section 17200). ' +
        'Which path is better depends on the tax basis, the tenants, and who wants to keep what.',
    },
    {
      question: 'What does a case like this cost?',
      answer:
        'The cost tracks the number of assets and experts, not the size of the estate. Forensic ' +
        'accounting, appraisals, and business valuation are the big line items. The records ' +
        'review, which used to be the biggest, is where the AI platform we run on saves the most. ' +
        'We give you a budget after the first look at the documents and update it when the facts ' +
        'change.',
    },
    {
      question: 'Do you work with our estate planner or CPA?',
      answer:
        'Yes, and we would rather. The planner knows why the trust was written the way it was, and ' +
        'the CPA knows where the money went. We are litigation counsel: we do not redo their work, ' +
        'we build the case on it, and we send the client back to them when the fight is over.',
    },
  ],
  categories: ['Complex Estates', 'Trustees & Fiduciaries', 'Trust Contests'],
  author: 'arthur-rothrock',
  updatedAt: '2026-09-01',
};
