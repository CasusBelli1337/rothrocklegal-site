interface DecoRuleProps {
  /** 'brass' on light backgrounds; 'light' on a maroon band. */
  tone?: 'brass' | 'light';
  className?: string;
}

const tones = { brass: 'border-brass-400', light: 'border-white/40' };

/** A 4.5rem thick-over-thin rule, drawn under section headings (Arthur, 2026-09-03). */
export function DecoRule({ tone = 'brass', className = '' }: DecoRuleProps) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[5px] w-18 border-t-[3px] border-b ${tones[tone]} ${className}`}
    />
  );
}
