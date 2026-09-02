import { TeamCard } from '@/components/layout/TeamCard';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { team } from '@/config/team';

/** HOMEPAGE-SPEC §4: four team cards, Arthur first. */
export function AttorneysStrip() {
  if (team.length !== 4) throw new Error(`Expected 4 team members, found ${team.length}`);
  return (
    <section className="bg-white py-16 lg:py-24">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="The team"
            title="The lawyers who will actually work your case."
            lead="A small firm on purpose. You'll talk to the people doing the work."
          />
          <Button variant="secondary" href="/attorneys/" className="shrink-0">
            Meet the team
          </Button>
        </Reveal>
        <Reveal stagger className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
          {team.map((member) => (
            <TeamCard key={member.slug} member={member} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
