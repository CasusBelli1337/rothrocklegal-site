import { practiceHref, practicePages, practiceHub } from '@/config/practice-areas';
import { site } from '@/config/site';
import { team, teamHref } from '@/config/team';
import { getLibraryItems } from '@/lib/library/preview';

export const dynamic = 'force-static';

const url = (path: string) => `${site.canonicalHost}${path}`;

/** public /llms.txt generated from config at build (SEO-SPEC §7). */
function build(): string {
  const articles = getLibraryItems().filter((item) => !item.draft);
  const lines = [
    `# ${site.name}`,
    `> Trust and estate litigation firm in San Jose, California, serving Santa Clara County and the`,
    `> San Francisco Bay Area. Trust contests, will contests, undue influence and capacity, trustee`,
    `> breach of fiduciary duty, trust accountings, Probate Code § 850 petitions, financial elder`,
    `> abuse. Phone ${site.phone}.`,
    '',
    '## Practice areas',
    `- [${practiceHub.title}](${url(practiceHref(practiceHub))}): overview and common situations`,
    ...practicePages.map((a) => `- [${a.title}](${url(practiceHref(a))}): ${a.headline}`),
    '',
    '## Deadlines',
    `- [How long do I have?](${url('/how-long-do-i-have/')}): plain-English California deadline wizard`,
    '',
    '## Attorneys',
    ...team.map((m) => `- [${m.name}](${url(teamHref(m))}): ${m.title}`),
    '',
    '## Library',
    ...articles.map((a) => `- [${a.title}](${url(`/library/${a.slug}/`)}): ${a.excerpt}`),
    '',
    '## Optional',
    `- [About](${url('/about/')}), [FAQ](${url('/faq/')}), [Where we practice](${url('/service-areas/')}),`,
    `  [Contact](${url('/contact/')}), [Privacy](${url('/privacy-policy/')}), [Disclaimer](${url('/disclaimer/')})`,
    '',
  ];
  console.log(`llms.txt: ${articles.length} articles listed`);
  return lines.join('\n');
}

export function GET(): Response {
  return new Response(build(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
