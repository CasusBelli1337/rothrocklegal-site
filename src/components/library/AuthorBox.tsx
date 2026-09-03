import Image from 'next/image';
import Link from 'next/link';
import { hasHeadshot } from '@/components/layout/TeamCard';
import { InitialAvatar } from '@/components/ui/InitialAvatar';
import { asset } from '@/config/site';
import { teamHref, type TeamMember } from '@/config/team';

/** Byline box under the article: headshot, title, bar line, two credentials, bio link. */
export function AuthorBox({ member }: { member: TeamMember }) {
  const credentials = member.credentials
    .slice(0, 2)
    .map((c) => (c.years ? `${c.name}, ${c.years}` : c.name));
  return (
    <aside
      aria-labelledby="author-heading"
      className="mt-14 rounded-xl border border-line bg-white p-6 sm:flex sm:gap-6"
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand">
        {hasHeadshot(member) ? (
          <Image
            src={asset(member.image.small)}
            alt={member.image.alt}
            width={400}
            height={400}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <InitialAvatar name={member.name} className="h-full w-full" />
        )}
      </div>
      <div className="mt-4 min-w-0 sm:mt-0">
        <p className="eyebrow">About the author</p>
        <h2 id="author-heading" className="mt-2 font-sans text-h4 text-ink">
          {member.name}
        </h2>
        <p className="mt-1 text-meta text-ink-3">
          {member.title}
          {member.barStatus && <> &middot; {member.barStatus}</>}
        </p>
        {credentials.length > 0 && (
          <p className="mt-3 text-small text-ink-2">{credentials.join(' · ')}</p>
        )}
        <p className="mt-3 text-small text-ink-2">{member.summary}</p>
        <Link
          href={teamHref(member)}
          className="tap-link mt-3 inline-block text-small font-medium text-maroon-700 transition-colors hover:text-maroon-600"
        >
          Read bio <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </aside>
  );
}
