import type { PracticeArea } from '../practice-areas';

export const estatePropertyDisputes: PracticeArea = {
  slug: 'estate-property-disputes',
  parent: 'trust-litigation',
  title: 'Property disputes (§ 850)',
  headline: 'Assets that were supposed to be in the trust are gone.',
  seoTitle: 'Probate Code 850 Petition Attorney in San Jose',
  description:
    'A house retitled, accounts drained, trust property gone. Probate Code 850 petitions to get it back, and section 859 double damages, in San Jose.',
  summary:
    'When property that belongs to a trust or estate has ended up in someone else’s name, a ' +
    'petition under Probate Code § 850 asks the probate court to decide who owns it and to order ' +
    'it returned. If the property was taken in bad faith, by undue influence, or through elder ' +
    'abuse, the court can award twice its value (Probate Code § 859).',
  card: {
    headline: 'Assets that were supposed to be in the trust are gone.',
    answer: 'A Probate Code § 850 petition can bring property back into the trust or estate.',
    icon: 'box',
  },
  deadline: {
    headline: 'No single clock, but related claims run fast.',
    body:
      'A section 850 petition does not carry its own fixed deadline, but claims against a person ' +
      'who has died must be brought within a year of death (Code of Civil Procedure §§ 366.2, ' +
      '366.3), and property can be sold or spent while you wait.',
  },
  statutes: [
    {
      cite: 'Probate Code § 850',
      plain:
        'The petition to decide who owns disputed property and to bring it into the trust or estate.',
    },
    {
      cite: 'Probate Code § 856',
      plain: 'The order directing the property to be conveyed or transferred.',
    },
    {
      cite: 'Probate Code § 859',
      plain:
        'Double the value of property taken in bad faith, by undue influence, or through financial elder abuse.',
    },
    {
      cite: 'Code of Civil Procedure § 366.2',
      plain: 'One year from death to sue on a claim against the person who died.',
    },
    {
      cite: 'Code of Civil Procedure § 366.3',
      plain:
        'One year from death for claims based on a promise about a will or trust distribution.',
    },
  ],
  faq: [
    {
      question: 'What is a Probate Code section 850 petition?',
      answer:
        'A request that the probate court decide who owns a piece of property and order it ' +
        'transferred to the right person, trust, or estate. It covers real estate, bank accounts, ' +
        'business interests, and personal property.',
    },
    {
      question: 'The house was put in my brother’s name before Mom died. Can we get it back?',
      answer:
        'Possibly. If the transfer was the product of undue influence, lack of capacity, or fraud, ' +
        'or was never valid, an 850 petition can undo it. The deed, the timing, and Mom’s ' +
        'condition at the time are where we start.',
    },
    {
      question: 'What are double damages under section 859?',
      answer:
        'If the court finds property was taken in bad faith, through undue influence, or by ' +
        'financial elder abuse, it can order the taker to pay twice the value of the property, and ' +
        'in some cases attorney’s fees.',
    },
    {
      question: 'Can an 850 petition be combined with other claims?',
      answer:
        'Yes. It is often filed with a trust contest, an elder abuse claim, or a breach of ' +
        'fiduciary duty petition so the court resolves everything in one proceeding.',
    },
  ],
  categories: ['Trustees & Fiduciaries', 'Elder Financial Abuse', 'Probate Process'],
  author: 'arthur-rothrock',
  updatedAt: '2026-09-01',
};
