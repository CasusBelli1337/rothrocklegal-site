import { Button } from './Button';
import { Eyebrow } from './Eyebrow';
import { PhotoCorners } from './PhotoCorners';

interface DeadlineCalloutProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body: React.ReactNode;
  headingLevel?: 'h2' | 'h3';
  cta?: { label: string; href: string };
  /** Replaces the `cta` button outright (the homepage renders one button per lens). */
  action?: React.ReactNode;
  /** Rendered beside the button, e.g. "Or request a consult". */
  secondary?: React.ReactNode;
  finePrint?: React.ReactNode;
  className?: string;
}

/** White card with a hairline border and brass corner mounts, pointing at the wizard (DESIGN-BRIEF §6; white, not pink, per Arthur 2026-09-02; corners, not a top rule, 2026-09-03). */
export function DeadlineCallout({
  eyebrow,
  title,
  body,
  headingLevel: Tag = 'h3',
  cta = { label: 'Check my deadline', href: '/how-long-do-i-have/' },
  action,
  secondary,
  finePrint,
  className = '',
}: DeadlineCalloutProps) {
  const size = Tag === 'h2' ? 'text-h2' : 'text-h3';
  return (
    <div className={`relative border border-line bg-white p-6 sm:p-8 lg:p-10 ${className}`}>
      <PhotoCorners sizeClassName="h-6 w-6 lg:h-8 lg:w-8" />
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag className={`${eyebrow ? 'mt-3' : ''} font-serif ${size} text-ink`}>{title}</Tag>
      <div className="mt-4 max-w-[62ch] text-body-lg text-ink-2">{body}</div>
      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {action ?? <Button href={cta.href}>{cta.label}</Button>}
        {secondary && <div className="text-body text-ink-2">{secondary}</div>}
      </div>
      {finePrint && <p className="mt-5 text-small text-ink-3">{finePrint}</p>}
    </div>
  );
}
