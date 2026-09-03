# Mobile

Most visitors reach this site on a phone, often one-handed and in a hurry. This
document records the mobile standard the site is held to, what the 2026-09-02
mobile pass changed, and how to check a build before it ships. The full
checklist with sources (WCAG 2.2, web.dev, Chrome, Google Search Central, MDN,
Apple HIG, Material, NN/g, Baymard) lives outside the repo at
`~/projects/rothrock-legal/qa/mobile/mobile-best-practices.md`.

## The standard

- **Core Web Vitals on a slow phone.** Lighthouse mobile (Moto G Power, 4x CPU
  slowdown, slow 4G) is the lab proxy until real-user data exists: LCP under
  2.5 s is "good", CLS under 0.1, INP under 200 ms. The site is static, so TBT
  and INP are not a concern; LCP and CLS are.
- **Touch targets.** Every control at least 44 px tall (Apple HIG 44 pt,
  WCAG 2.5.5); text links in a sentence are exempt (WCAG 2.5.8). Hit areas of
  neighbouring controls must not overlap.
- **Text.** Body copy at least 16 px; every form control at least 16 px (iOS
  Safari zooms the page on focus below that). Secondary text is 15 px on phones
  (`--text-small` floor in `globals.css`), 14 px from `sm` up.
- **Nothing depends on hover.** Tailwind 4 wraps `hover:` in
  `@media (hover: hover)`, so a hover-only underline never appears on a phone.
  Links that sit among plain text carry an underline at rest.
- **No content gated on JavaScript.** Everything is in the static HTML and
  visible before hydration; the reveal motion only hides what is still below
  the viewport once the page has hydrated.
- **Chrome and keyboard aware.** `min-h-dvh`, `env(safe-area-inset-bottom)` on
  the fixed bar and the menu sheet, the bar hides while a text field has focus,
  `theme-color` matches the maroon band, `format-detection` keeps iOS from
  turning the phone number into a call link (Arthur does not field calls).

## Building blocks

- `tap-row` (globals.css): a link in a stacked list becomes a 44 px flex row on
  touch screens and stays compact for a mouse at `lg`. Pair it with
  `lg:space-y-*` on the list so rows touch on phones and keep the desktop gap.
- `tap-link` (globals.css): a standalone text link or text button gets a 44 px
  tall hit area through a pseudo-element, without moving anything. Do not put
  two `tap-link`s within 44 px of each other vertically; use `tap-row` instead.
- `font-serif-italic`: the italic serif is its own, non-preloaded family
  (`layout.tsx`). Use it with `italic` wherever the serif is italic
  (quotes, `em-word`, prose blockquotes).
- `scripts/make-image-variants.mjs`: `next/image` is `unoptimized` on this
  static export, so `sizes` does nothing and no `srcset` is generated. Width
  variants come from this script (table at the top; one entry per `<picture>`),
  the component references them by name (`components/home/Hero.tsx`). Run it
  after changing a source image; it is idempotent and count-verified.
- `<picture>` with a `media` source is the way to keep a phone from
  downloading an image it never shows (`components/library/ArticleHero.tsx`).

## What the 2026-09-02 pass changed

Lighthouse mobile, static export served with gzip, before and after:

| Page                          | Perf before  | Perf after | LCP before      | LCP after | CLS before | CLS after |
| ----------------------------- | ------------ | ---------- | --------------- | --------- | ---------- | --------- |
| `/`                           | 85           | 92         | 4.4 s           | 3.3 s     | 0          | 0         |
| `/trust-contests/`            | 88           | 96         | 3.9 s           | 2.8 s     | 0          | 0         |
| `/library/`                   | 75 (no gzip) | 96         | 7.7 s (no gzip) | 2.8 s     | 0          | 0         |
| `/how-long-do-i-have/`        | 82 (no gzip) | 97         | 4.9 s (no gzip) | 2.6 s     | 0          | 0         |
| `/request-a-consult/`         | 75 (no gzip) | 96         | 5.0 s (no gzip) | 2.8 s     | 0.153      | 0         |
| `/contact/`                   | 79 (no gzip) | 99         | 5.7 s (no gzip) | 2.3 s     | 0          | 0         |
| `/attorneys/arthur-rothrock/` | 78 (no gzip) | 95         | 6.2 s (no gzip) | 2.9 s     | 0          | 0         |

Lighthouse's simulation moves a few points and a few tenths of a second
between runs of the same build (the home page read 95 / 2.9 s one run
earlier); treat the table as a range, not a scoreboard.

Accessibility 100, best practices 100 (96 on the consult page only because the
intake API is unreachable from the audit machine), SEO 100 (69 on draft
articles, which are `noindex` on purpose).

- **Fonts (biggest LCP lever).** Newsreader lost the optical-size axis and the
  italic face is loaded on demand: preloaded font bytes went from 302 KB to
  88 KB. On slow 4G that is about a second of the LCP.
- **Hero image.** `<picture>` with 3:2 crops for phones (768/1024/1280 px) and
  4:5 crops for desktop, `fetchpriority="high"`; a phone now fetches 22 to
  64 KB instead of the 145 KB portrait.
- **Reveal motion** was removed on 2026-09-03; nothing is hidden until hydration.
- **Consult page CLS** (0.15): the intake flow rendered a short "checking"
  placeholder that later grew into the form. The first step now renders in the
  static HTML; only an offline API swaps in the fallback.
- **Wasted requests.** Article covers hidden on phones are no longer preloaded;
  the library preloads one cover, not three; team cards carry both headshot
  sizes in one `srcset`.
- **Tap targets.** Footer link columns, breadcrumbs, practice sidebar lists,
  city links, TOC rows, intake text buttons, chips, the logo link, LinkedIn,
  the search clear button: all at least 44 px tall on touch. Per-page count of
  under-44 px controls went from 22 to 38 down to 0 (inline links in sentences
  and radio buttons inside 44 px labels excepted).
- **Headline scale.** Display and h1 clamps start at 32 px / 30 px on phones
  (were 42 px / 34 px) so a long headline runs 3 or 4 lines, not 5 or 6;
  desktop sizes are unchanged. The phone number on `/contact/` steps down to
  `text-h2` under `sm` so it fits a 320 px screen.
- **Menu sheet.** Scroll lock on `html` and `body` (iOS), `overscroll-contain`,
  a focus trap, safe-area padding under the buttons.
- **Forms.** The party-name field turns autofill off so the phone does not
  offer the visitor's own name for the person who died.
- **Head.** `theme-color`, `format-detection: telephone=no`, `min-h-dvh`,
  `scroll-padding-top` for anchors under the sticky header.

## Checking a build

The audit scripts live in `~/projects/rothrock-legal/qa/mobile/` (Playwright
and Lighthouse are not dependencies of this repo). From a worktree with a
fresh `out/`:

```
cd ~/projects/rothrock-legal/qa/mobile && npm install
node serve.mjs <worktree>/out 4174          # gzip static server, like GitHub Pages
node mobile-audit.mjs ./results             # 17 pages x 5 widths: overflow, targets, text, inputs, images
node lh.mjs ./results                       # Lighthouse mobile on 8 key pages
```

`results/mobile-audit.md` lists every control under 44 px, every input under
16 px, and any horizontal overflow; `results/shots/` holds 390 px screenshots
of every page and the open menu. Look at the screenshots; numbers alone miss
layout problems. Widths to check by hand when something changes near the
edges: 320, 360, 375, 390, 430, and a 768 tablet in both orientations.

## Judgment calls left as they are

- The recognitions row in the hero scrolls sideways and is keyboard reachable
  (`tabIndex=0`); it is not a tap target.
- The homepage deadline tile's second action ("Request a consult") is a full
  secondary button since 2026-09-03 (it was an inline link before the rebuild).
- The desktop nav dropdown still opens on hover, but only where hover exists;
  a touch tablet in landscape opens it by tap.
- `ArticleToc` mounts both the mobile and the desktop variant, so its scroll
  listener runs twice on article pages. Cheap on phones today; hoist the hook
  if articles grow long.
