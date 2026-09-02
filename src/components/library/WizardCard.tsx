import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { consultCta } from '@/config/site';

interface WizardCardProps {
  title?: string;
  lead?: string;
  /** 'lg' beside the featured article; 'md' in an article sidebar. */
  size?: 'lg' | 'md';
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/** Maroon promo card for the deadline wizard (LIBRARY-SPEC §2, §3.2). */
export function WizardCard({
  title = 'How long do I have?',
  lead = "Trust contests can be barred 120 days after the trustee's notice. Answer four questions and see which California deadlines may apply to you.",
  size = 'lg',
  headingLevel: Tag = 'h2',
  className = '',
}: WizardCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl bg-maroon-700 p-6 text-white lg:p-8 ${className}`}
    >
      <Eyebrow tone="light" rule>
        Deadlines
      </Eyebrow>
      <Tag className={`mt-3 font-serif text-white ${size === 'lg' ? 'text-h2' : 'text-h3'}`}>
        {title}
      </Tag>
      <p className="mt-3 text-body text-white/80">{lead}</p>
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
