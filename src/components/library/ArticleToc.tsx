'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import type { TocEntry } from '@/lib/library/articles';

/** The last heading whose top has crossed 40% of the viewport (LIBRARY-SPEC §6.2). */
function useActiveHeading(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (ids.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current ?? ids[0]);
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [ids]);
  return active;
}

function TocList({ entries, active }: { entries: readonly TocEntry[]; active: string | null }) {
  return (
    <ol className="space-y-1">
      {entries.map((entry) => {
        const on = entry.id === active;
        const tone = on
          ? 'border-maroon-700 font-medium text-maroon-700'
          : 'border-line text-ink-2 hover:border-maroon-200 hover:text-maroon-700';
        return (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={on ? 'location' : undefined}
              className={`block border-l-2 py-1.5 pl-4 text-small transition-colors duration-150 ${tone}`}
            >
              {entry.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

interface ArticleTocProps {
  /** `##` headings only. */
  entries: readonly TocEntry[];
  /** 'sidebar' is sticky at lg+; 'mobile' is a collapsed <details> above the body. */
  variant: 'sidebar' | 'mobile';
}

export function ArticleToc({ entries, variant }: ArticleTocProps) {
  const ids = useMemo(() => entries.map((e) => e.id), [entries]);
  const active = useActiveHeading(ids);
  if (variant === 'sidebar') {
    return (
      <nav aria-label="On this page" className="hidden lg:block">
        <p className="eyebrow">On this page</p>
        <div className="mt-4">
          <TocList entries={entries} active={active} />
        </div>
      </nav>
    );
  }
  return (
    <details className="group rounded-xl border border-line bg-white lg:hidden">
      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-sans text-h4 text-ink">
        On this page
        <ChevronDownIcon className="h-5 w-5 text-brass-500 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <nav aria-label="On this page" className="border-t border-line px-5 py-4">
        <TocList entries={entries} active={active} />
      </nav>
    </details>
  );
}
