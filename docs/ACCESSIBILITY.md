# Accessibility

The site is held to WCAG 2.2 AA (DESIGN-BRIEF §9) and checked on every build
with Lighthouse and axe on a phone viewport (`docs/MOBILE.md`). This page
records the one feature a visitor can see: the reading options, added
2026-09-02, and the public statement at `/accessibility/`.

## Reading options

A "Reading options" button (text label plus icon, 44px) sits in the header on
every page. It opens an inline bar under the header row that pushes the page
down and never covers anything (UI rule: never cover the workspace). The bar
holds four choices, each a `<fieldset>` of real radios drawn as chips:

| Option    | Values                    | What it does                                                              |
| --------- | ------------------------- | ------------------------------------------------------------------------- |
| Text size | Normal / Large / Larger   | Root font-size 100 / 112.5 / 125%. Everything is rem, so the page scales. |
| Contrast  | Normal / High             | Ink to black, `line`/`line-strong` strengthened, maroon-600 and brass-600 text deepened (all ≥ 7:1 on paper). |
| Motion    | Full / Reduced            | The same rules as `prefers-reduced-motion`: no reveal, no transitions.    |
| Spacing   | Normal / Wider            | Taller line-heights on every text token, a little word spacing, bigger prose gaps. |

How it works, in the order the browser sees it:

1. `src/config/a11y.ts` declares the options, their values (default first), the
   storage key `rl-a11y`, and the plain-English hints. Add a value there and
   its CSS in `globals.css`; nothing else changes.
2. `src/lib/a11y/boot.ts` is an inline `<head>` script (under 400 bytes, no
   external calls) that reads `rl-a11y` and stamps
   `html[data-text-size|data-contrast|data-motion|data-spacing]` before first
   paint. It accepts only the keys and non-default values config declares.
   `scripts/check-lens.mjs` asserts it sits in `<head>` beside the lens boot
   script and that the static `<html>` carries none of the attributes.
3. `globals.css` ("Reading options" block at the end) maps each attribute to
   its CSS. The high-contrast values override the `@theme` color variables, so
   every `text-ink`/`border-line` utility follows without a second class.
4. `src/lib/a11y/store.ts` is the state: `normalizeA11yPrefs` drops anything
   unknown or default, `commitA11yPrefs` stamps `<html>`, writes storage
   (removing the key when nothing is chosen), and notifies every mounted
   control. `useReadingPrefs` is the hook; `ReadingOptionGroups` renders the
   four fieldsets and is shared by the header bar and `/accessibility/`.
5. `Reveal.tsx` treats `html[data-motion="reduced"]` like the OS setting.

Nothing leaves the browser. The choices are functional storage, not tracking,
and the privacy policy's "no analytics, no tracking cookies" statements stay
true. There is no cookie banner because nothing is a cookie (Arthur,
2026-09-02).

## Text sizes

Body copy (`text-body`) is 17px from `lg` up and 16px on phones. UI text (nav,
buttons, footer links) uses the `text-ui` token (0.9375rem) rather than a pixel
size, so the text-size option scales it; `text-[Npx]` is not used outside the
intake components.

## Tests and gates

- `src/lib/a11y/boot.test.ts` runs the inline script against fake globals:
  stamps every declared value, ignores defaults, unknown keys, cross-option
  values, garbage, and a throwing storage; stays under 400 bytes.
- `src/lib/a11y/store.test.ts` covers normalize, set/unset, dataset apply and
  read-back, storage round trip and removal, and a throwing storage.
- `node scripts/check-lens.mjs` (after a build) checks the boot script.
- The mobile audit and Lighthouse (`docs/MOBILE.md`) must stay at
  accessibility 100 and zero axe violations.

## The statement page

`/accessibility/` (`src/app/accessibility/page.tsx`) says what standard the
site works to, lists the reading options and renders them inline, explains
browser zoom, covers video meetings (Google Meet captions) and documents, and
tells the reader how to report a barrier. It is linked from the footer legal
links, listed in `sitemap.xml` and `llms.txt`, and carries the last-reviewed
date from `legal.effectiveDate`.
