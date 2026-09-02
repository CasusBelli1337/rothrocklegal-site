import { PracticePage, practiceMetadata } from '@/components/practice/PracticePage';

const SLUG = 'for-trustees';

export const metadata = practiceMetadata(SLUG);

export default function Page() {
  return <PracticePage slug={SLUG} />;
}
