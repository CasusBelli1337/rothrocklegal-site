import { PracticePage, practiceMetadata } from '@/components/practice/PracticePage';

const SLUG = 'business-disputes';

export const metadata = practiceMetadata(SLUG);

export default function Page() {
  return <PracticePage slug={SLUG} />;
}
