import { TeamCard } from '@/components/layout/TeamCard';
import { team } from '@/config/team';

interface TeamGridProps {
  /** 'h2' on /attorneys/ (the h1 is the page title); 'h3' inside a section. */
  headingLevel?: 'h2' | 'h3';
}

/** The four team cards, Arthur first: 2-up on mobile, 4-up from lg (HOMEPAGE-SPEC §4). */
export function TeamGrid({ headingLevel = 'h3' }: TeamGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:gap-x-8 lg:grid-cols-4">
      {team.map((member) => (
        <TeamCard key={member.slug} member={member} headingLevel={headingLevel} />
      ))}
    </div>
  );
}
