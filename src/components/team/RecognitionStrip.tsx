import Image from 'next/image';
import { asset } from '@/config/site';
import type { TeamMember } from '@/config/team';

/** Official badge art beside each award named exactly as conferred (DESIGN-BRIEF §6, dossier §11). */
export function RecognitionStrip({ member }: { member: TeamMember }) {
  if (member.credentials.length === 0) return null;
  const badges = member.credentials.flatMap((c) => c.badges ?? []);
  const superLawyers = member.credentials.some((c) => c.name.includes('Super Lawyers'));
  return (
    <div className="rounded-xl border border-line bg-white p-6 md:p-8">
      <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
        {badges.length > 0 && (
          <ul className="flex flex-wrap items-center gap-5" aria-label="Award badges">
            {badges.map((badge) => (
              <li key={badge.src}>
                <Image
                  src={asset(badge.src)}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  className="h-28 w-auto md:h-32"
                />
              </li>
            ))}
          </ul>
        )}
        <ul className="space-y-5">
          {member.credentials.map((c) => (
            <li key={c.name}>
              <p className="font-sans text-h4 text-ink">{c.name}</p>
              {c.detail && <p className="mt-0.5 text-small text-ink-2">{c.detail}</p>}
              <p className="mt-1 text-meta text-ink-3">
                {c.years && <>{c.years} &middot; </>}
                {c.issuer}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {superLawyers && (
        <p className="mt-6 text-meta text-ink-3">
          Super Lawyers is a registered trademark of Thomson Reuters.
        </p>
      )}
    </div>
  );
}
