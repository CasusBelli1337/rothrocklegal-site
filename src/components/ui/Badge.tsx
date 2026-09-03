import Image from 'next/image';
import { asset } from '@/config/site';

export interface BadgeImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** A square cover (album art): a thin ring so a dark cover reads on the maroon band. */
  square?: boolean;
}

interface BadgeProps {
  children: React.ReactNode;
  /** 'brass' on light backgrounds; 'dark' = hairline-only chip on maroon. */
  tone?: 'brass' | 'dark';
  /** Optional badge art, rendered 16px tall inside the chip. */
  image?: BadgeImage;
  /** Allow the label to wrap (long award names outside a scroll row). */
  wrap?: boolean;
  /** Makes the whole chip an external link that opens in a new tab. */
  href?: string;
  className?: string;
}

const tones = {
  brass: 'bg-brass-100 text-maroon-950',
  dark: 'border border-white/35 bg-transparent text-white',
};

const linkTones = {
  brass:
    'hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-600',
  dark: 'hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70',
};

/** Award / trust chip. Text is the award name exactly as conferred (DESIGN-BRIEF §6). */
export function Badge({ children, tone = 'brass', image, wrap, href, className = '' }: BadgeProps) {
  const flow = wrap ? 'leading-snug' : 'leading-none whitespace-nowrap';
  const chip = `inline-flex shrink-0 items-center gap-2 px-3 py-1.5 text-[0.8125rem] font-semibold ${flow} ${tones[tone]} ${className}`;
  const content = (
    <>
      {image && (
        <Image
          src={asset(image.src)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={`h-4 w-auto ${image.square ? 'ring-1 ring-white/40' : ''}`}
        />
      )}
      {children}
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${chip} ${linkTones[tone]}`}
      >
        {content}
      </a>
    );
  }
  return <span className={chip}>{content}</span>;
}
