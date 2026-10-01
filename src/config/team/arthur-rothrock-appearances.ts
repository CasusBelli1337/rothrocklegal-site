/**
 * Curated speaking, press, and publication items for Arthur's bio page,
 * ARTHUR-DOSSIER.md §4, §6, §8, §9 (verified rows only), plus the talks his CV
 * of September 9, 2026 confirms (added 2026-10-01). Links only where a URL was
 * checked to resolve. Nothing about Legion v. United States (§14); the
 * cannabis-bar panel stays off a trust-and-estate client site (§6).
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
    date: 'June 24, 2026',
    sortDate: '2026-06-24',
    outlet: 'Lincoln Law School of San Jose, Technology in the Practice of Law MCLE',
    title: 'AI Tools and AI Governance for Lawyers',
    role: 'Presenter',
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
    kind: 'talk',
    date: 'May 15, 2026',
    sortDate: '2026-05-15',
    outlet: 'myLawCLE, “How Search, Knowledge Management, and Generative AI Interconnect”',
    title: 'From Retrieval to Intelligence: Operationalizing KM & GenAI in Legal Practice',
    role: 'Presenter',
  },
  {
    kind: 'article',
    date: 'May 2026',
    sortDate: '2026-05-01',
    outlet: 'Contra Costa Lawyer, The Artificial Intelligence Issue',
    title: 'AI in Your Practice: Competence, Confidentiality, Client Consent',
    role: 'Author',
    url: 'https://www.cccba.org/?pg=ContraCostaLawyerMagazine&pubAction=viewIssue&pubIssueID=70394&pubIssueItemID=466734',
  },
  {
    kind: 'talk',
    date: 'February 11, 2026',
    sortDate: '2026-02-11',
    outlet: 'ProVisors BALAW',
    title: 'Transforming Your Practice With AI',
    role: 'Presenter',
  },
  {
    kind: 'talk',
    date: 'January 24, 2026',
    sortDate: '2026-01-24',
    outlet: 'American Inns of Court, national on-demand MCLE',
    title: "The Lawyer's Survival Guide to the AI Revolution",
    role: 'Presenter',
    url: 'https://www.pathlms.com/innsofcourt/courses/123816',
  },
  {
    kind: 'talk',
    date: 'November 18, 2025',
    sortDate: '2025-11-18',
    outlet: 'Santa Clara University School of Law',
    title: 'Technology Licensing',
    role: 'Guest lecturer',
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
    kind: 'talk',
    date: 'September 17, 2025',
    sortDate: '2025-09-17',
    outlet: 'Edward J. McFetridge American Inn of Court',
    title: 'Artificial Intelligence and the Law',
    role: 'Presenter',
  },
  {
    kind: 'talk',
    date: 'September 4, 2025',
    sortDate: '2025-09-04',
    outlet: 'Jerry A. Kasner Estate Planning Symposium, Santa Clara Convention Center',
    title: 'Embracing Innovation and Maintaining Integrity in a Modern Legal Practice',
    role: 'Panelist',
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
    date: 'March 20, 2025',
    sortDate: '2025-03-20',
    outlet: 'Silicon Valley Bar Association, MCLE webinar',
    title: "The Lawyer's Survival Guide to the AI Revolution",
    role: 'Presenter',
  },
  {
    kind: 'talk',
    date: 'January 9, 2025',
    sortDate: '2025-01-09',
    outlet: 'Tri-Valley Estate Planning Council, CLE webinar',
    title: 'AI Is Transforming Law and Legal Practice: What Every Attorney Needs to Know',
    role: 'Co-presenter',
  },
  {
    kind: 'talk',
    date: 'November 6, 2024',
    sortDate: '2024-11-06',
    outlet: 'Berkeley Law, Berkeley Center for Law & Technology',
    title: 'The Future of Law: A.I. Insights for Legal Practice',
    role: 'Speaker',
  },
  {
    kind: 'talk',
    date: 'October 9, 2024',
    sortDate: '2024-10-09',
    outlet: 'Honorable William A. Ingram American Inn of Court, San Jose',
    title: 'How Will the Court System Detect Deepfakes at Hearings and Trials?',
    role: 'Presenter',
  },
];
