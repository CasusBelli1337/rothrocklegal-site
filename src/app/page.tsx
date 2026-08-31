import type { Metadata } from 'next';
import { ContactSection } from '@/components/ContactSection';
import { Hero } from '@/components/home/Hero';
import { LegionBand } from '@/components/home/LegionBand';
import { Services } from '@/components/home/Services';
import { Testimonials } from '@/components/home/Testimonials';
import { Updates } from '@/components/home/Updates';
import { WhoWeAre } from '@/components/home/WhoWeAre';

export const metadata: Metadata = {
  title: { absolute: 'Home | Rothrock Legal' },
  description:
    'Tech-assisted legal services: better results, lower costs. Business litigation, trust & ' +
    'estate litigation, and elder abuse litigation in Silicon Valley, California.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhoWeAre />
      <Services />
      <LegionBand />
      <Testimonials />
      <Updates />
      <ContactSection />
    </>
  );
}
