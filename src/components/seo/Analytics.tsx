import Script from 'next/script';
import { site } from '@/config/site';

/**
 * The Google Analytics 4 tag, the one third-party script on the site (privacy
 * policy, "Technical information"). Off when site.analyticsId is blank and in
 * the editor preview, so Arthur's editing never counts as a visit. Enhanced
 * measurement on the stream reports the App Router's client-side navigations.
 */
export function Analytics() {
  const id = site.analyticsId;
  if (!id || process.env.NEXT_PUBLIC_PREVIEW_TOOLS === '1') return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});`}
      </Script>
    </>
  );
}
