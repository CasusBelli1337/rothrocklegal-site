import Image from 'next/image';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { asset } from '@/config/site';
import type { TeamBadge, TeamMember } from '@/config/team';
import { recognitionTiles, type RecognitionTile } from './recognition-tiles';

const cellClass = 'flex h-full flex-col p-5 md:p-6';
const linkCellClass = `${cellClass} group focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-maroon-500`;

/** Art in a fixed 80px box, so every tile's text starts on the same line. */
function Art({ badge }: { badge: TeamBadge }) {
  return (
    <div className="flex h-20 items-center">
      <Image
        src={asset(badge.src)}
        alt={badge.alt}
        width={badge.width}
        height={badge.height}
        className="h-auto max-h-20 w-auto max-w-full"
      />
    </div>
  );
}

function TileBody({ tile }: { tile: RecognitionTile }) {
  return (
    <>
      <Art badge={tile.badge} />
      <Eyebrow className="mt-5">{tile.kind}</Eyebrow>
      <p className="mt-2 font-sans text-h4 text-ink transition-colors group-hover:text-maroon-700">
        {tile.name}
      </p>
      {tile.detail && <p className="mt-1 text-small text-ink-2">{tile.detail}</p>}
      {tile.meta && <p className="mt-auto pt-3 text-meta text-ink-3">{tile.meta}</p>}
      {tile.href && (
        <p className="mt-auto pt-3 text-small font-medium text-maroon-700 group-hover:underline">
          Listen <span aria-hidden="true">&rarr;</span>
        </p>
      )}
    </>
  );
}

/**
 * One hairline grid of tiles: badge art, the name exactly as conferred, the
 * detail line, years and issuer (DESIGN-BRIEF §6, dossier §11). Renders
 * nothing for a member with no badge art.
 */
export function RecognitionStrip({ member }: { member: TeamMember }) {
  const tiles = recognitionTiles(member);
  if (tiles.length === 0) return null;
  const superLawyers = member.credentials.some((c) => c.name.includes('Super Lawyers'));
  return (
    <div>
      <ul className="grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.key} className="border-r border-b border-line bg-white">
            {tile.href ? (
              <a
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkCellClass}
              >
                <TileBody tile={tile} />
              </a>
            ) : (
              <div className={cellClass}>
                <TileBody tile={tile} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {superLawyers && (
        <p className="mt-4 text-meta text-ink-3">
          Super Lawyers is a registered trademark of Thomson Reuters.
        </p>
      )}
    </div>
  );
}
