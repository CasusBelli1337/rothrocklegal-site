import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { DEADLINE_CLOCKS } from '@/config/deadline-clocks';
import { consultCta } from '@/config/site';
import { bindSectionSigns } from '@/lib/typography';

interface WizardCardProps {
  title?: string;
  lead?: string;
  /** 'lg' beside the featured article (lists the three clocks); 'md' in an article sidebar. */
  size?: 'lg' | 'md';
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/** The three clocks, one per row, so the large card fills its column with substance. */
function Clocks() {
  return (
    <ul className="mt-6 divide-y divide-white/15 border-y border-white/15">
      {DEADLINE_CLOCKS.map((item) => (
        <li
          key={item.clock}
          className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
        >
          <span className="shrink-0 font-serif text-h4 text-white sm:w-28">{item.clock}</span>
          <span className="text-small text-white/80">
            {item.what}
            <span className="mt-0.5 block text-meta text-white/60">
              {bindSectionSigns(item.statute)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Maroon promo card for the deadline wizard (LIBRARY-SPEC §2, §3.2). */
export function WizardCard({
  title = 'How long do I have?',
  lead = 'Trust contests can be barred 120 days after the trustee’s notice. Answer four questions and see which California deadlines may apply to you.',
  size = 'lg',
  headingLevel: Tag = 'h2',
  className = '',
}: WizardCardProps) {
  return (
    <div className={`band-maroon flex h-full flex-col p-6 lg:p-8 ${className}`}>
      <Eyebrow tone="light" rule>
        Deadlines
      </Eyebrow>
      <Tag className={`mt-3 font-serif text-white ${size === 'lg' ? 'text-h2' : 'text-h3'}`}>
        {title}
      </Tag>
      <p className="mt-3 text-body text-white/80">{lead}</p>
      {size === 'lg' && <Clocks />}
      <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap">
        <Button variant="inverse" tone="dark" href="/how-long-do-i-have/">
          Check my deadline
        </Button>
        <Button variant="secondary" tone="dark" href={consultCta.href}>
          {consultCta.label}
        </Button>
      </div>
    </div>
  );
}
