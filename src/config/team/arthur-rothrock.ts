/**
 * Arthur E. Rothrock – every fact here traces to ARTHUR-DOSSIER.md
 * (2026-09-01). Items the dossier marks NEEDS ARTHUR are left out entirely.
 */

import { headshot, type TeamMember } from './member';
import { arthurAppearances } from './arthur-rothrock-appearances';

export const arthurRothrock: TeamMember = {
  slug: 'arthur-rothrock',
  name: 'Arthur E. Rothrock',
  title: 'Founder and Trial Attorney',
  barStatus: 'Licensed in California, State Bar #312704 (2016)',
  barNumber: '312704',
  focus: 'Trust contests, undue influence, elder financial abuse',
  // Restates the Legion paragraph of the bio; no year counts anywhere on the site (Arthur, 2026-09-03).
  proofLine: 'Co-founder and CEO of Legion, an AI litigation platform',
  summary:
    'Trial lawyer and founder of Rothrock Legal in San Jose. Co-founder and CEO of Legion, an AI ' +
    "litigation platform, and Vice Chair of the American Bar Association's Artificial " +
    'Intelligence and Robotics National Institute.',
  heroLine: 'The San Jose trial lawyer families call when a trust goes wrong.',
  bio: [
    'Arthur Rothrock is a trial lawyer. He founded Rothrock Legal in San Jose to represent the ' +
      'people who get hurt when a trust or estate goes wrong – the daughter cut out by a ' +
      "late-life “amendment,” the brother whose co-trustee sibling won't show the books. " +
      'His cases are trust and will contests, undue influence and capacity fights, breach of ' +
      'fiduciary duty by trustees and executors, Probate Code section 850 property disputes, and ' +
      "financial elder abuse, mostly in the Santa Clara County Superior Court's Probate Division " +
      'and the San Mateo, Alameda, and San Francisco courts.',
    'He prepares every case as if it will be tried, because the cases that settle well are the ' +
      'ones the other side believes you will try.',
    "Here's the thing about litigation bills: most of the money goes to drafting. Pleadings, " +
      'discovery, motions, the same fifty-page documents rebuilt by hand. Arthur co-founded ' +
      'Legion, an AI litigation platform used by California litigators, to do that drafting in ' +
      'minutes instead of days, and he runs his own cases on it. So this firm can prepare a ' +
      'trust contest faster and for less than a firm that bills a junior associate to type, and ' +
      'the hours you pay for go to strategy, evidence, and the courtroom.',
    'That work made him a regular voice on how lawyers should use AI. He is Vice Chair of the ' +
      "American Bar Association's Artificial Intelligence and Robotics National Institute, hosts " +
      "The Litigator's Path, a podcast about running a litigation practice, and has spoken on AI " +
      'for lawyers at Berkeley Law, CEB, and the Santa Clara County, Silicon Valley, and Monterey ' +
      'County bar associations. His article on competence, confidentiality, and client consent ' +
      'when lawyers use AI ran in the May 2026 Contra Costa Lawyer.',
    'Super Lawyers® has named him to its Northern California Rising Stars list every year ' +
      'since 2020, and Best Lawyers® has listed him in Ones to Watch in America for ' +
      'Commercial Litigation and Litigation – Trusts and Estates every edition since 2024.',
    'Arthur earned his J.D. from Santa Clara University School of Law in 2016 and his B.A. from ' +
      'Indiana University of Pennsylvania. He has been a member of the State Bar of California ' +
      'since 2016 and belongs to the Honorable William A. Ingram American Inn of Court and the ' +
      'Santa Clara County Bar Association. Before founding Rothrock Legal he litigated at ' +
      'Hopkins & Carley in San Jose.',
    'Outside the office he is an advanced open water scuba diver, a second-degree black belt ' +
      'in Eagle Claw kung fu, and a traveler who has made it to Mongolia, Morocco, and most ' +
      'points between. He also 3D prints things nobody asked for.',
  ],
  image: headshot(
    'arthur-rothrock',
    'Arthur E. Rothrock, founder and trial attorney at Rothrock Legal',
  ),
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
        },
        {
          src: '/images/badges/best-lawyers-ones-to-watch-2027-commercial.webp',
          alt: 'Best Lawyers Ones to Watch 2027 badge, Commercial Litigation, Arthur E. Rothrock',
          width: 171,
          height: 200,
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
      year: '2016',
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
  podcast: {
    name: "The Litigator's Path",
    role: 'Host',
    description: 'a podcast about building and running a litigation practice',
    url: 'https://legion.law/podcasts',
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
  updatedAt: '2026-09-01',
};
