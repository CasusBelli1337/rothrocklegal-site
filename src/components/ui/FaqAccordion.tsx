import { ChevronDownIcon } from "@/components/icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPage } from "@/lib/seo/jsonld";
import type { FaqItem } from "@/types/content";

interface FaqAccordionProps {
  items: readonly FaqItem[];
  /** Emit FAQPage JSON-LD from the same data (default true). */
  jsonLd?: boolean;
  /** Heading level for each question; h3 under an h2 section heading. */
  headingLevel?: "h3" | "h4";
  className?: string;
}

/** Native `<details>` accordion; no JS (DESIGN-BRIEF §6). */
export function FaqAccordion({
  items,
  jsonLd = true,
  headingLevel: Tag = "h3",
  className = "",
}: FaqAccordionProps) {
  if (items.length === 0)
    throw new Error("FaqAccordion rendered with no items");
  return (
    <div className={`divide-y divide-line border-t border-line ${className}`}>
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500">
            <Tag className="font-sans text-h4 text-ink group-hover:text-maroon-700">
              {item.question}
            </Tag>
            <ChevronDownIcon className="mt-1 h-5 w-5 shrink-0 text-brass-500 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <p className="max-w-[65ch] pb-6 text-body text-ink-2">
            {item.answer}
          </p>
        </details>
      ))}
      {jsonLd && <JsonLd data={faqPage(items)} />}
    </div>
  );
}
