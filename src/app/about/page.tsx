import type { Metadata } from 'next';
import { AboutIntro, FounderBlock } from '@/components/about/AboutIntro';
import { ArthurCV } from '@/components/about/ArthurCV';
import { TryItNow, WhyChoose } from '@/components/about/WhyChoose';
import { PageTitleBand } from '@/components/PageTitleBand';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'Meet Arthur E. Rothrock — founder of Rothrock Legal and CEO & Co-Founder of Legion, an AI ' +
    'legal technology company. Experience, professional activities, and recognitions.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <>
      <PageTitleBand title="About Us" />
      <AboutIntro />
      <FounderBlock />
      <ArthurCV />
      <WhyChoose />
      <TryItNow />
    </>
  );
}
