import type { RefObject } from 'react';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import '@/components/wizard/wizard.css';
import './public-flow.css';

interface PublicShellProps {
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  children: React.ReactNode;
}

/**
 * The frame both emailed-link pages share: a calm white header with the one
 * h1, then the sand column where the work happens. The h1 is in the static
 * HTML in every state, so the SEO gates hold and nothing shifts on load.
 */
export function PublicShell({ eyebrow, title, lead, headingRef, children }: PublicShellProps) {
  return (
    <>
      <section className="border-b border-line bg-white">
        <Container className="py-10 lg:py-14">
          <div className="max-w-[52rem]">
            <Eyebrow rule>{eyebrow}</Eyebrow>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 font-serif text-h1 text-ink outline-none"
            >
              {title}
            </h1>
            {lead && <div className="mt-5 max-w-[60ch] space-y-3 text-lead text-ink-2">{lead}</div>}
          </div>
        </Container>
      </section>
      <section className="grid-hairline bg-sand py-10 lg:py-16">
        <Container className="public-flow wizard max-w-[56rem]">{children}</Container>
      </section>
    </>
  );
}
