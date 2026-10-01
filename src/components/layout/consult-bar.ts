import { consultCta } from '@/config/site';
import { PUBLIC_LINK_PATHS } from '@/lib/public/paths';

/** Pages that carry their own primary action (or a signature block); the bar would only cover their form. */
const HIDDEN_ON = ['/contact/', consultCta.href, ...PUBLIC_LINK_PATHS].map((href) =>
  href.replace(/\/$/, ''),
);

/**
 * True where the sticky mobile consult bar renders (below `lg`). The privacy-choices
 * bar reads it to stack above the consult bar instead of covering it.
 */
export function showsMobileConsultBar(pathname: string): boolean {
  return !HIDDEN_ON.some((prefix) => pathname.startsWith(prefix));
}
