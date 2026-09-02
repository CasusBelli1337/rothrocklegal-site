import type { CSSProperties } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPage } from '@/lib/seo/jsonld';
import { bindSectionSigns } from '@/lib/typography';
import type { FaqItem } from '@/types/content';

interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Emit FAQPage JSON-LD from the same data (default true). */
  jsonLd?: boolean;
  /** Heading level for each question; h3 under an h2 section heading. */
  headingLevel?: 'h3' | 'h4';
  /** Extra class/style per item (the homepage uses it for lens ordering). */
  itemProps?: (item: FaqItem, index: number) => { className?: string; style?: CSSProperties };
  className?: string;
}

/**
 * Native `<details>` accordion; no JS (DESIGN-BRIEF §6). Each item carries its
 * own top rule (not `divide-y`) so CSS `order` can rearrange them cleanly.
 */
export function FaqAccordion({
  items,
  jsonLd = true,
  headingLevel: Tag = 'h3',
  itemProps,
  className = '',
}: FaqAccordionProps) {
  if (items.length === 0) throw new Error('FaqAccordion rendered with no items');
  return (
    <>
      <div className={`flex flex-col ${className}`}>
        {items.map((item, index) => {
          const extra = itemProps?.(item, index) ?? {};
          return (
            <details
              key={item.question}
              className={`group border-t border-line ${extra.className ?? ''}`}
              style={extra.style}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500">
                <Tag className="font-sans text-h4 text-ink group-hover:text-maroon-700">
                  {item.question}
                </Tag>
                <ChevronDownIcon className="mt-1 h-5 w-5 shrink-0 text-brass-500 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="max-w-[65ch] pb-6 text-body text-ink-2">
                {bindSectionSigns(item.answer)}
              </p>
            </details>
          );
        })}
      </div>
      {/* Outside the list: as its last child the <script> drew a phantom rule under the accordion. */}
      {jsonLd && <JsonLd data={faqPage(items)} />}
    </>
  );
}
