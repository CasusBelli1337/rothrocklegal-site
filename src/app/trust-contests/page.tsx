import { PracticePage, practiceMetadata } from '@/components/practice/PracticePage';

const SLUG = 'trust-contests';

export const metadata = practiceMetadata(SLUG);

export default function Page() {
  return <PracticePage slug={SLUG} />;
}
