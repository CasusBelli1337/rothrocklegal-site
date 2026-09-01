import type { NavItem } from "@/config/site";

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  if (pathname.startsWith(item.href)) return true;
  return (
    item.children?.some((child) => pathname.startsWith(child.href)) ?? false
  );
}

/** Desktop nav link: ink-2, hover ink + brass hairline, active maroon (DESIGN-BRIEF §5). */
export function navLinkClass(active: boolean): string {
  return (
    "relative inline-flex h-10 items-center gap-1 text-[15px] font-medium transition-colors duration-150 " +
    "after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brass-400 " +
    "after:transition-transform after:duration-150 hover:text-ink hover:after:scale-x-100 " +
    (active ? "text-maroon-700" : "text-ink-2")
  );
}
