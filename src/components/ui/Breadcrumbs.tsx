import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbList } from '@/lib/seo/jsonld';
import type { Crumb } from '@/types/content';

interface BreadcrumbsProps {
  /** Full trail starting with Home; the last crumb is the current page (no href). */
  trail: readonly Crumb[];
  tone?: 'dark' | 'light';
  className?: string;
  /** Off for draft pages, which emit no JSON-LD (SEO-SPEC §3d). */
  jsonLd?: boolean;
}

/** Meta-size trail with "/" separators, paired with BreadcrumbList JSON-LD. */
export function Breadcrumbs({
  trail,
  tone = 'dark',
  className = '',
  jsonLd = true,
}: BreadcrumbsProps) {
  const muted = tone === 'light' ? 'text-white/70' : 'text-ink-3';
  const current = tone === 'light' ? 'text-white' : 'text-ink';
  const hover = tone === 'light' ? 'hover:text-white' : 'hover:text-maroon-700';
  return (
    <nav aria-label="Breadcrumb" className={`text-meta ${muted} ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {last || !crumb.href ? (
                <span
                  className={`${last ? current : ''} truncate max-w-[16rem] sm:max-w-none`}
                  aria-current={last ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className={`${hover} transition-colors`}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {jsonLd && <JsonLd data={breadcrumbList(trail)} />}
    </nav>
  );
}
