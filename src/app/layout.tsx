import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Instrument_Sans, Newsreader } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileConsultBar } from '@/components/layout/MobileConsultBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { site } from '@/config/site';
import { articleLensWeights } from '@/lib/lens/article-weights';
import { lensBootScript } from '@/lib/lens/boot';
import { LensTracker } from '@/lib/lens/LensTracker';
import { siteGraph } from '@/lib/seo/jsonld';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-newsreader',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});

/**
 * Editor-preview tools (next.config.mjs sets the flag only under EDITOR_PREVIEW).
 * Decided at module scope so a production export carries no trace of them;
 * scripts/check-lens.mjs asserts that.
 */
const PreviewLensSwitch =
  process.env.NEXT_PUBLIC_PREVIEW_TOOLS === '1'
    ? dynamic(() => import('@/components/lens/PreviewLensSwitch').then((m) => m.PreviewLensSwitch))
    : null;

export const metadata: Metadata = {
  metadataBase: new URL(site.canonicalHost),
  title: {
    default: site.defaultTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The lens boot script stamps html[data-lens] before hydration (docs/LENS.md §3).
    <html
      lang="en"
      className={`${newsreader.variable} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: lensBootScript() }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <noscript>
          <style>{'[data-reveal],[data-reveal-stagger]>*{opacity:1;transform:none}'}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <MobileConsultBar />
        <LensTracker articleWeights={articleLensWeights()} />
        {PreviewLensSwitch && <PreviewLensSwitch />}
        <JsonLd data={siteGraph()} />
      </body>
    </html>
  );
}
