import Link from 'next/link';

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
 * path and on the real domain after cutover.
 */
export function RedirectStub({ relativeTarget, href, label }: RedirectStubProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <meta httpEquiv="refresh" content={`0;url=${relativeTarget}`} />
      <h1 className="font-serif-accent text-2xl text-black">This page has moved</h1>
      <p className="mt-4">
        You are being taken to{' '}
        <Link href={href} className="text-maroon-band underline">
          {label}
        </Link>
        . If nothing happens, use that link.
      </p>
    </div>
  );
}
