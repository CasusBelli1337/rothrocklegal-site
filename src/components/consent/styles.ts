/**
 * The bar's three choices and "Save choices" share one look: equal weight, so
 * saying no is exactly as easy as saying yes (CCPA regs § 7004(a)(2)).
 * 48px tall, 16px text, and a label may wrap on a narrow phone.
 */
export const choiceButtonClass =
  'inline-flex min-h-12 items-center justify-center gap-1.5 px-3 py-2 text-center text-body font-semibold leading-tight ' +
  'bg-maroon-900 text-white transition-colors duration-150 hover:bg-maroon-950 active:bg-maroon-950 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon-500';

/** A text link inside the bar's small print: underlined at rest (nothing depends on hover). */
export const barLinkClass =
  'tap-link font-medium text-maroon-700 underline underline-offset-3 hover:text-maroon-900';
