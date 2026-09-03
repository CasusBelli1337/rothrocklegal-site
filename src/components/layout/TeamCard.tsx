import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { asset } from '@/config/site';
import { teamHref, type TeamMember } from '@/config/team';

/** Build-time check so a missing headshot renders the initials panel, never a broken image. */
export function hasHeadshot(member: TeamMember): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', member.image.large));
}

interface TeamCardProps {
  member: TeamMember;
  headingLevel?: 'h2' | 'h3';
}

/** 4:5 photo, name, title, one-line focus, "Read bio" (DESIGN-BRIEF §6). */
export function TeamCard({ member, headingLevel: Tag = 'h3' }: TeamCardProps) {
  return (
    <Link
      href={teamHref(member)}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-maroon-500 rounded-xl"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-sand">
        {hasHeadshot(member) ? (
          // Both headshot files in one srcset: a phone's 2-up grid takes the 400px one, desktop the 800px one.
          <picture>
            <img
              src={asset(member.image.large)}
              srcSet={`${asset(member.image.small)} 400w, ${asset(member.image.large)} 800w`}
              sizes="(max-width: 768px) 50vw, 300px"
              alt={member.image.alt}
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </picture>
        ) : (
          <InitialAvatar name={member.name} className="h-full w-full" />
        )}
      </div>
      <Tag className="mt-4 font-sans text-h4 text-ink transition-colors group-hover:text-maroon-700">
        {member.name}
      </Tag>
      <p className="mt-1 text-meta text-ink-3">{member.title}</p>
      <p className="mt-2 text-small text-ink-2">{member.focus}</p>
      <p className="mt-1.5 text-small text-ink-3">{member.proofLine}</p>
      <p className="mt-3 text-small font-medium text-maroon-700">
        Read bio <span aria-hidden="true">&rarr;</span>
      </p>
    </Link>
  );
}
