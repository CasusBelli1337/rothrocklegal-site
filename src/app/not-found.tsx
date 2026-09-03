import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { practiceHub, practiceHref } from '@/config/practice-areas';
import { secondaryCta } from '@/config/site';

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    'That page may have moved when the site was rebuilt. Try the practice areas, the deadline wizard, or send Rothrock Legal a note.',
  robots: { index: false, follow: true },
};

const links = [
  { label: practiceHub.title, href: practiceHref(practiceHub) },
  { label: 'How long do I have?', href: '/how-long-do-i-have/' },
  { label: 'The library', href: '/library/' },
  { label: 'Attorneys', href: '/attorneys/' },
];

export default function NotFound() {
  return (
    <Container className="max-w-[44rem] py-20 lg:py-28">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-3 font-serif text-h1 text-ink">We can&rsquo;t find that page.</h1>
      <p className="mt-5 text-lead text-ink-2">
        It may have moved when the site was rebuilt. Try one of these, or tell us what you were
        looking for and we&rsquo;ll point you to the right place.
      </p>
      <ul className="mt-8 grid sm:grid-cols-2 sm:gap-x-6 lg:gap-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="tap-row text-ui font-medium text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href="/">Back to the homepage</Button>
        <Button variant="secondary" href={secondaryCta.href}>
          {secondaryCta.label}
        </Button>
      </div>
    </Container>
  );
}
