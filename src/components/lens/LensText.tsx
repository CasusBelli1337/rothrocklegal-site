import Link from 'next/link';
import { Fragment } from 'react';
import { bindSectionSigns } from '@/lib/typography';

const TOKEN = /(\[[^\]]+\]\([^)\s]+\)|\*[^*]+\*)/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

interface LensTextProps {
  text: string;
  linkClassName?: string;
}

/** Lens copy string → JSX: `[label](/href/)` is a Link, `*word*` the italic em-word. */
export function LensText({ text, linkClassName }: LensTextProps) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        const link = LINK.exec(part);
        if (link) {
          return (
            <Link key={i} href={link[2]} className={linkClassName}>
              {link[1]}
            </Link>
          );
        }
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={i} className="em-word">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <Fragment key={i}>{bindSectionSigns(part)}</Fragment>;
      })}
    </>
  );
}
