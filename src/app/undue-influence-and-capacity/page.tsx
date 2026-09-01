import { PracticePage, practiceMetadata } from '@/components/practice/PracticePage';

const SLUG = 'undue-influence-and-capacity';

export const metadata = practiceMetadata(SLUG);

export default function Page() {
  return <PracticePage slug={SLUG} />;
}
