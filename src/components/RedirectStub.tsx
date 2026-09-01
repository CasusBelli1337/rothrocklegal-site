import Link from 'next/link';
import { Container } from '@/components/ui/Container';

interface RedirectStubProps {
  /** Relative URL from the stub's exported directory to the new page. */
  relativeTarget: string;
  /** App-router href of the new page (for the visible link). */
  href: string;
  /** Human label of the destination page. */
  label: string;
}

/**
 * Meta-refresh stub kept at a retired URL so live links never 404.
 * The refresh URL is relative, so it works both at the github.io project
 * path and on the real domain.
 */
export function RedirectStub({ relativeTarget, href, label }: RedirectStubProps) {
  return (
    <Container className="max-w-[40rem] py-24 text-center">
      <meta httpEquiv="refresh" content={`0;url=${relativeTarget}`} />
      <p className="eyebrow">Moved</p>
      <h1 className="mt-3 font-serif text-h2 text-ink">This page has moved</h1>
      <p className="mt-4 text-body text-ink-2">
        You are being taken to{' '}
        <Link href={href} className="font-medium text-maroon-700 underline underline-offset-3">
          {label}
        </Link>
        . If nothing happens, use that link.
      </p>
    </Container>
  );
}
