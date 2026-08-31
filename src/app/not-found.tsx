import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-serif-accent text-3xl text-maroon-band">Page not found</h1>
      <p className="mt-4 text-navy">
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link href="/" className="btn-primary mt-8 inline-block">
        Back to Home
      </Link>
    </div>
  );
}
