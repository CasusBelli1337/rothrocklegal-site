import { consultCta, noteCta, site } from '@/config/site';
import { Button } from './Button';
import { Container } from './Container';

interface CtaBandProps {
  title?: React.ReactNode;
  lead?: React.ReactNode;
  primary?: { label: string; href: string };
  id?: string;
}

/**
 * The footer's top row: white h2, one lead line, consult button + note button
 * (DESIGN-BRIEF §6). Flat maroon-950 like the Footer, so the two read as one
 * block split by a single hairline (Arthur, 2026-09-03); the heroes keep band-maroon.
 */
export function CtaBand({
  title = 'Start with a consult request.',
  lead = (
    <>
      Tell us what happened, in writing or by voice, and upload what you have. {site.replyPromise}
    </>
  ),
  primary = consultCta,
  id,
}: CtaBandProps) {
  return (
    <section id={id} className="border-b border-white/15 bg-maroon-950 py-14 text-white lg:py-16">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[40rem]">
          <h2 className="font-serif text-h2 text-white">{title}</h2>
          <p className="mt-4 text-lead text-white/80">{lead}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="inverse" tone="dark" href={primary.href}>
            {primary.label}
          </Button>
          <Button variant="secondary" tone="dark" href={noteCta.href}>
            {noteCta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
