import Link from 'next/link';
import { Fragment } from 'react';
import { Slot } from '@/components/lens/Slot';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { lensCopy } from '@/config/lens-copy';
import { getTeamMember, teamHref, type TeamMember } from '@/config/team';

/**
 * Who does what (Arthur, 2026-09-01 and 2026-09-03). Every line restates the
 * About page's "Who we are" paragraph or a bio; names come from the team
 * config so a renamed lawyer flows through.
 */
const roles: { members: TeamMember[]; body: React.ReactNode }[] = [
  {
    members: [getTeamMember('arthur-rothrock')],
    body: 'Sets the strategy and keeps the big picture on every case.',
  },
  {
    members: [getTeamMember('jonathan-joannides')],
    body: (
      <>
        A former Marine Corps infantry captain who practiced at Wilson Sonsini and Fenwick &amp;
        West. Takes the depositions and argues the hearings.
      </>
    ),
  },
  {
    members: [getTeamMember('gerry-lin'), getTeamMember('max-discher')],
    body: 'The associates. The records, the discovery, the drafting, at lower rates.',
  },
];

/** The Legion credential framed as speed (HOMEPAGE-SPEC §5). The lead keeps its slot name: check-lens.mjs counts it. */
const reasons: { lead: React.ReactNode; body: React.ReactNode }[] = [
  {
    lead: 'Every page gets read.',
    body: <Slot name="why-faster-lead" variants={lensCopy.whyFasterLead} />,
  },
  {
    lead: <>Drafting doesn&rsquo;t sit in a queue.</>,
    body: 'The pleadings, discovery, and motions that used to take days of associate time take hours.',
  },
  {
    lead: 'Your hours go where they matter.',
    body: 'Strategy, evidence, and the courtroom, not typing. Lawyers still make every judgment call.',
  },
];

const nameLink =
  'tap-link font-semibold text-ink underline decoration-line-strong underline-offset-3 ' +
  'transition-colors hover:text-maroon-700 hover:decoration-maroon-600';

/** "Gerry Lin and Max Discher", each name a link to its profile. */
function Names({ members }: { members: TeamMember[] }) {
  return (
    <>
      {members.map((member, i) => (
        <Fragment key={member.slug}>
          {i > 0 && ' and '}
          <Link href={teamHref(member)} className={nameLink}>
            {member.name}
          </Link>
        </Fragment>
      ))}
    </>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-sans text-h4 text-ink">{children}</h3>;
}

export function HowWeRunYourCase() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How we run your case"
            title="Senior judgment where it counts. Associate rates for the heavy lifting."
          />
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-6">
            <ColumnHeading>Who does what</ColumnHeading>
            <ul className="mt-3 divide-y divide-line">
              {roles.map((role) => (
                <li key={role.members.map((m) => m.slug).join('+')} className="py-4">
                  <p className="text-body">
                    <Names members={role.members} />
                  </p>
                  <p className="mt-1 text-body text-ink-2">{role.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="lg:col-span-6">
            <ColumnHeading>Why it costs less and moves faster</ColumnHeading>
            <ul className="mt-3 divide-y divide-line">
              {reasons.map((reason, i) => (
                <li key={i} className="py-4">
                  <p className="text-body font-semibold text-ink">{reason.lead}</p>
                  <p className="mt-1 text-body text-ink-2">{reason.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small text-ink-3">
              We tell you what it would take and what it would cost before any work starts.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
