import Link from 'next/link';
import { ArrowRightIcon, MailIcon } from '@/components/icons';
import { getPracticeArea, practiceHref } from '@/config/practice-areas';
import { consultCta, site } from '@/config/site';
import type { TeamMember } from '@/config/team';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-5">
      <h2 className="font-sans text-h4 text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EducationAndAdmissions({ member }: { member: TeamMember }) {
  if (member.education.length === 0 && !member.barStatus) return null;
  return (
    <Block title="Education and admissions">
      <ul className="space-y-3 text-small text-ink-2">
        {member.education.map((e) => (
          <li key={`${e.school}-${e.degree}`}>
            <span className="font-medium text-ink">{e.degree}</span>, {e.school}
            {e.year && `, ${e.year}`}
            {e.notes && (
              <ul className="mt-1 space-y-0.5 text-meta text-ink-3">
                {e.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {member.barStatus && <li>{member.barStatus}</li>}
      </ul>
    </Block>
  );
}

function MembershipsAndLeadership({ member }: { member: TeamMember }) {
  if (member.leadership.length === 0 && member.memberships.length === 0) return null;
  return (
    <Block title="Memberships and leadership">
      <ul className="space-y-2.5 text-small text-ink-2">
        {member.leadership.map((r) => (
          <li key={`${r.role}-${r.organization}`}>
            <span className="font-medium text-ink">{r.role}</span>, {r.organization}
            {r.years && <span className="text-ink-3"> ({r.years})</span>}
          </li>
        ))}
        {member.memberships.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </Block>
  );
}

const chipClass =
  'inline-flex min-h-11 items-center rounded-full border border-line bg-white px-4 text-small text-ink ' +
  'transition-colors hover:border-line-strong hover:text-maroon-700';

function PracticeChips({ member }: { member: TeamMember }) {
  return (
    <Block title="Practice areas">
      <ul className="flex flex-wrap gap-2">
        {member.practices.map((slug) => {
          const area = getPracticeArea(slug);
          return (
            <li key={slug}>
              <Link href={practiceHref(area)} className={chipClass}>
                {area.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </Block>
  );
}

function Contact({ member }: { member: TeamMember }) {
  const rowClass =
    'tap-row gap-2 text-small text-ink underline-offset-3 hover:text-maroon-700 hover:underline';
  return (
    <Block title="Get in touch">
      <ul className="lg:space-y-2">
        <li>
          <Link href={consultCta.href} className={rowClass}>
            <ArrowRightIcon className="h-4 w-4 text-brass-500" />
            {consultCta.label}
          </Link>
        </li>
        {member.email && (
          <li>
            <a href={`mailto:${member.email}`} className={rowClass}>
              <MailIcon className="h-4 w-4 text-brass-500" />
              {member.email}
            </a>
          </li>
        )}
      </ul>
      <p className="mt-3 text-meta text-ink-3">{site.consultLine}</p>
      <p className="mt-1 text-meta text-ink-3">{site.office.appointments}</p>
    </Block>
  );
}

/** Structured facts beside the bio: education, memberships, practice chips, contact. */
export function ProfileSidebar({
  member,
  className = '',
}: {
  member: TeamMember;
  className?: string;
}) {
  return (
    <aside className={`space-y-8 ${className}`} aria-label={`${member.name} at a glance`}>
      <EducationAndAdmissions member={member} />
      <MembershipsAndLeadership member={member} />
      <PracticeChips member={member} />
      <Contact member={member} />
    </aside>
  );
}
