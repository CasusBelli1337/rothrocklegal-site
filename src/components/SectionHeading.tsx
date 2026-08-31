interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** 'light' renders the title white for maroon bands. */
  tone?: 'dark' | 'light';
  className?: string;
}

/** Gold letter-spaced eyebrow over a serif section title. */
export function SectionHeading({ eyebrow, title, tone = 'dark', className }: SectionHeadingProps) {
  const titleColor = tone === 'light' ? 'text-white' : 'text-black';
  return (
    <div className={`text-center ${className ?? ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`font-serif-accent mt-2 text-2xl font-semibold md:text-3xl ${titleColor}`}>
        {title}
      </h2>
    </div>
  );
}
