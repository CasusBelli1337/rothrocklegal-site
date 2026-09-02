'use client';

import Link from 'next/link';
import type { Lens } from '@/lib/lens/types';
import { useLens } from '@/lib/lens/useLens';

interface LensSwitchLinkProps {
  to: Lens;
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** The quiet escape hatch: a plain link that also sets the lens to the other side before it navigates. */
export function LensSwitchLink({ to, href, className, children }: LensSwitchLinkProps) {
  const { record } = useLens();
  return (
    <Link href={href} className={className} onClick={() => record(`switch:${to}`)}>
      {children}
    </Link>
  );
}
