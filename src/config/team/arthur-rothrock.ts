/**
 * Arthur E. Rothrock – every fact here traces to ARTHUR-DOSSIER.md
 * (2026-09-01). Items the dossier marks NEEDS ARTHUR are left out entirely.
 * Arthur is "a litigator", never "a trial lawyer" (Arthur, 2026-09-04), and
 * the opening paragraph and hero line carry a framing per lens: neutral for
 * everyone, then the beneficiary's and the trustee's side of the table.
 */

import { headshot, type TeamMember } from './member';
import { arthurAppearances } from './arthur-rothrock-appearances';

const PRACTICE =
  'trust and will contests, undue influence and capacity fights, breach of fiduciary duty by ' +
  'trustees and executors, Probate Code section 850 property disputes, and financial elder abuse';

const OPENING = {
  neutral:
    'Arthur Rothrock is a litigator. He founded Rothrock Legal in San Jose to handle the ' +
    `disputes that follow a death in the family: ${PRACTICE}. He represents beneficiaries who ` +
    'were cut out and trustees who are being accused, so he knows what the other side of the ' +
    'table is thinking.',
  beneficiary:
    'Arthur Rothrock is a litigator. He founded Rothrock Legal in San Jose to represent the ' +
    'people who get hurt when a trust or estate goes wrong – the daughter cut out by a ' +
    "late-life “amendment,” the brother whose co-trustee sibling won't show the books. His " +
    `cases are ${PRACTICE}. He also defends trustees, so he knows how the other side thinks.`,
  trustee:
    'Arthur Rothrock is a litigator. He founded Rothrock Legal in San Jose to handle the ' +
    'disputes that follow a death in the family, and a good share of that work is defending ' +
    'trustees and executors: the sister who took the job because nobody else would and is now ' +
    'facing an accounting demand, a removal petition, or a surcharge claim. He also represents ' +
    `beneficiaries, so he knows what is coming before it arrives. His cases are ${PRACTICE}.`,
};

const PREPARES =
  'He prepares every case as if it will be tried, because the cases that settle well are the ' +
  'ones the other side believes you will try.';

const LEGION =
  "Here's the thing about litigation bills: most of the money goes to drafting. Pleadings, " +
  'discovery, motions, the same fifty-page documents rebuilt by hand. Arthur co-founded ' +
  'Legion, an AI litigation platform used by California litigators, to do that drafting in ' +
  'minutes instead of days, and he runs his own cases on it. The hours a family pays for go ' +
  'to strategy, evidence, and the courtroom, not to typing. Rothrock Legal carries the Legion ' +
  'AI Litigator seal: a commitment that AI is used responsibly at every level of a client’s ' +
  'case, with a lawyer in charge of every decision and the savings passed on.';

const AI_VOICE =
  'That work made him a regular voice on how lawyers should use AI. He is Vice Chair of the ' +
  "American Bar Association's Artificial Intelligence and Robotics National Institute, hosts " +
  "The Litigator's Path, a podcast about running a litigation practice, and has spoken on AI " +
  'for lawyers at Berkeley Law, CEB, and the Santa Clara County, Silicon Valley, and Monterey ' +
  'County bar associations. His article on competence, confidentiality, and client consent ' +
  'when lawyers use AI ran in the May 2026 Contra Costa Lawyer.';

const AWARDS =
  'Super Lawyers® has named him to its Northern California Rising Stars list every year ' +
  'since 2020, and Best Lawyers® has listed him in Ones to Watch in America for Commercial ' +
  'Litigation and Litigation – Trusts and Estates every edition since 2024.';

const EDUCATION =
  'Arthur earned his J.D. from Santa Clara University School of Law, where he was a senior ' +
  'editor on two of its journals, and his B.A. from Indiana University of Pennsylvania. He is ' +
  'a member of the State Bar of California, the Honorable William A. Ingram American Inn of ' +
  'Court, and the Santa Clara County Bar Association. Before founding Rothrock Legal he ' +
  'litigated at Hopkins & Carley in San Jose.';

const OUTSIDE =
  'Outside the office he is an advanced open water scuba diver, a second-degree black belt ' +
  'in Eagle Claw kung fu, and a traveler who has made it to Mongolia, Morocco, and most ' +
  'points between. He also 3D prints things nobody asked for.';

const REST = [PREPARES, LEGION, AI_VOICE, AWARDS, EDUCATION, OUTSIDE] as const;

export const arthurRothrock: TeamMember = {
  slug: 'arthur-rothrock',
  name: 'Arthur E. Rothrock',
  title: 'Founder',
  barStatus: 'Licensed in California, State Bar #312704',
  barNumber: '312704',
  focus: 'Trust and estate litigation for beneficiaries and trustees',
  summary:
    'Founder of Rothrock Legal, a trust and estate litigator in San Jose. Co-founder and CEO ' +
    "of Legion, an AI litigation platform, and Vice Chair of the American Bar Association's " +
    'Artificial Intelligence and Robotics National Institute.',
  heroLine: {
    neutral: 'The San Jose litigator for the family disputes that follow a death.',
    beneficiary: 'The San Jose litigator families call when a trust goes wrong.',
    trustee: 'The San Jose litigator trustees call when a beneficiary comes after them.',
  },
  bio: {
    neutral: [OPENING.neutral, ...REST],
    beneficiary: [OPENING.beneficiary, ...REST],
    trustee: [OPENING.trustee, ...REST],
  },
  image: headshot('arthur-rothrock', 'Arthur E. Rothrock, founder of Rothrock Legal'),
  email: 'arothrock@rothrocklegal.com',
  credentials: [
    {
      name: 'Super Lawyers® Rising Stars',
      issuer: 'Super Lawyers (Thomson Reuters)',
      detail: 'Northern California',
      years: '2020–2026',
      badges: [
        {
          src: '/images/badges/super-lawyers-rising-stars-2026.webp',
          alt: 'Super Lawyers Rising Stars 2026 badge for Arthur E. Rothrock',
          width: 192,
          height: 200,
        },
      ],
    },
    {
      name: 'Best Lawyers: Ones to Watch® in America',
      issuer: 'Best Lawyers',
      detail: 'Commercial Litigation; Litigation – Trusts and Estates',
      years: '2024–2027 editions',
      badges: [
        {
          src: '/images/badges/best-lawyers-ones-to-watch-2027-trusts-estates.webp',
          alt: 'Best Lawyers Ones to Watch 2027 badge, Litigation – Trusts and Estates, Arthur E. Rothrock',
          width: 171,
          height: 200,
          detail: 'Litigation – Trusts and Estates',
        },
        {
          src: '/images/badges/best-lawyers-ones-to-watch-2027-commercial.webp',
          alt: 'Best Lawyers Ones to Watch 2027 badge, Commercial Litigation, Arthur E. Rothrock',
          width: 171,
          height: 200,
          detail: 'Commercial Litigation',
        },
      ],
    },
  ],
  leadership: [
    {
      role: 'Vice Chair',
      organization:
        'American Bar Association Artificial Intelligence and Robotics National Institute',
      years: '2026–present',
      badge: {
        src: '/images/badges/aba.webp',
        alt: 'American Bar Association logo',
        width: 200,
        height: 82,
      },
    },
    {
      role: 'Planning Committee Member',
      organization:
        'American Bar Association Artificial Intelligence and Robotics National Institute',
      years: '2024–2026',
    },
  ],
  education: [
    {
      school: 'Santa Clara University School of Law',
      degree: 'J.D.',
      notes: [
        'Santa Clara Law Review, Senior Research Editor',
        'Santa Clara High Tech Law Journal, Senior Comments Editor',
        'High Tech Law Certificate, Corporate Specialization, with Honors',
      ],
    },
    { school: 'Indiana University of Pennsylvania', degree: 'B.A.' },
  ],
  memberships: [
    'Honorable William A. Ingram American Inn of Court',
    'Santa Clara County Bar Association',
  ],
  membershipBadges: {
    'Honorable William A. Ingram American Inn of Court': {
      src: '/images/badges/american-inns-of-court.webp',
      alt: 'American Inns of Court emblem',
      width: 200,
      height: 200,
    },
  },
  podcast: {
    name: "The Litigator's Path",
    role: 'Host',
    description: 'a podcast about building and running a litigation practice',
    url: 'https://legion.law/podcasts',
    badge: {
      src: '/images/badges/litigators-path.webp',
      alt: "The Litigator's Path podcast cover",
      width: 200,
      height: 200,
    },
  },
  appearances: arthurAppearances,
  sameAs: [
    'https://apps.calbar.ca.gov/attorney/Licensee/Detail/312704',
    'https://www.linkedin.com/in/rothrocka/',
    'https://profiles.superlawyers.com/california/san-jose/lawyer/arthur-e-rothrock/91f0080b-4f03-435c-bd78-14522f3be1fd.html',
    'https://www.bestlawyers.com/lawyers/arthur-rothrock/351520',
    'https://legion.law/about/company',
  ],
  practices: [
    'trust-contests',
    'will-contests',
    'undue-influence-and-capacity',
    'breach-of-fiduciary-duty',
    'trust-accounting-disputes',
    'estate-property-disputes',
    'financial-elder-abuse',
    'for-trustees',
    'complex-estates',
    'business-disputes',
  ],
  updatedAt: '2026-09-04',
};
