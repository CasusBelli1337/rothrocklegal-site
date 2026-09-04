import { legionLitigator } from '@/config/legion-litigator';
import { asset } from '@/config/site';

/** Legion's mark, the brand `Logo.svg` as shipped (viewBox 613 × 328). */
const LOGO = { src: '/images/partners/legion-logo.svg', width: 613, height: 328 };

const SIZE = 360;
const CENTER = SIZE / 2;
/** Ring radii, outside in: the maroon rule, the brass hairline, the text path, the inner hairline. */
const R = { outer: 172, brass: 164, text: 146, inner: 128 } as const;
const LOGO_WIDTH = 168;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * LOGO.height) / LOGO.width);

/** A full circle starting at the bottom and running clockwise, so text anchored at its midpoint is centred on 12 o'clock. */
function ringPath(r: number): string {
  return `M ${CENTER} ${CENTER + r} a ${r} ${r} 0 1 1 0 ${-2 * r} a ${r} ${r} 0 1 1 0 ${2 * r}`;
}

interface SealProps {
  className?: string;
}

/**
 * The Legion Litigator seal: a round badge in the site's palette with the
 * designation running around the ring, the Legion mark at the centre, the word
 * LITIGATOR in the serif under it, and the designation number and year. The
 * white face keeps it legible on sand and on white. Colors are theme tokens,
 * type is the site's own faces, so it is one component to lift when the seal
 * is packaged for other lawyers' sites.
 */
export function LegionLitigatorSeal({ className = '' }: SealProps) {
  const { ring, word, line, title } = legionLitigator.seal;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title} className={className}>
      <title>{title}</title>
      <defs>
        <path id="legion-seal-ring" d={ringPath(R.text)} />
      </defs>
      <circle
        cx={CENTER}
        cy={CENTER}
        r={R.outer}
        fill="var(--color-white)"
        stroke="var(--color-maroon-700)"
        strokeWidth={2.5}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={R.brass}
        fill="none"
        stroke="var(--color-brass-400)"
        strokeWidth={1}
      />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={R.inner}
        fill="none"
        stroke="var(--color-brass-400)"
        strokeWidth={1}
      />
      <text
        fill="var(--color-brass-600)"
        fontSize={13}
        fontWeight={600}
        letterSpacing={3.2}
        textAnchor="middle"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <textPath href="#legion-seal-ring" startOffset="50%">
          {ring}
        </textPath>
      </text>
      <image
        href={asset(LOGO.src)}
        x={CENTER - LOGO_WIDTH / 2}
        y={CENTER - LOGO_HEIGHT / 2 - 34}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
      />
      <text
        x={CENTER}
        y={CENTER + 78}
        textAnchor="middle"
        fill="var(--color-maroon-700)"
        fontSize={30}
        fontWeight={500}
        letterSpacing={5}
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {word}
      </text>
      <line
        x1={CENTER - 56}
        x2={CENTER + 56}
        y1={CENTER + 92}
        y2={CENTER + 92}
        stroke="var(--color-brass-400)"
        strokeWidth={1}
      />
      <text
        x={CENTER}
        y={CENTER + 112}
        textAnchor="middle"
        fill="var(--color-ink-3)"
        fontSize={11}
        fontWeight={600}
        letterSpacing={2}
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {line}
      </text>
    </svg>
  );
}
