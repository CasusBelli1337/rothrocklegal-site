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
  (`src/lib/lens/boot.ts`) reads `rl-lens` and stamps `html[data-lens]`. Then
  `LensTracker` (mounted in the root layout) keeps the attribute in sync, records
  the landing signal for the first path of the tab session (`sessionStorage`
  flag `rl-lens-landed`) and a navigation signal on every later path, and
  relays clicks on `[data-lens-event]` links.
- **Copy**: a server-safe `<Slot name="…" variants={{ neutral, trustee,
beneficiary }} />` (`src/components/lens/Slot.tsx`) renders every framing
  into the HTML with `data-for`; `globals.css` shows the one matching
  `html[data-lens]`. No attribute (crawlers, no-JS readers, first visit) shows
  the neutral copy. Order changes (problem cards, home FAQ) use CSS `order`
  from `--lens-order-<lens>` custom properties (`src/lib/lens/order.ts`).
- **Config**: `src/config/lens.ts` holds every weight, threshold, and order;
  `src/config/lens-copy.ts` holds every variant as plain strings
  (`[label](/href/)` = link, `*word*` = em-word), or for the buttons and the
  deadline cards as typed objects of strings rendered through
  `renderVariants`. `scripts/check-lens.mjs` fails
  the build if any slot in the export lacks a framing.

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
complex-estates line, how-we-work step 1 and the "why faster" lead, the
library preview (three lists, three cards each), the home FAQ order (the two
trustee questions first), the `/library/` featured card, and the consult flow
(the trustee situation pre-checked once per tab session, still editable).
Every framed variant keeps one clause acknowledging the other side.

## 4. Preview switcher

Only in the Armory editor preview (`EDITOR_PREVIEW=1` sets
`NEXT_PUBLIC_PREVIEW_TOOLS=1` in `next.config.mjs`), the root layout mounts
`PreviewLensSwitch`: a pill bottom-right with Neutral / Beneficiary / Trustee
and Reset. A lens button sets the score to 0 / −3 / +3 through the same store
call as the escape hatch; Reset clears `rl-lens` and the landing flag. The
production export has no trace of it (`check-lens.mjs` asserts this).

## 5. Verifying

`npm test` (store, signals, boot script, order, Slot), `node scripts/check-lens.mjs`
over `out/`, and the headless Playwright run described in the redesign QA
notes (`~/projects/rothrock-legal/qa/lens/`).
