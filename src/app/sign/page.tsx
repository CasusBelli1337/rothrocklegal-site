import { SignPage } from '@/components/sign/SignPage';
import { pageMetadata } from '@/lib/seo/metadata';

/** Reached only from an emailed link (`?t=`); noindex, kept out of the sitemap, disallowed in robots.txt. */
export const metadata = pageMetadata({
  title: 'Sign your agreement',
  description:
    'Read and sign your engagement agreement with Rothrock Legal from the link we emailed you.',
  path: '/sign/',
  noindex: true,
});

export default function Page() {
  return <SignPage />;
}
