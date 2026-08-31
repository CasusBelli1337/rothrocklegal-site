import type { Metadata } from 'next';
import { EB_Garamond, Jost, Open_Sans, Raleway } from 'next/font/google';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { site } from '@/config/site';
import './globals.css';

const raleway = Raleway({ subsets: ['latin'], variable: '--font-raleway' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], variable: '--font-eb-garamond' });
const jost = Jost({ subsets: ['latin'], variable: '--font-jost' });

export const metadata: Metadata = {
  metadataBase: new URL(site.canonicalHost),
  title: {
    default: `Home | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  description:
    'Rothrock Legal — tech-assisted business, trust & estate, and elder abuse litigation in Silicon Valley, California.',
  openGraph: {
    siteName: site.name,
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = `${raleway.variable} ${openSans.variable} ${ebGaramond.variable} ${jost.variable}`;
  return (
    <html lang="en" className={fontVars}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
