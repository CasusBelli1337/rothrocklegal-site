# The lens – trustee and beneficiary framing

The site quietly reframes itself for a visitor who is probably a trustee or
probably a beneficiary, and stays neutral for everyone else. Nothing leaves
the browser: no query strings, no separate URLs, no analytics, no server. A
visitor never gets asked "which are you?"; the guess comes from where they
landed and what they click, and either side can flip it with one link.

## 1. How it works

- **State** lives in `localStorage` under `rl-lens`: a score, the last 30
  signals, and a timestamp (`src/lib/lens/store.ts`). Score ≥ 2 → trustee,
  ≤ −2 → beneficiary, between → neutral (`resolveLens`). The score is clamped
  to ±6 so a few clicks the other way always bring it back. A signal key seen
  in the last 10 minutes is not counted twice. Every storage touch is wrapped
  in try/catch; private mode leaves the site neutral.
- **Before paint**: a <400-byte inline script in `<head>`
  (`src/lib/lens/boot.ts`) installs a MutationObserver that keeps the slot
  variants' `hidden` attribute matched to `html[data-lens]` as the parser (and
  later React, on client navigation) adds them, then reads `rl-lens` and stamps
  `html[data-lens]`. Observer callbacks run as microtasks, before the browser
  paints, so a stored framing shows on first paint without waiting for React.
  It uses block-scoped `let`: the reading-options script beside it declares
  globals. Then `LensTracker` (mounted in the root layout) keeps the attribute
  and the `hidden` attributes in sync (`syncLensSlots`), records
  the landing signal for the first path of the tab session (`sessionStorage`
  flag `rl-lens-landed`) and a navigation signal on every later path, and
  relays clicks on `[data-lens-event]` links.
- **Copy**: a server-safe `<Slot name="…" variants={{ neutral, trustee,
beneficiary }} />` (`src/components/lens/Slot.tsx`) renders every framing
  into the HTML with `data-for`, and every framing that does not serve the
  neutral lens carries the HTML `hidden` attribute (since 2026-10-01). A reader
  of the raw HTML (an AI tool, a text extractor, a no-JS browser, a crawler, a
  first visit) meets one framing per slot: the homepage `<h1>` is one headline,
  not two. The `hidden` attribute is the only thing that hides a framing; no CSS
  rule keys on `html[data-lens]` for copy (`src/lib/lens/slots.ts` is the
  logic). Slot elements carry `suppressHydrationWarning` because the head
  script may move `hidden` before React hydrates. Order changes (problem cards, home FAQ) use CSS `order`
  from `--lens-order-<lens>` custom properties (`src/lib/lens/order.ts`).
- **Config**: `src/config/lens.ts` holds every weight, threshold, and order;
  `src/config/lens-copy.ts` holds every variant as plain strings
  (`[label](/href/)` = link, `*word*` = em-word), or for the buttons and the
  deadline cards as typed objects of strings rendered through
  `renderVariants`. `scripts/check-lens.mjs` fails
  the build if any slot in the export lacks a framing, if any page shows a
  non-neutral framing without `hidden` (or hides the neutral one), or if the
  homepage `<h1>` shows more than one framing.

## 2. Signals

| Signal                                                                                                                         | Landing | Navigation |
| ------------------------------------------------------------------------------------------------------------------------------ | ------- | ---------- |
| `/for-trustees/`                                                                                                               | +2      | +1         |
| Seven beneficiary practice pages (trust contests … financial elder abuse)                                                      | −2      | −1         |
| `/library/<slug>/` in `For Trustees`                                                                                           | +2      | +1         |
| `/library/<slug>/` in Trust Contests, Will Contests, Undue Influence & Capacity, Trustees & Fiduciaries, Elder Financial Abuse | −2      | −1         |
| Everything else (`/`, `/library/`, `/complex-estates/`, hub, Deadlines, Probate Process, Business, Technology)                 | 0       | 0          |

| Click                                                  | Effect                        |
| ------------------------------------------------------ | ----------------------------- |
| `card:for-trustees` / `card:<other>`                   | +2 / −2                       |
| `chip:for-trustees` / `chip:<beneficiary cat>`         | +1 / −1 (other chips 0)       |
| `wizard:relationship:trustee-or-executor` / other      | +3 / −2 (consult-flow select) |
| `intake:situation:for-trustees` / `<beneficiary slug>` | +3 / −2 (others 0)            |
| `switch:trustee` / `switch:beneficiary`                | score set to +3 / −3          |

Navigation weight = half the landing weight, rounded toward zero, never below ±1.

## 3. What changes under a lens

Home hero title and sub-line (plus the escape-hatch link), deadline band
(the hook question, the three clock cards with their teaser as one slot,
primary and secondary buttons; the eyebrow and lead were cut 2026-09-03, so
the homepage carries 11 slots against a floor of 10), problem-card order and the
complex-estates line, how-we-work step 1 and the "why faster" lead (since
2026-09-04 the "Faster where it matters" commitment in the Legion Litigator
section, on the homepage and the About page), the library preview (three
lists, three cards each), the home FAQ order (the two trustee questions
first), the `/library/` featured card, the consult flow (the trustee situation
pre-checked once per tab session, still editable), and Arthur's bio page: the
hero line and the opening paragraph of the bio (`hero-line` and `bio` slots,
`Framed<T>` values in `src/config/team/arthur-rothrock.ts`; `check-lens.mjs`
expects at least two slots there). Every framed variant keeps one clause
acknowledging the other side.

## 4. Preview switcher

Only in the Armory editor preview (`EDITOR_PREVIEW=1` sets
`NEXT_PUBLIC_PREVIEW_TOOLS=1` in `next.config.mjs`), the root layout mounts
`PreviewLensSwitch`: a pill at the bottom centre (moved from bottom-right on 2026-09-03 so it never covers the consult flow's sticky action bar) with Neutral / Beneficiary / Trustee
and Reset. A lens button sets the score to 0 / −3 / +3 through the same store
call as the escape hatch; Reset clears `rl-lens` and the landing flag. The
production export has no trace of it (`check-lens.mjs` asserts this).

## 5. Verifying

`npm test` (store, signals, boot script, slots, order, Slot), `node scripts/check-lens.mjs`
over `out/`, and the headless Playwright run described in the redesign QA
notes (`~/projects/rothrock-legal/qa/lens/`). The 2026-10-01 run (screenshots
in `scripts/e2e/shots/lens-hidden/`, git-ignored) set `rl-lens` per lens and
counted visible `[data-for]` elements per slot on the homepage, `/library/`,
`/request-a-consult/`, and Arthur's bio (exactly one, the lens's own, under every
lens), loaded the homepage under the trustee lens with every Next.js chunk
blocked (the head script alone showed the trustee headline), switched lenses
from a second tab without a reload, and followed a client-side link to the bio
under the trustee lens.
