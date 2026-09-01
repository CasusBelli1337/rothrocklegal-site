import { PracticePage, practiceMetadata } from '@/components/practice/PracticePage';

const SLUG = 'breach-of-fiduciary-duty';

export const metadata = practiceMetadata(SLUG);

export default function Page() {
  return <PracticePage slug={SLUG} />;
}
