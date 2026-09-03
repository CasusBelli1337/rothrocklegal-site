import Link from 'next/link';
import { RecognitionStrip } from '@/components/team/RecognitionStrip';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { recognizedMembers, teamHref } from '@/config/team';

/** One tile grid per recognized member: awards, offices, memberships, the podcast, all from team config. */
export function RecognitionSection() {
  const members = recognizedMembers();
  if (members.length === 0) return null;
  return (
    <section className="bg-sand py-16 lg:py-20">
      <Container>
        <SectionHeading eyebrow="Credentials" title="Recognition, on the record." />
        <div className="mt-10 space-y-12">
          {members.map((member) => (
            <div key={member.slug}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-sans text-h4 text-ink">
                  <Link
                    href={teamHref(member)}
                    className="tap-link underline-offset-3 hover:text-maroon-700 hover:underline"
                  >
                    {member.name}
                  </Link>
                </h3>
                <p className="text-small text-ink-3">{member.title}</p>
              </div>
              <div className="mt-4">
                <RecognitionStrip member={member} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
