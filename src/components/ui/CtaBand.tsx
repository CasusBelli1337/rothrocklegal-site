import { consultCta, noteCta, site } from '@/config/site';
import { Button } from './Button';
import { Container } from './Container';

interface CtaBandProps {
  title?: React.ReactNode;
  lead?: React.ReactNode;
  primary?: { label: string; href: string };
  id?: string;
}

/** Maroon gradient band: white h2, one lead line, consult button + note button (DESIGN-BRIEF §6). */
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
    <section id={id} className="band-maroon py-16 lg:py-20">
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
