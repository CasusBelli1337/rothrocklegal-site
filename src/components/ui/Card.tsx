import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  /** Whole card becomes one link. */
  href?: string;
  /** Hover elevation + maroon border (problem cards, article cards). */
  interactive?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const cardClass = "rounded-xl border border-line bg-white p-6";

const interactiveClass =
  "group transition-[box-shadow,border-color] duration-150 hover:border-maroon-200 hover:shadow-md " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500";

/** White card with a hairline; never a shadow at rest (DESIGN-BRIEF §4). */
export function Card({
  children,
  href,
  interactive,
  className = "",
  ariaLabel,
}: CardProps) {
  const cls = `${cardClass} ${interactive || href ? interactiveClass : ""} ${className}`;
  if (href) {
    return (
      <Link href={href} className={`block ${cls}`} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}
