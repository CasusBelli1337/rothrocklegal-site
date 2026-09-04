import { legionLitigator } from '@/config/legion-litigator';
import { asset } from '@/config/site';

/** Legion's mark, the brand `Logo.svg` as shipped (viewBox 613 × 328). */
const LOGO = { src: '/images/partners/legion-logo.svg', width: 613, height: 328 };

const SIZE = 360;
const C = SIZE / 2;
/**
 * Radii, outside in: the maroon rule, the brass hairline, the top arc's
 * baseline (glyphs grow outward), the bottom arc's baseline (glyphs grow
 * inward, so it sits further out and the two bands of letters line up), the
 * separators, and the inner hairline.
 */
const R = { outer: 172, brass: 164, top: 146, bottom: 158, dots: 152, inner: 128 } as const;
const LOGO_WIDTH = 156;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * LOGO.height) / LOGO.width);

/** A full circle from the bottom, clockwise: text anchored at its midpoint is centred on twelve o'clock and reads upright. */
function topArc(r: number): string {
  return `M ${C} ${C + r} a ${r} ${r} 0 1 1 0 ${-2 * r} a ${r} ${r} 0 1 1 0 ${2 * r}`;
}

/** Nine o'clock to three o'clock the long way round the bottom: text anchored at its midpoint is centred on six o'clock and reads upright. */
function bottomArc(r: number): string {
  return `M ${C - r} ${C} a ${r} ${r} 0 0 0 ${2 * r} 0`;
}

/** A small brass diamond, the seal's separator at nine and three o'clock. */
function Diamond({ x }: { x: number }) {
  return (
    <path
      d={`M ${x - 4} ${C} L ${x} ${C - 4} L ${x + 4} ${C} L ${x} ${C + 4} Z`}
      fill="var(--color-brass-400)"
    />
  );
}

const SANS = { fontFamily: 'var(--font-sans)' } as const;
const SERIF = { fontFamily: 'var(--font-serif)' } as const;

interface SealProps {
  className?: string;
}

/**
 * The Legion AI Litigator seal: a round badge in the site's palette. The name
 * runs along the top arc, three keystone words along the bottom, both upright,
 * with a brass diamond at each side; the Legion mark sits at the centre over
 * "AI LITIGATOR" in the serif and the year. The white face keeps it legible on
 * sand and on white. Colors are theme tokens and type is the site's own faces,
 * so it is one component to lift when the seal is packaged for other lawyers.
 */
export function LegionLitigatorSeal({ className = '' }: SealProps) {
  const { top, bottom, word, line, title } = legionLitigator.seal;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={title} className={className}>
      <title>{title}</title>
      <defs>
        <path id="legion-seal-top" d={topArc(R.top)} />
        <path id="legion-seal-bottom" d={bottomArc(R.bottom)} />
      </defs>
      <circle
        cx={C}
        cy={C}
        r={R.outer}
        fill="var(--color-white)"
        stroke="var(--color-maroon-700)"
        strokeWidth={2.5}
      />
      <circle
        cx={C}
        cy={C}
        r={R.brass}
        fill="none"
        stroke="var(--color-brass-400)"
        strokeWidth={1}
      />
      <circle
        cx={C}
        cy={C}
        r={R.inner}
        fill="none"
        stroke="var(--color-brass-400)"
        strokeWidth={1}
      />
      <text
        fill="var(--color-brass-600)"
        fontSize={18}
        fontWeight={600}
        letterSpacing={4.5}
        textAnchor="middle"
        style={SANS}
      >
        <textPath href="#legion-seal-top" startOffset="50%">
          {top}
        </textPath>
      </text>
      <text
        fill="var(--color-brass-600)"
        fontSize={14}
        fontWeight={600}
        letterSpacing={3}
        textAnchor="middle"
        style={SANS}
      >
        <textPath href="#legion-seal-bottom" startOffset="50%">
          {bottom}
        </textPath>
      </text>
      <Diamond x={C - R.dots} />
      <Diamond x={C + R.dots} />
      <image
        href={asset(LOGO.src)}
        x={C - LOGO_WIDTH / 2}
        y={C - LOGO_HEIGHT / 2 - 30}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
      />
      <text
        x={C}
        y={C + 62}
        textAnchor="middle"
        fill="var(--color-maroon-700)"
        fontSize={22}
        fontWeight={500}
        letterSpacing={3.5}
        style={SERIF}
      >
        {word}
      </text>
      <line
        x1={C - 46}
        x2={C + 46}
        y1={C + 76}
        y2={C + 76}
        stroke="var(--color-brass-400)"
        strokeWidth={1}
      />
      <text
        x={C}
        y={C + 95}
        textAnchor="middle"
        fill="var(--color-ink-3)"
        fontSize={11}
        fontWeight={600}
        letterSpacing={2.5}
        style={SANS}
      >
        {line}
      </text>
    </svg>
  );
}
