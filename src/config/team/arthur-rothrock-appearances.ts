/**
 * Curated speaking, press, and publication items for Arthur's bio page,
 * ARTHUR-DOSSIER.md §4, §6, §8, §9 (verified rows only). Links only where
 * the dossier has a URL. Nothing about Legion v. United States (§14).
 */

import type { TeamAppearance } from './member';

export const arthurAppearances: readonly TeamAppearance[] = [
  {
    kind: 'talk',
    date: 'October 12–13, 2026',
    sortDate: '2026-10-12',
    outlet:
      'ABA 8th Annual Artificial Intelligence and Robotics National Institute, Santa Clara University School of Law',
    title: 'Will moderate “Tools of the Trade: AI Automation of IP Applications and Enforcement”',
    role: 'Institute Vice Chair and moderator',
  },
  {
    kind: 'talk',
    date: 'June 4, 2026',
    sortDate: '2026-06-04',
    outlet: 'Santa Clara County Bar Association, San Jose',
    title: 'Wine & AI – Practical AI for Attorneys',
    role: 'Speaker',
  },
  {
    kind: 'article',
    date: 'May 2026',
    sortDate: '2026-05-01',
    outlet: 'Contra Costa Lawyer, The Artificial Intelligence Issue',
    title: 'AI in Your Practice: Competence, Confidentiality, Client Consent',
    role: 'Author',
    url: 'https://www.cccba.org/?pg=ContraCostaLawyerMagazine&pubAction=viewIssue&pubIssueID=70394',
  },
  {
    kind: 'talk',
    date: 'December 10, 2025',
    sortDate: '2025-12-10',
    outlet: 'Monterey County Bar Association',
    title:
      "The Lawyer's Survival Guide to the AI Revolution – Practical Applications and Potential Pitfalls",
    role: 'Speaker (MCLE)',
  },
  {
    kind: 'talk',
    date: 'October 13–14, 2025',
    sortDate: '2025-10-13',
    outlet:
      'ABA 7th Annual Artificial Intelligence and Robotics National Institute, Santa Clara University School of Law',
    title:
      'Moderated “AI Document Generation in Action” and led the keynote fireside chat on the frontier of AI',
    role: 'Moderator and keynote interviewer',
  },
  {
    kind: 'talk',
    date: 'September 2025',
    sortDate: '2025-09-12',
    outlet: 'CEB Learning',
    title: "Lawyer's Survival Guide to the AI Revolution",
    role: 'On-demand MCLE program',
    url: 'https://learning.ceb.com/course/lawyers-survival-guide-to-the-ai-revolution',
  },
  {
    kind: 'press',
    date: 'May 2, 2025',
    sortDate: '2025-05-02',
    outlet: 'Law360 Pulse',
    title: '“‘Birds of a Feather’: Why Attys Launch Legal Tech Startups”',
    role: 'Quoted',
    url: 'https://www.law360.com/articles/2323456/-birds-of-a-feather-why-attys-launch-legal-tech-startups',
  },
  {
    kind: 'talk',
    date: 'November 6, 2024',
    sortDate: '2024-11-06',
    outlet: 'Berkeley Law, Berkeley Center for Law & Technology',
    title: 'The Future of Law: A.I. Insights for Legal Practice',
    role: 'Speaker',
  },
];
