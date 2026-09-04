import { Slot, renderVariants } from '@/components/lens/Slot';
import { framings, type TeamMember } from '@/config/team';

function Paragraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={paragraph.slice(0, 40)} className={i === 0 ? 'text-lead text-ink' : undefined}>
          {paragraph}
        </p>
      ))}
    </>
  );
}

/**
 * Hand-set bio paragraphs in the article prose styles; the first paragraph
 * reads as the lead. A bio with a framing per lens (docs/LENS.md) renders
 * every framing and the CSS shows the one for the visitor; a plain bio is one
 * element shared by all three. Each framing is its own `.prose-article` so the
 * first-paragraph lead style keeps working.
 */
export function ProfileBio({ member }: { member: TeamMember }) {
  return (
    <Slot
      as="div"
      name="bio"
      className="prose-article"
      variants={renderVariants(framings(member.bio), (paragraphs) => (
        <Paragraphs paragraphs={paragraphs} />
      ))}
    />
  );
}
