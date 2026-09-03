import { SchedulePage } from '@/components/schedule/SchedulePage';
import { pageMetadata } from '@/lib/seo/metadata';

/** Reached only from an emailed link (`?t=`); noindex, kept out of the sitemap, disallowed in robots.txt. */
export const metadata = pageMetadata({
  title: 'Book your consultation',
  description:
    'Choose a time to meet with Arthur Rothrock by video, from the link we emailed you.',
  path: '/schedule/',
  noindex: true,
});

export default function Page() {
  return <SchedulePage />;
}
