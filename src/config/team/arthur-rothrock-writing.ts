/**
 * Arthur's writing section on his bio page (components/team/ArticlesByMember).
 *
 * Library order (SEO audit Arthur approved on 2026-10-01): the questions a family asks first –
 * the deadline, contesting a trust, contesting a will, getting an accounting,
 * undue influence, elder abuse, then defending a trustee. His other library
 * articles follow, newest first.
 *
 * Elsewhere: his practice guides on legion.law, each carrying his byline on
 * the live page and listed as his on his CV of September 9, 2026; checked to
 * resolve (200, no redirect) on 2026-10-01. The two product comparisons on
 * legion.law are left out (the firm site never sells Legion), as are the
 * July 2026 pieces his CV does not list.
 */

import type { TeamWriting } from './member';

export const arthurWriting: TeamWriting = {
  featuredArticles: [
    'how-long-do-i-have-to-contest-a-trust-or-will-in-california',
    'how-to-contest-a-trust-in-california',
    'how-to-contest-a-will-in-california',
    'trustee-wont-give-accounting-or-copy-of-trust-california',
    'undue-influence-california-what-it-is-and-how-to-prove-it',
    'financial-elder-abuse-of-a-parent-california',
    'youre-the-trustee-and-a-beneficiary-is-threatening-to-sue',
  ],
  shown: 10,
  elsewhere: [
    {
      title:
        'How Small Firms Can Adopt AI Safely: A Practical Guide to Policy, Ethics, and Client Disclosure',
      url: 'https://legion.law/library/how-small-firms-can-adopt-ai-safely',
      outlet: 'legion.law',
      published: '2026-06-26',
    },
    {
      title: 'Motion to Compel Deadlines in California: The 45-Day Rule and Every Date After It',
      url: 'https://legion.law/library/motion-to-compel-deadlines-in-california-the-45-day-rule-and-every-date-after-it',
      outlet: 'legion.law',
      published: '2026-06-24',
    },
    {
      title: 'How to Do Anything With AI: The DRAFT Method',
      url: 'https://legion.law/library/how-to-do-anything-with-ai-the-draft-method',
      outlet: 'legion.law',
      published: '2026-06-11',
    },
    {
      title: 'A Practical Guide on How to Obtain Discovery Sanctions in California',
      url: 'https://legion.law/library/a-practical-guide-on-how-to-obtain-discovery-sanctions-in-california',
      outlet: 'legion.law',
      published: '2026-04-14',
    },
    {
      title: 'California Discovery Objections: A Comprehensive Guide & Cheat Sheet',
      url: 'https://legion.law/library/california-discovery-objections-a-comprehensive-guide--cheat-sheet',
      outlet: 'legion.law',
      published: '2026-03-02',
    },
    {
      title:
        'Motion to Compel Requests for Admission in California: Jurisdictional Deadlines, Waiver, and Strategy (CCP §§ 2033.280, 2033.290)',
      url: 'https://legion.law/library/motion-to-compel-requests-for-admission-in-california-deadlines-requirements-and-strategy-ccp--2033280-2033290',
      outlet: 'legion.law',
      published: '2026-02-11',
    },
  ],
};
