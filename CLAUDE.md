# rothrocklegal-site

## Overview

Rothrock Legal's website: a trust and estate litigation firm in San Jose
(Santa Clara County and the San Francisco Bay Area). Next.js 15 App Router,
TypeScript strict, Tailwind CSS 4, exported with `output: 'export'` and
`trailingSlash: true` to `out/`, deployed to GitHub Pages at
https://www.rothrocklegal.com by `.github/workflows/deploy.yml` on every push
to `main`. No server code, no API routes: every page is static HTML.

Arthur edits the site through the Armory `website-editor-rothrock` module
(`http://localhost:9080/tools/website-editor-rothrock/`). That container
mounts this repo, runs `next dev` with `EDITOR_PREVIEW=1` so
`next.config.mjs` adopts the `/_preview` basePath, and its Publish button
commits and pushes to `main`. See `docs/EDITING.md`.

AGENTS.md is a relative symlink to this file and must stay one.

### Editing notes: the preview lens switcher

The editor preview shows a "Lens" pill at the bottom centre (Neutral / Beneficiary /
Trustee / Reset). It exists only there: `next.config.mjs` sets
`NEXT_PUBLIC_PREVIEW_TOOLS=1` under `EDITOR_PREVIEW=1`, and
`src/app/layout.tsx` imports `components/lens/PreviewLensSwitch` only when that
flag is set, so a production export has no trace of it (`check-lens.mjs`
asserts this). A lens button writes the score directly to the `rl-lens`
store (0 / −3 / +3, the same call the site's own escape-hatch links use), which
re-stamps `html[data-lens]` without a reload; Reset clears the score and the
tab's landing flag. Use it to review every framing of the homepage, `/library/`,
and the consult flow; visitors never see it. Details: `docs/LENS.md`.

## Commands

- `npm run dev` is only ever run by the editor container. Never start it by
  hand and never run `next build` in the editor's checkout (it owns `.next`).
- `env -u NODE_ENV npm run build` builds the static export to `out/`.
- `npm run lint`, `npm run typecheck`, `npm test` (Vitest, `src/**/*.test.ts`).
- `npm run check-links` crawls `out/` for broken internal references.
- `node scripts/check-seo.mjs` runs the SEO gates over `out/` (see Gotchas).
- `node scripts/import-articles.mjs [dir]` validates and copies writers'
  articles into `content/library/`.
- `node scripts/make-covers.mjs [--force]` generates missing library covers.
- `node scripts/make-image-variants.mjs [--force]` generates the width crops
  that `<picture>` elements reference (the hero). Run after changing a source
  image; `next/image` is unoptimized here, so `sizes` alone does nothing.

- `node scripts/e2e/run-intake.mjs [email]` drives the consult flow end to end in
  Arthur's Chrome over CDP (localhost:9222) against the editor preview, with
  optional uploads from a Windows-side folder (env vars in the file header);
  screenshots land in `scripts/e2e/shots/` (git-ignored). `curl` is denied in
  this environment; the driver uses node fetch and raw CDP.
- `node scripts/check-lens.mjs` verifies the lens export (every copy slot
  carries all three framings, boot script in `<head>`, no preview-tool trace).
- `npm run pdfjs:assets` copies pdf.js's worker, wasm decoders, and standard
  fonts into `public/pdfjs/` (git-ignored; `npm run build` and `npm run dev` run
  it first). The `/sign/` page renders the agreement with pdf.js.

Full check before a commit: lint, typecheck, test, build, check-links, check-seo, check-lens.

## Architecture (config over code)

Components read config; they never hardcode firm facts, URLs, or copy lists.

- `src/config/site.ts`: firm details, nav, footer links, palette mirror,
  canonical host, `asset()` (prefixes the basePath for string image srcs).
- `src/config/practice-areas.ts` + `practice/<slug>.ts`: the eleven practice
  areas (hub `trust-litigation`, seven trust and estate pages, `for-trustees`,
  `complex-estates`, `business-disputes` marked `secondary`). Each carries
  headline, meta, summary, deadline, statutes, FAQ, related library categories.
  Body prose lives in `content/practice/<slug>.md` as `## ` sections, rendered
  by `src/lib/practice.ts`. Count-checked at 11.
- `src/config/team.ts` + `team/<slug>.ts` (`member.ts` is the type): the four
  attorneys. Any field containing `[CONFIRM]` makes the profile render a draft
  chip and `noindex`. Count-checked at 4. Badge art on a role, a membership
  (`membershipBadges`, keyed by the exact membership string), or the podcast
  turns it into a recognition tile (`team/recognition-tiles.ts`); items
  without art stay in the sidebar lists.
- `src/config/service-areas.ts` (courts, counties, cities), `redirects.ts`
  (every retired URL), `testimonials.ts`, `faq.ts`.
- `src/lib/library/articles.ts`: loader over `content/library/*.md`. Validates
  the schema and throws with the file name on any violation. `index-item.ts`
  and `preview.ts` are the light shapes for cards. `src/app/library/index.json/route.ts`
  exports the search index (count-verified).
- `src/lib/markdown.ts` (+ `markdown-inline.ts`, `markdown-sections.ts`): the
  dependency-free renderer. `##`/`###` headings with ids, paragraphs, lists one
  level deep, blockquotes, pipe tables, rules, bold, italic, links. Extend it;
  do not add a markdown package.
- `src/lib/frontmatter.ts`: `key: value` frontmatter only, no YAML nesting.
- `src/lib/deadlines/*`: the wizard's pure logic. `rules.ts` + `rules-contests.ts`
  are the rule table, `compute.ts` runs the clocks and the CCP § 12a roll,
  `holidays.ts` holds the 2026 and 2027 court holidays, `RULES.md` is the
  statute-by-statute verification record. Re-verify every January.
- `src/lib/lens/*` + `src/config/lens.ts` (rules) + `src/config/lens-copy.ts`
  (copy): the lens, a browser-only trustee/beneficiary framing inferred from
  the landing path and clicks (`docs/LENS.md`). Copy variants render through
  `components/lens/Slot` with `data-for`; `html[data-lens]` picks one; URLs
  never change and nothing is sent anywhere.
- `src/lib/a11y/*` + `src/config/a11y.ts`: the reading options (text size,
  contrast, motion, spacing). `store.ts` owns localStorage `rl-a11y` and the
  `html[data-*]` attributes, `boot.ts` is the head script, `useReadingPrefs.ts`
  the hook. Rendered by `components/layout/ReadingOptions.tsx` (`docs/ACCESSIBILITY.md`).
- `src/lib/intake/*` + `src/components/intake/*`: the consult flow.
  `contract.ts` is the shared API contract (#seam:rothrock-intake-contract),
  `api.ts` the fetch layer, `copy.ts` every string, `state.ts` the reducer,
  `mic-help.ts` + `browser.ts` the microphone pre-flight, `resume.ts` continue
  by email. See "Consult flow (intake v2)" below.
- `src/lib/seo/jsonld.ts` (typed builders: LegalService, WebSite, Person,
  ProfilePage, Article/BlogPosting, FAQPage, BreadcrumbList, WebPage) and
  `metadata.ts` (`pageMetadata()`: title, description, canonical, OG, Twitter).
- `src/components/<domain>/`: `layout`, `home`, `practice`, `team`, `library`,
  `wizard`, `intake`, `about`, `legal`, `lens`, `seo`, `ui`. Client components only where there
  is interaction (`LibraryClient`, `DeadlineWizard`, the intake flow, menus).

## Content

`content/library/<slug>.md` frontmatter (all required unless noted):

```
title, description (meta, aim for 155 chars), excerpt (cards),
date, updated (optional, defaults to date), author (team slug),
category, tags (comma list), primaryKeyword, secondaryKeywords (optional),
image (/images/...), imageAlt, draft (true|false)
```

- `category` is one of the nine in `src/types/content.ts` `LIBRARY_CATEGORIES`:
  Deadlines, Trust Contests, Will Contests, Undue Influence & Capacity,
  Trustees & Fiduciaries, Elder Financial Abuse, Probate Process, Business
  Disputes, Technology & the Law. The last one holds the AI glossary alone (the nine
  pre-redesign posts were retired on 2026-09-03); it is never featured or previewed.
- Body: `##` and `###` only (the title is the H1). A
  `## Frequently asked questions` section of `### Question?` + one paragraph
  becomes the FAQ accordion and FAQPage JSON-LD. End with
  `## Talk to a trust litigation lawyer in San Jose` and a final paragraph that
  starts `This article is general information` (the loader rejects anything
  else). No em dashes anywhere in the file.
- `draft: true`: the article still renders, with a "Draft – pending attorney
  review" tag, `noindex`, and it is left out of `sitemap.xml` and `llms.txt`.
  Set `LIBRARY_HIDE_DRAFTS=1` on a build to drop drafts entirely.
- Adding an article: write it to the redesign articles folder, run
  `node scripts/import-articles.mjs` (schema, banned words, em dashes, FAQ and
  CTA sections, description ≤ 155), then `node scripts/make-covers.mjs` to
  generate `public/images/library/<slug>.webp` (1200×675, deep maroon gradient by
  category, maroon-800 to maroon-950 so it matches `band-maroon`, title in Newsreader, also the article's OG image), then build.
- Dates span 2022 to 2026 by design (Arthur, 2026-09-03). A new article's `date`
  must not precede the newest law, case, or fact it cites; set `updated` only
  when an older article was revised for a later change.
- Practice page prose: `content/practice/<slug>.md`, at least three `## `
  sections; headings become sidebar anchors.

## Pages (every URL has a trailing slash)

- `/` home, in the order a worried family member needs: hero, the deadline
  tile, problem cards, attorneys strip, what to expect (four steps), how we run
  your case, what clients say, library preview, FAQ, where we practice, contact
  band. A sticky call bar on mobile.
- `/trust-litigation/` hub + `/trust-contests/`, `/will-contests/`,
  `/undue-influence-and-capacity/`, `/breach-of-fiduciary-duty/`,
  `/trust-accounting-disputes/`, `/estate-property-disputes/`,
  `/financial-elder-abuse/`, `/business-disputes/`. One template
  (`components/practice/PracticePage.tsx`), each route file is five lines.
- `/attorneys/` + `/attorneys/<slug>/` for `arthur-rothrock`, `gerry-lin`,
  `jonathan-joannides`, `max-discher`.
- `/about/`, `/how-long-do-i-have/` (the wizard, ends in a consult request panel),
  `/library/` (search + category chips, `?category=&q=` synced to the URL) +
  `/library/<slug>/`, `/faq/`, `/service-areas/`, `/contact/`,
  `/privacy-policy/`, `/disclaimer/`.
- `/sign/?t=<token>` and `/schedule/?t=<token>`: the two pages a person reaches
  only from an emailed link (the portal's engagement and scheduling builders send
  them). Both are `noindex`, out of the sitemap, disallowed in robots.txt, exempt
  from the orphan check, and hide the mobile consult bar. They call the portal's
  public service through the intake pass-through, `NEXT_PUBLIC_INTAKE_API` +
  `/api/intake/public/{sign,schedule}/<token>` (`src/lib/public/api.ts`; wire
  shapes in `contract.ts`, every word in `copy.ts`, pure state machines in
  `sign-state.ts` and `schedule-state.ts`). Any unknown, expired, or used token
  is the same uniform 404 and the same "not valid or has expired" card.
- Generated: `/sitemap.xml`, `/robots.txt` (AI crawlers allowed explicitly),
  `/llms.txt`, `/library/index.json`, `/404.html`.
- Redirect stubs: every key in `src/config/redirects.ts` (old Wix paths,
  retired app pages, every old `/post/<slug>/`, all landing on `/library/`) exports through
  `src/app/[...legacy]/` as a meta-refresh page with a canonical to the target
  and `noindex`. Moving a page means adding its old URL there.

## Reading options and the boot scripts (docs/ACCESSIBILITY.md)

- "Reading options" is one 44px AA icon button (`aria-label` "Reading options",
  `ReadingOptionsButton`): the last item of the desktop nav from `xl`, and beside
  the menu button below that. It opens an inline bar under the nav row, inside
  the sticky header and in normal flow (never an overlay), with four groups of
  radio chips: text size (normal / large / larger), contrast (normal / high),
  motion (full / reduced), spacing (normal / wider). "Back to normal" clears
  everything. The same controls render inline on `/accessibility/`. The header
  row is the normal `Container`; the desktop nav starts at `xl`, and while a
  text-size choice is active (`html[data-text-size]`) it starts at `2xl` so the
  larger labels never wrap (Arthur, 2026-09-03: icon only, no label).
- A choice stamps `html[data-text-size|data-contrast|data-motion|data-spacing]`
  and is stored in localStorage `rl-a11y`; the CSS for all four lives in
  `src/app/globals.css`. Text size changes the root font size (100 / 112.5 /
  125%), so every rem-based token scales; never reintroduce pixel text sizes
  (`text-[15px]` became the `text-ui` token for this reason).
- Two tiny inline scripts sit in `<head>` (`src/app/layout.tsx`) and run before
  paint so a stored choice is in place with no flash: the lens boot script
  (`src/lib/lens/boot.ts`, ~199 bytes) and the reading-options boot script
  (`src/lib/a11y/boot.ts`, ~239 bytes, hard cap 400). `scripts/check-lens.mjs`
  asserts both are present, under the cap, and that the static `<html>` carries
  none of the attributes. Both have unit tests; edit the source, not the
  string.
- The reduced-motion option mirrors `prefers-reduced-motion` (every transition
  and animation goes to zero). The high-contrast palette lives beside the normal tokens in
  `globals.css`.

## Palette

- One strong color: maroon `#66043D` (`maroon-700`) with `maroon-950` for
  bands, `maroon-500/600` for focus rings and hover text, brass for eyebrows
  and rules, sand and paper for surfaces. The pink tints (`maroon-50`,
  `maroon-100`, `maroon-200`) were retired on 2026-09-02 at Arthur's request
  and no longer exist in `@theme`; a selected or hovered surface is `bg-sand`,
  a hover border is `border-line-strong`, and a callout is white with a
  hairline and a brass top rule (`DeadlineCallout`, the follow-up info card).
  The homepage deadline tile is square-cornered and held by brass photo-album
  mounts (`components/ui/PhotoCorners`), the frame Arthur chose on 2026-09-03.
  Text selection uses `--color-highlight` (maroon-700 at 18% alpha).
- `maroon-700` is for text, links, and thin borders only. Any filled surface is
  `maroon-900` (hover `maroon-950`), or `band-maroon` for a block; buttons are
  `maroon-900` (Arthur, 2026-09-03: the lighter fill read red). Guard:
  `grep -rn "bg-maroon-700\|bg-maroon-600\|bg-maroon-500" src` prints nothing.
- Colors go through tokens only, never hex in a component. Guard:
  `grep -rnE "maroon-(50|100|200)\b" src` must print nothing (the plain string
  `maroon-50` also matches the live `maroon-500`, so use the word boundary).
  `src/config/site.ts` mirrors the palette for JSON-LD and the editor.

## Consult flow (intake v3)

- `/request-a-consult/` talks to the intake API at the same origin
  (`NEXT_PUBLIC_INTAKE_API` empty; production is proxied by Cloudflare to the
  Armory `legion-intake` module; the editor preview reaches it through the
  Armory Caddy at `localhost:9080/api/intake/*`). `INTAKE_API_VERSION` is 3.
- Step order (`state.ts` `STEP_ORDER`): `start` (three compact tiles: before we
  start, what happens after you send, the three acknowledgment boxes with their
  plain-English gloss in brackets on the label), then numbered `contact`
  (name, email, reply preference, phone; no city or county), `story` (one line
  of guidance, the box, the microphone), `situations`, `documents`, `parties`,
  `scope`, `follow-up`, `review`, and `done`. `follow-up` exists only when the
  evaluation returned modules; `visibleSteps()` drops it otherwise, so the
  progress line says "of 7" or "of 8" and `nextStep`/`prevStep` take the state.
  Back is offered everywhere but the first tile and the done screen.
- Two model passes, each keyed to what it read (`readings.ts`) so Back,
  Forward, and a refresh never repeat a wait: after the story, `POST
/:id/triage` then `GET /:id/triage` every 2 s (90 s cap) while `situations`
  shows "Reading your story…"; when `ready`, the card "Here is what we
  understood" and the situation cards pre-ticked from `storyRead.situations`
  (written to `answers.situations` once), the documents screen lists
  `storyRead.documents`; when `unavailable` the same screens show unticked with
  the catalog fallback (`slotsForSituations`). After the documents, `POST
/:id/evaluate` then `GET /:id/evaluation` every 3 s (10 min cap) while
  `parties` shows the three staged lines; then the people the evaluation found
  (seeded once into `answers.parties`, from `storyRead.parties` when the
  evaluation is unavailable), a role select each, "Add someone", and an
  optional note (`answers.partiesNote`). `scope` asks the value range only when
  `evaluation.askValue` is true or the evaluation is unavailable. Review's Send
  is `PUT /:id/follow-up` (when modules exist) then `POST /:id/submit`.
- One upload slot: `DOCUMENTS_SLOT` from the contract (plus `VOICE_NOTE_SLOT`
  for the recording, transcribed server-side); files are multipart `slot` +
  `file` on `POST /:id/files`, up to 500 files of 95 MB each (`document-slots.ts`
  mirrors the module's `FILE_LIMITS`; Cloudflare caps one request body at
  100 MB). No per-document slots and no "I don't have this" toggles. The site
  uploads three at a time (`use-uploads.ts` `MAX_CONCURRENT_UPLOADS`), tries a
  failed upload once more on its own, then lists it as "Could not upload" with
  the reason; the count line reads "12 of 65 uploaded" live (`UploadCount`,
  `upload-summary.ts`) and a list past eight rows scrolls in its own box.
  Continue waits only for uploads still on their way; a failed file never blocks.
- The flow never waits on the model. A whole case file is read on the server
  in batches (module README "Budgets and chunking") and can take minutes; after
  45 s of "Reading what you sent" (`use-evaluation.ts` `KEEP_GOING_AFTER_MS`)
  the parties screen offers "Keep going while we finish reading"
  (`EVALUATION_KEEP_GOING`), which stops polling, seeds the people from the
  triage read (`markEvaluationBackground`, `state.readingInBackground`), skips
  the follow-up step, and lets Send submit; the module finishes the pass in the
  background and alerts the team when it settles. A server error or the 10-min
  polling cap shows the calm fallback copy (`EVALUATION_FALLBACK`), never an
  error state that stops Next. The evaluation output now carries `counsel`
  (opposing and prior lawyers with contact details) for the attorneys; the
  client view is unchanged.
- Other endpoints: `POST /api/intake` (new session, created when the third
  tile's Start is pressed), `PUT /:id/answers` (debounced autosave and an
  explicit save before each pass), `POST /api/intake/lookup` `{ email }` ->
  `{ found }` (the site sends its session bearer so its own draft is excluded;
  the server emails a one-use 24 h link; the card reads the same whatever the
  answer), `POST /api/intake/resume` `{ token }` -> `{ session, answers, files,
step, storyRead, evaluation }` (read from `?resume=` after hydration, then
  stripped with `replaceState`; `stateFromResume` restores both readings so
  neither screen waits twice), and `POST /:id/resume-link` -> `{ sent: true }`.
- The action bar (`StepNav`) is `position: sticky; bottom: 0` inside the panel:
  Back and Start over on the left, the save status, the primary button on the
  right (full-width on phones) with its "Next:" line from `md`; a validation
  message renders above the buttons so the button never moves. The panel
  (`.intake-flow`) hugs its content: the bar follows the copy on a short screen
  and sticks to the viewport bottom on a tall one (the viewport-filling
  `min-height` was removed on 2026-09-04; it left a page of white space under
  the start tiles and hid the button). On every step or
  tile change `revealPanel()` (`scroll.ts`) scrolls the panel's top edge under
  the sticky header (`window.scrollTo`, `auto` under reduced motion) and focuses
  the step heading with `preventScroll`; never the top of the page.
- The page is the breadcrumbs, the panel (its small serif heading is the h1),
  and one disclaimer line. Every start tile fits a 1366×768 viewport.
- The microphone pre-flight checks `window.isSecureContext` first: on a plain
  http address it shows the "needs a secure connection" card (typing still
  works) instead of the permission steps.
- Answers carry `spokenText` (what the browser heard, verbatim) beside `story`.
  Measured 2026-09-03 at Opus fast speed: triage 7 to 8 s; the evaluation 27 s
  with no documents and 147 s with nine documents (21 MB, 19,678 output tokens
  of which 9,778 thinking); `copy.ts` says "a minute or two". The 202-file Sorden case file (RL-2026-000041,
  2026-09-03: 197 accepted in 7 s, keep-going at 48 s, Send 3 s) went down the
  digest path and finished for the attorneys 11 minutes after Send; the module
  README has the numbers. The intake
  container gets the Armory's default Anthropic key for that allowance (the
  substitution is in the Armory `docker-compose.yml`, not in any `.env`).
- `IntakeState.version` is 2; `loadState` drops a saved v1 draft (the old
  order). Copy lives in `src/lib/intake/copy.ts` and `copy-mic.ts` only;
  `copy.test.ts` enforces the voice guide (no banned words, no em dash, no
  outcome promises, a "Next:" line for every numbered screen). The flow reads
  at 18px body text via `components/intake/intake.css`.
- The contract file is copied verbatim into the module
  (`legion-armory/modules/legion-intake/src/shared/contract.ts`) and the spec
  folder (`~/projects/rothrock-legal/redesign/INTAKE-CONTRACT.ts`); change all
  three together and `diff -q` them.

## Copy rules

- Audience: an adult child, sibling, or beneficiary who is not a lawyer.
  Plain English, short sentences. Every h1/h2 is a claim or a question.
- Never an em dash. Spaced en dash ( – ) in prose, `&ndash;` in JSX. The
  loader, the import script, and check-seo all fail on one.
- Never promise or imply an outcome. Past results and testimonials carry
  "Every case is different. Past results do not guarantee a similar outcome."
- No "expert" or "specialist". Awards named exactly as conferred (Super
  Lawyers Rising Stars is not "Super Lawyer"). Bar status only where the
  dossier verified it; otherwise the site says nothing.
- No street address anywhere, the courthouse included (Arthur, 2026-09-03). The
  office is "San Jose, California" by appointment and video; a court is named by
  its name and city only (`Court` in `service-areas.ts` has no address field),
  and "Probate Division" is never used: say "the probate court in San Jose" or
  "Santa Clara County Superior Court".
- No statements about matters handled, results, or courts appeared in (Arthur,
  2026-09-03). The site says what the firm handles, not what it has handled: no
  "has represented", "regularly appear", "home court", or "most of our cases".
  County and city names stay for search.
- No phone number anywhere (Arthur does not field calls, 2026-09-03). `site` has
  no phone field; `formatDetection.telephone: false` stays so iOS never links
  digits.
- Legion appears only as Arthur's credential ("co-founder and CEO of Legion,
  an AI litigation platform"). Never sell it, never address other lawyers.
  One exception (Arthur, 2026-09-03): the About page's "An AI-enabled
  practice" section (`components/about/AiPractice.tsx`) shows the Legion mark
  (`public/images/partners/legion-logo.svg`) and describes the platform as
  what the firm uses on the family's case. Still never a pitch, and never
  "reads every page" or "reviews every document".
- Every page ends in the footer compliance line: attorney responsible for the
  site, city, "Attorney advertising" (Rule 7.2(c); Bus. & Prof. Code
  § 6157.2(b)). Articles, practice pages, and the wizard carry the disclaimer.

## Mobile rules (docs/MOBILE.md)

- Every control is at least 44px tall on touch screens: links in stacked lists
  take `tap-row`, standalone text links and text buttons take `tap-link`,
  buttons are `h-11`/`h-12`. Inline links inside a sentence are exempt.
- Form controls are 16px or larger (iOS zooms on focus below that). Body copy
  is 16px+; `text-small` is 15px on phones by design.
- Nothing depends on hover: a link among plain text is underlined at rest.
- Content is never hidden until JavaScript runs. The scroll-in reveal animation
  was removed on 2026-09-03 (Arthur); sections render static.
- Images: `<picture>` + `scripts/make-image-variants.mjs` for anything large
  or art-directed; `next/image` emits no `srcset` on this export.
- The italic serif is `font-serif-italic` + `italic` (separate, non-preloaded
  family). Fonts are the biggest lever on mobile LCP; do not add axes or faces
  without re-running the Lighthouse check in docs/MOBILE.md.

## Gotchas

- The article loader caches at module level and the markdown sits outside the
  module graph: after editing `content/library/*.md`, the editor preview keeps
  serving the old frontmatter until `src/lib/library/articles.ts` is touched
  (mtime only, no content change).
- Never run `next build` in `~/projects/rothrocklegal-site` (the editor's
  checkout). Build in a git worktree: `git worktree add
~/projects/rothrocklegal-site-wt/<name> -b <branch> <base>`.
- The shell can leak `NODE_ENV=production`, which breaks `npm install` and
  `next build`. Prefix both with `env -u NODE_ENV`.
- The editor's checkout must keep dev dependencies installed (Tailwind,
  TypeScript, sharp). A production-only install blanks the preview.
- AGENTS.md must stay a symlink to CLAUDE.md (the editor copies symlinks
  verbatim on deploy; a real file would drift).
- Meta descriptions are capped at build by `src/config/seo-limits.json`
  (`descriptionMax` 155): `pageMetadata()`, the library loader, `check-seo.mjs`,
  and `import-articles.mjs` all fail above it.
- `[CONFIRM]` strings are dropped from JSON-LD by design (`verified()` in
  `jsonld.ts`), but they still render on the page inside a draft chip. Clear
  them in config; do not delete the filter.
- `site.replyPromise` and the fee answer in `faq.ts` are bracketed
  placeholders that render visibly until Arthur confirms them.
- `check-links.mjs` requires 30+ HTML files in `out/`; an empty or partial
  export fails loudly on purpose. So does an empty library index.
- All four headshots exist at `public/images/team/<slug>-800.webp` and
  `-400.webp`; `TeamCard`/`ProfileHero` still fall back to `InitialAvatar` if
  one is ever missing.
