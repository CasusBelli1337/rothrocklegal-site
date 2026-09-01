import { RecognitionStrip } from '@/components/team/RecognitionStrip';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { firstName, recognizedMembers, teamHref } from '@/config/team';

const linkClass = 'text-maroon-700 underline underline-offset-3 hover:text-maroon-600';

/** Badges + exact award names, then the ABA office and the podcast, all from team config. */
export function RecognitionSection() {
  const members = recognizedMembers();
  if (members.length === 0) return null;
  return (
    <section className="bg-sand py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Credentials" title="Recognition, on the record." />
        </Reveal>
        <div className="mt-10 space-y-8">
          {members.map((member) => {
            const office = member.leadership[0];
            return (
              <Reveal key={member.slug}>
                <RecognitionStrip member={member} />
                <div className="mt-6 max-w-[64ch] space-y-3 text-body-lg text-ink-2">
                  {office && (
                    <p>
                      <a href={teamHref(member)} className={linkClass}>
                        {firstName(member)}
                      </a>{' '}
                      is {office.role} of the {office.organization}, presented by the ABA&rsquo;s
                      Science &amp; Technology Law Section and hosted at Santa Clara University
                      School of Law.
                    </p>
                  )}
                  {member.podcast && (
                    <p>
                      He hosts{' '}
                      <em>
                        {member.podcast.url ? (
                          <a
                            href={member.podcast.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            {member.podcast.name}
                          </a>
                        ) : (
                          member.podcast.name
                        )}
                      </em>
                      , {member.podcast.description}.
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
