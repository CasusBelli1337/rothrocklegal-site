import { findRanges, type MatchRange } from './searchUtils';

interface HighlightProps {
  text: string;
  /** Terms to find in `text`; ignored when `ranges` is given. */
  terms?: readonly string[];
  ranges?: readonly MatchRange[];
}

/** Wraps search matches in `<mark>` on a brass-100 field (LIBRARY-SPEC §5). */
export function Highlight({ text, terms, ranges }: HighlightProps) {
  const found = ranges ?? (terms ? findRanges(text, terms) : []);
  if (found.length === 0) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  found.forEach((range, i) => {
    if (cursor < range.start) parts.push(text.slice(cursor, range.start));
    parts.push(
      <mark key={i} className="rounded-sm bg-brass-100 px-0.5 text-ink">
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
