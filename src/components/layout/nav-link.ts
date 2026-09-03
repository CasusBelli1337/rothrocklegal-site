import type { NavItem } from '@/config/site';

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/') return pathname === '/';
  if (pathname.startsWith(item.href)) return true;
  return item.children?.some((child) => pathname.startsWith(child.href)) ?? false;
}

/**
 * Where the desktop nav takes over from the compact row. At normal text the row
 * (logo, five items, the AA icon, the consult button) needs about 1,100px, so it
 * fits the 75rem column from xl. With a text-size choice active
 * (html[data-text-size], docs/ACCESSIBILITY.md) it needs up to about 1,370px, so
 * the switch moves to 2xl. Written out in full so Tailwind's scanner sees each class.
 */
export const desktopNavClass =
  'hidden items-center gap-4 xl:flex xl:[html[data-text-size]_&]:hidden 2xl:[html[data-text-size]_&]:flex';
export const compactControlsClass =
  'flex items-center gap-1 xl:hidden xl:[html[data-text-size]_&]:flex 2xl:[html[data-text-size]_&]:hidden';
/** The consult button: from lg it sits in the compact row (pushed right), from the nav breakpoint between the nav and the edge. */
export const consultSlotClass =
  'hidden items-center lg:ml-auto lg:flex xl:ml-0 xl:[html[data-text-size]_&]:ml-auto 2xl:[html[data-text-size]_&]:ml-0';
/** The mobile menu sheet lives as long as the compact row does. */
export const mobileMenuClass =
  'fixed inset-0 z-50 xl:hidden xl:[html[data-text-size]_&]:block 2xl:[html[data-text-size]_&]:hidden';

/** The brass hairline every desktop nav item draws under itself; each item sets its own inset. */
const navHairline =
  'after:absolute after:bottom-1 after:h-px after:origin-left after:bg-brass-400 ' +
  'after:transition-transform after:duration-150';

/** Shared by every desktop nav item: semibold UI type (it follows the text-size option) with the hairline. */
const navItemBase =
  'relative inline-flex h-10 items-center gap-1 text-ui font-semibold transition-colors duration-150 ' +
  `${navHairline} after:inset-x-0 hover:text-ink`;

/** Desktop nav link: ink-2, hover ink + brass hairline, active maroon (DESIGN-BRIEF §5). */
export function navLinkClass(active: boolean): string {
  return `${navItemBase} after:scale-x-0 hover:after:scale-x-100 ${active ? 'text-maroon-700' : 'text-ink-2'}`;
}

/**
 * A 44px icon button in the nav row that opens a bar under it (Reading options):
 * ink-2 at rest, ink on hover, and while pressed it holds ink and the hairline.
 */
export function navIconButtonClass(pressed: boolean): string {
  return `relative grid h-11 w-11 place-items-center transition-colors duration-150 ${navHairline} after:inset-x-2.5 hover:text-ink ${
    pressed ? 'text-ink after:scale-x-100' : 'text-ink-2 after:scale-x-0 hover:after:scale-x-100'
  }`;
}
