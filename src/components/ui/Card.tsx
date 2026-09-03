import Link from 'next/link';
import type { CSSProperties } from 'react';
import { LENS_EVENT_ATTR } from '@/lib/lens/types';

interface CardProps {
  children: React.ReactNode;
  /** Whole card becomes one link. */
  href?: string;
  /** Hover elevation + maroon border (problem cards, article cards). */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  /** Lens event recorded when the card is clicked (docs/LENS.md), e.g. 'card:for-trustees'. */
  lensEvent?: string;
}

export const cardClass = 'rounded-xl border border-line bg-white p-6';

const interactiveClass =
  'group transition-[box-shadow,border-color] duration-150 hover:border-line-strong hover:shadow-md ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500';

/** White card with a hairline; never a shadow at rest (DESIGN-BRIEF §4). */
export function Card({
  children,
  href,
  interactive,
  className = '',
  style,
  ariaLabel,
  lensEvent,
}: CardProps) {
  const cls = `${cardClass} ${interactive || href ? interactiveClass : ''} ${className}`;
  const lensAttr = { [LENS_EVENT_ATTR]: lensEvent };
  if (href) {
    return (
      <Link
        href={href}
        className={`block ${cls}`}
        style={style}
        aria-label={ariaLabel}
        {...lensAttr}
      >
        {children}
      </Link>
    );
  }
  return (
    <div className={cls} style={style} {...lensAttr}>
      {children}
    </div>
  );
}
