import type { TeamMember } from '@/config/team';

/** Hand-set bio paragraphs in the article prose styles; the first paragraph reads as the lead. */
export function ProfileBio({ member }: { member: TeamMember }) {
  return (
    <div className="prose-article">
      {member.bio.map((paragraph, i) => (
        <p key={paragraph.slice(0, 40)} className={i === 0 ? 'text-lead text-ink' : undefined}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
