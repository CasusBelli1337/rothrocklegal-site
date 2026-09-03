import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { Instrument_Sans, Newsreader } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileConsultBar } from '@/components/layout/MobileConsultBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { palette, site } from '@/config/site';
import { articleLensWeights } from '@/lib/lens/article-weights';
import { lensBootScript } from '@/lib/lens/boot';
import { LensTracker } from '@/lib/lens/LensTracker';
import { siteGraph } from '@/lib/seo/jsonld';
import './globals.css';

// Weight axis only: the optical-size axis doubled each serif file (129 KB + 144 KB),
// which on a slow phone connection held back the hero image and the first text
// paint in the web font (mobile LCP, docs/MOBILE.md). The italic face is its own
// family and is not preloaded: quotes and the em-word fetch it when they render.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-newsreader',
});

const newsreaderItalic = Newsreader({
  subsets: ['latin'],
  style: ['italic'],
  display: 'swap',
  preload: false,
  variable: '--font-newsreader-italic',
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
  // The phone number is shown as text on purpose (Arthur does not field calls);
  // without this, iOS Safari turns it into a blue tel: link anyway.
  formatDetection: { telephone: false },
};

/** Colors the browser chrome maroon around the site on phones. */
export const viewport: Viewport = {
  themeColor: palette.maroon900,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The lens boot script stamps html[data-lens] before hydration (docs/LENS.md §3).
    <html
      lang="en"
      className={`${newsreader.variable} ${newsreaderItalic.variable} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: lensBootScript() }} />
      </head>
      {/* dvh, not vh: mobile browser toolbars shrink the visible viewport. */}
      <body className="min-h-dvh flex flex-col">
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
