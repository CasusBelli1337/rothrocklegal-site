import { Slot } from '@/components/lens/Slot';
import { lensCopy } from '@/config/lens-copy';
import { legionLitigator } from '@/config/legion-litigator';

interface CommitmentsProps {
  /** 'grid' runs two across from `sm`; 'list' stacks them. */
  layout?: 'grid' | 'list';
}

/**
 * The four commitments a Legion Litigator makes, from config. The "faster"
 * commitment carries the `why-faster-lead` lens slot (a trustee reads about
 * trust statements, a beneficiary about bank and medical records), so the
 * homepage keeps that framing where "How we run your case" used to hold it.
 */
export function Commitments({ layout = 'grid' }: CommitmentsProps) {
  const listClass = layout === 'grid' ? 'grid gap-6 sm:grid-cols-2' : 'space-y-5';
  return (
    <ul className={listClass}>
      {legionLitigator.commitments.map((item) => (
        <li key={item.lead} className="border-l-2 border-brass-400 pl-4">
          <p className="font-sans text-h4 text-ink">{item.lead}</p>
          <p className="mt-1.5 text-body text-ink-2">
            {item.body ?? <Slot name="why-faster-lead" variants={lensCopy.whyFasterLead} />}
          </p>
        </li>
      ))}
    </ul>
  );
}
