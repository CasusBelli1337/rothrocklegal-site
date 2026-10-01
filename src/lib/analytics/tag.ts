import { RESUME_PARAM } from '@/lib/intake/resume';
import { TOKEN_PARAM } from '@/lib/public/api';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

/** Query parameters that carry a one-use emailed link; Google never sees them. */
export const PRIVATE_PARAMS = [TOKEN_PARAM, RESUME_PARAM] as const;

/**
 * The GA4 loader, run once after the page has loaded (components/seo/Analytics).
 * It stays off the emailed-link pages (/sign/, /schedule/) entirely, and when a
 * landing URL carries a one-use token (?resume=) it reports the address without it.
 * gtag.js is injected here rather than by next/script, so the browser does not
 * preload 170 KB of analytics ahead of the page's own CSS, fonts, and hero image.
 */
export function gaLoaderScript(measurementId: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const skip = JSON.stringify(PUBLIC_LINK_PATHS.map((p) => `${base}${p}`));
  const params = JSON.stringify(PRIVATE_PARAMS);
  const id = JSON.stringify(measurementId);
  return `(function(){
var p=location.pathname,skip=${skip};
for(var i=0;i<skip.length;i++){if(p.indexOf(skip[i])===0)return;}
var u=new URL(location.href);${params}.forEach(function(k){u.searchParams.delete(k);});
window.dataLayer=window.dataLayer||[];
window.gtag=function(){window.dataLayer.push(arguments);};
gtag('js',new Date());
gtag('config',${id},u.href===location.href?{}:{page_location:u.href});
var s=document.createElement('script');s.async=true;
s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(${id});
document.head.appendChild(s);
})();`;
}
