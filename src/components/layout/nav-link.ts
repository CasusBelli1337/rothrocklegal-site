import type { NavItem } from '@/config/site';

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/') return pathname === '/';
  if (pathname.startsWith(item.href)) return true;
  return item.children?.some((child) => pathname.startsWith(child.href)) ?? false;
}

/**
 * The header row and the reading-options bar share this column. It is wider than
 * `Container` (75rem) because five nav items, Reading options, the logo, and the
 * consult button need about 1,300px at this type size; the page column stays 75rem.
 */
export const headerColumnClass = 'mx-auto w-full max-w-[85rem] px-5 md:px-8';

/** Shared by every desktop nav item: 15px medium type with a brass hairline drawn under it. */
const navItemBase =
  'relative inline-flex h-10 items-center gap-1 text-[15px] font-medium transition-colors duration-150 ' +
  'after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:bg-brass-400 ' +
  'after:transition-transform after:duration-150 hover:text-ink';

/** Desktop nav link: ink-2, hover ink + brass hairline, active maroon (DESIGN-BRIEF §5). */
export function navLinkClass(active: boolean): string {
  return `${navItemBase} after:scale-x-0 hover:after:scale-x-100 ${active ? 'text-maroon-700' : 'text-ink-2'}`;
}

/** Desktop nav button that opens a bar under the row: while pressed it holds ink text and the hairline. */
export function navButtonClass(pressed: boolean): string {
  return `${navItemBase} ${
    pressed ? 'text-ink after:scale-x-100' : 'text-ink-2 after:scale-x-0 hover:after:scale-x-100'
  }`;
}
