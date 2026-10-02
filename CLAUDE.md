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
- `npm run lint`, `npm run typecheck`, `npm test` (Vitest, `src/**/*.test.ts`
  and `scripts/**/*.test.mjs`).
- `npm run check-links` crawls `out/` for broken internal references.
- `node scripts/check-seo.mjs` runs the SEO gates over `out/` (see Gotchas).
- `node scripts/import-articles.mjs [dir]` validates and copies writers'
  articles into `content/library/`.
- `node scripts/make-covers.mjs [--force]` generates missing library covers and
  every article's JPEG social card (`public/images/og/library/<slug>.jpg`, 1200×630).
- `node scripts/make-image-variants.mjs [--force]` generates the width crops
  that `<picture>` elements reference (the hero). Run after changing a source
  image; `next/image` is unoptimized here, so `sizes` alone does nothing.

- `node scripts/e2e/run-intake.mjs [email]` drives the consult flow end to end in
  Arthur's Chrome over CDP (localhost:9222) against the editor preview, with
  optional uploads from a Windows-side folder (env vars in the file header);
  screenshots land in `scripts/e2e/shots/` (git-ignored). `curl` is denied in
  this environment; the driver uses node fetch and raw CDP.
- `node scripts/check-lens.mjs` verifies the lens export (every copy slot
  carries all three framings; on every page the neutral framing is visible and
  the others carry `hidden`; the homepage `<h1>` reads as one headline; boot
  script in `<head>` under 400 bytes; no preview-tool trace).
- `node scripts/indexnow.mjs plan` lists the URLs the next deploy would send to
  IndexNow (new sitemap in `out/` against the live one);
  `node scripts/indexnow.mjs submit --dry-run [--sitemap out/sitemap.xml]` prints
  the payload without sending it. The deploy workflow runs both for real (see
  "Search engines and AI readers").
- `npm run pdfjs:assets` copies pdf.js's worker, wasm decoders, and standard
  fonts into `public/pdfjs/` (git-ignored; `npm run build` and `npm run dev` run
  it first). The `/sign/` page renders the agreement with pdf.js.

- `npm run check-consent` (`scripts/check-consent.mjs`) verifies the consent
  export: the consent boot script in every page's `<head>` under its cap, no
  `data-consent` on the static `<html>`, no Google tag host in any static HTML,
  the bar and the footer's "Privacy choices" button on every page, the
  counter's one inline loader on every page but `/sign/` and `/schedule/`, and
  no off-site script but the counter's.

Full check before a commit: lint, typecheck, test, build, check-links, check-seo, check-lens, check-consent.

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
  without art stay in the sidebar lists. Bios are about who the person is and
  their credentials, never how the firm divides its work (Arthur, 2026-09-04:
  no "takes the depositions", no "cite-checks every brief"); team cards show
  the name, the title, and "Read bio" only. No graduation or bar-admission
  years anywhere (`TeamEducation` has no year; `team.test.ts` guards it).
  Arthur is "a litigator", never "a trial lawyer"; Jonathan Joannides is
  "Jonathan", never "JJ"; he "founded" Digital Frontier Law, with no word on
  what he does there now. `bio` and `heroLine` may be `Framed<T>` (one value or
  a `LensCopy`); `ProfileBio`/`ProfileHero` render them through `Slot`, and
  Arthur's opening paragraph and hero line carry the three framings
  (`check-lens.mjs` counts his page). `writing` (`TeamWriting`; Arthur's is
  `team/arthur-rothrock-writing.ts`) drives the bio's "Articles by" section
  (`components/team/ArticlesByMember.tsx`, Arthur 2026-10-01): the library
  articles by that person, derived from the article index by `author`
  (`lib/library/by-author.ts`): `featuredArticles` first in their order
  (deadline, trust contest, will contest, accounting, undue influence, elder
  abuse, trustee defense), then newest, Technology & the Law last, drafts never,
  `shown` rows (10) with a count line and "See all articles"; a featured slug that
  is not a published article by them fails the build. Then "Elsewhere": at most
  six of their pieces on other sites, newest first, same tab with
  `rel="noopener"`; Arthur's are his legion.law guides that carry his byline and
  are on his CV (the product comparisons stay off the firm site).
- `src/config/legion-litigator.ts`: the Legion AI Litigator seal (Arthur,
  2026-09-04): the homepage section (`components/home/LegionLitigator.tsx`),
  the About block, the four commitments (`components/legion/Commitments.tsx`;
  the "technology" one is the `why-faster-lead` lens slot), and the seal's
  words (`components/legion/LegionLitigatorSeal.tsx`, an inline SVG in theme
  tokens: the name on the top arc, "SECURE · RESPONSIBLE · ACCOUNTABLE" on the
  bottom arc, both upright, the Legion mark and "AI LITIGATOR" at the centre;
  `public/images/badges/legion-litigator-seal.{svg,png}` are the standalone
  exports for packaging the badge for other lawyers' sites). The copy says what
  the seal promises (safeguarded information, a lawyer in charge, the best
  technology on the research, drafting, and strategy, the savings passed on),
  never who conferred it, never the mechanics ("organizing records" is out),
  and never "better results".
- `src/config/service-areas.ts` (courts, counties, cities), `redirects.ts`
  (every retired URL), `testimonials.ts`, `faq.ts`, `crawlers.ts` (the AI
  crawlers robots.txt names; each shares the `*` group's private paths, because a
  crawler with its own group ignores `*`).
- Each practice area carries a `topic` ('trust contests'): the firm's and each
  lawyer's `knowsAbout` and the page's Service `serviceType`. `featuredArticles`
  puts a library article from another category first in that page's related
  reading (the Heggstad article on `/estate-property-disputes/`).
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
  `components/lens/Slot` with `data-for`, and every framing but the neutral one
  carries the HTML `hidden` attribute in the export (since 2026-10-01: AI tools
  reading raw HTML saw two or three headlines in the homepage `<h1>`). The head
  script stamps `html[data-lens]` and its MutationObserver, plus `LensTracker`,
  move `hidden` to the matching framing (`slots.ts` `syncLensSlots` is the
  readable version); no CSS rule picks the framing any more. URLs never change
  and nothing is sent anywhere.
- `src/lib/a11y/*` + `src/config/a11y.ts`: the reading options (text size,
  contrast, motion, spacing). `store.ts` owns localStorage `rl-a11y` and the
  `html[data-*]` attributes, `boot.ts` is the head script, `useReadingPrefs.ts`
  the hook. Rendered by `components/layout/ReadingOptions.tsx` (`docs/ACCESSIBILITY.md`).
- `src/lib/intake/*` + `src/components/intake/*`: the consult flow.
  `contract.ts` is the shared API contract (#seam:rothrock-intake-contract),
  `api.ts` the fetch layer, `copy.ts` every string, `state.ts` the reducer,
  `mic-help.ts` + `browser.ts` the microphone pre-flight, `resume.ts` continue
  by email. See "Consult flow (intake v2)" below.
- `src/lib/seo/jsonld.ts` (typed builders: LegalService with a ContactPoint,
  WebSite, Person, ProfilePage; it re-exports `jsonld-core.ts`, the ids and
  `personRef`, and `jsonld-pages.ts`: Article/BlogPosting with a typed Person
  author, FAQPage, BreadcrumbList, WebPage, the practice-page WebPage + Service
  graph, and CollectionPage for `/attorneys/` and `/library/`) and
  `metadata.ts` (`pageMetadata()`: title, description, canonical, OG, Twitter).
  Import every builder from `@/lib/seo/jsonld`.
- `src/lib/seo/llms.ts`: `/llms.txt` (the index) and `/llms-full.txt` (every
  practice page and published article in full, links made absolute).
- `src/lib/analytics/*`: `events.ts` holds the four analytics events
  (#seam:ga4-events: `consult_started`, `consult_submitted`,
  `deadline_wizard_completed`, `contact_email_click`), always sent with no
  parameters, to GA4 (only after a yes) and to the counter; `tag.ts` is the GA4
  loader `components/seo/Analytics` runs after load; `counter.ts` is the
  counter's inline loader (`components/seo/Counter`). `events.test.ts` fails if
  an event has no `trackEvent(ANALYTICS_EVENTS.x)` call.
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

- `category` is one of the eleven in `src/types/content.ts` `LIBRARY_CATEGORIES`:
  Deadlines, Trust Contests, Will Contests, Undue Influence & Capacity,
  Trustees & Fiduciaries, Elder Financial Abuse, Probate Process, For Trustees,
  Complex Estates, Business Disputes, Technology & the Law. The last one holds the AI glossary alone (the nine
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
  category, maroon-800 to maroon-950 so it matches `band-maroon`, title in Newsreader) and
  its social card `public/images/og/library/<slug>.jpg` (the cover centre-cropped to
  1200×630 as JPEG, the article's og:image; the build fails without it), then build.
- Dates span 2022 to 2026 by design (Arthur, 2026-09-03). A new article's `date`
  must not precede the newest law, case, or fact it cites; set `updated` only
  when an older article was revised for a later change.
- Practice page prose: `content/practice/<slug>.md`, at least three `## `
  sections; headings become sidebar anchors.

## Pages (every URL has a trailing slash)

- `/` home, in the order a worried family member needs: hero, the deadline
  tile, problem cards, attorneys strip, what to expect (four steps), the Legion
  AI Litigator section (the seal, what it promises, the four commitments; it
  replaced "How we run your case" on 2026-09-04 because that section previewed
  how the firm delegates), what clients say, library preview, FAQ, where we
  practice, contact band. A sticky call bar on mobile.
- `/trust-litigation/` hub + `/trust-contests/`, `/will-contests/`,
  `/undue-influence-and-capacity/`, `/breach-of-fiduciary-duty/`,
  `/trust-accounting-disputes/`, `/estate-property-disputes/`,
  `/financial-elder-abuse/`, `/business-disputes/`. One template
  (`components/practice/PracticePage.tsx`), each route file is five lines.
- `/attorneys/` (the four cards and the CTA band; the "How we work as a team"
  section went with the homepage one) + `/attorneys/<slug>/` for
  `arthur-rothrock`, `gerry-lin`, `jonathan-joannides`, `max-discher`: hero,
  bio + sidebar, "Articles by" (members with `writing`), recognition, speaking
  and press, CTA band.
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
  `/llms.txt`, `/llms-full.txt`, `/library/index.json`, `/404.html`.
- Redirect stubs: every key in `src/config/redirects.ts` (old Wix paths,
  retired app pages, every old `/post/<slug>/`, all landing on `/library/`) exports through
  `src/app/[...legacy]/` as a meta-refresh page with a canonical to the target
  and `noindex`. Moving a page means adding its old URL there.

## Search engines and AI readers

- IndexNow (Arthur, 2026-10-01): `site.indexNowKey` (32 hex characters, public
  by design) is served at `/<key>.txt` from `public/`; `scripts/indexnow.test.mjs`
  checks the pair. `.github/workflows/deploy.yml` runs `scripts/indexnow.mjs` in
  two steps. `plan` (build job, before the deploy) compares the new
  `out/sitemap.xml` with the live sitemap and keeps the URLs that are new, whose
  `<lastmod>` changed, or that left the sitemap; when the live sitemap or the live
  key file cannot be read (the first deploy) it plans the whole sitemap. `submit`
  (the `indexnow` job, after the deploy) POSTs `{ host, key, keyLocation, urlList }`
  to `https://api.indexnow.org/indexnow` and logs the response code (200 or 202 is
  good; 403 means the key file is not live). Both are `continue-on-error`: a
  failure never fails or delays the deploy; with no plan, `submit` sends the live
  sitemap's whole list. Only pages whose `lastmod` moves get resent, so bump
  `site.lastUpdated`, a practice area's or member's `updatedAt`, or an article's
  `updated` with a substantive edit. Google does not use IndexNow (the sitemap
  and Search Console cover it).
- Raw HTML reads as one framing per lens slot (the `hidden` attribute above), so
  AI tools and text extractors see the neutral copy only.
- Every article's Article node names its author by Person `@id`; the bio's
  "Articles by" section links the other way in HTML. The Person node carries
  no list of articles: schema.org has no "author of" property, and `subjectOf`
  would claim the articles are about him.

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
  (`src/lib/lens/boot.ts`, ~382 bytes: it installs the slot MutationObserver
  first, then stamps the lens; observer callbacks are microtasks, so the parser
  never paints the wrong framing) and the reading-options boot script
  (`src/lib/a11y/boot.ts`, ~239 bytes, hard cap 400). `scripts/check-lens.mjs`
  asserts both are present, under the cap, and that the static `<html>` carries
  none of the attributes. Both have unit tests; edit the source, not the
  string. The two share the page's global scope: the lens script uses
  block-scoped `let` because the reading-options script declares a global `d`
  that once overwrote the `document` the observer reads (`boot.test.ts` runs
  both as classic scripts to guard it).
  A third, the consent boot script (~389 bytes, cap 450), sits beside
  them since 2026-10-01; see "Consent" below.
- The reduced-motion option mirrors `prefers-reduced-motion` (every transition
  and animation goes to zero). The high-contrast palette lives beside the normal tokens in
  `globals.css`.

## Consent: privacy choices (docs/CONSENT.md)

- Nothing from a third party, and no cookie or device storage that counts
  visits, runs before a yes (2026-10-01); the firm's own cookieless counter
  (see "Visit counter" under Gotchas) is the one exception. Categories live in
  `src/config/consent.ts`: `necessary` (always on: browser storage that never
  leaves the device), `analytics` (GA4, offered while `site.analyticsId` is
  set), and `advertising` (defined; offered only once a vendor is listed).
  Every word is in `src/config/consent-copy.ts` (`consent-copy.test.tsx`
  holds it to the voice guide, no em dash, sentences under about 25 words).
- The choice is stored in localStorage `rl-consent`
  (`{ version, savedAt, granted, signal }`, `src/lib/consent/store.ts`) and asked
  again after 12 months or a `consentConfig.version` bump. Global Privacy
  Control and Do Not Track count as a no: a yes given before the signal
  appeared is asked again, and advertising never runs under a signal.
- A third boot script in `<head>` (`src/lib/consent/boot.ts`, under 450 bytes,
  `CONSENT_BOOT_MAX_BYTES`) stamps `html[data-consent]` (`ask`, `analytics`, or
  `none`) before paint; the bar (`components/consent/ConsentBanner.tsx`, right
  after the skip link, drawn fixed at the bottom, above the mobile consult bar)
  shows under `ask` before hydration, so it never flashes and never shows
  without JavaScript. Three equal choices: "Accept analytics", "Decline",
  "Choose" (categories inline, "Save choices"); Escape declines a first visit.
- The footer's legal row carries "Privacy choices" (`PrivacyChoicesButton`),
  which reopens the bar; the privacy policy's "Cookies and your choices"
  section (`#cookies-and-your-choices`, `components/legal/PrivacyCookies.tsx`)
  carries one too. Listing an advertising vendor
  (`#seam:consent-advertising`) shows the advertising switch, renames that link
  "Do Not Sell or Share My Personal Information", and swaps the policy's
  advertising sentences; follow docs/CONSENT.md "Turning on advertising" first.

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
- Step order (`state.ts` `STEP_ORDER`): `start` (three compact tiles in
  Arthur's order, 2026-10-02: "How this works" (three numbered lines on the
  process and what we ask for, the third built from `REPLY_PROMISE` and
  `REMOTE_NOTE`, then why we ask so much up front); "What you get, whether or
  not we take your case" (the file package with the `PACKAGE_LINK_DAYS` link,
  the deadlines that may apply with a same-tab link to `/how-long-do-i-have/`,
  and a straight answer with the written fee estimate); "What we do with what
  you send" (the conflict check first, then confidentiality and the one AI
  line, then the three statements with their plain-English gloss in brackets
  on the label, each box ticked only by someone who read it and agrees; the
  copy never tells anyone to tick anything, and the validation line says the
  request can go ahead only once all three are agreed to, Arthur 2026-09-04)),
  then numbered `contact`
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
  evaluation is unavailable), a role select each, an optional one-line note per
  person (`party.note`, the portal's Note column; the name field is wider than
  the role select so a long name is not clipped, Arthur 2026-09-04), "Add
  someone", and an optional note for the whole list (`answers.partiesNote`).
  `scope` asks the value range only when `evaluation.askValue` is true or the
  evaluation is unavailable. `follow-up` answers are debounced-autosaved with
  `PUT /:id/follow-up` beside `PUT /:id/answers` (the whole map every time; the
  server replaces rather than merges), and the review screen lists them under
  "Your answers to our questions" (`follow-up-format.ts`, `review-rows.ts`:
  American dates, Yes/No, "Skipped for now", "Not answered", file counts).
  Review's Send is `PUT /:id/follow-up` (when modules exist) then `POST /:id/submit`.
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
step, storyRead, evaluation, followUpAnswers }` (read from `?resume=` after
  hydration, then stripped with `replaceState`; `stateFromResume` restores both
  readings so neither screen waits twice, and the follow-up answers for the
  modules the evaluation still asks), and `POST /:id/resume-link` -> `{ sent: true }`.
- The action bar (`StepNav`) is `position: sticky` inside the panel, at
  `bottom: var(--consent-cover, 0px)` so it stacks just above the
  privacy-choices bar on a first visit (2026-10-02; docs/CONSENT.md):
  Back and Start over on the left, the save status, the primary button on the
  right (full-width on phones) with its "Next:" line from `md`; a validation
  message renders above the buttons so the button never moves. The panel
  (`.intake-flow`) hugs its content: the bar follows the copy on a short screen
  and sticks to the viewport bottom on a tall one (the viewport-filling
  `min-height` was removed on 2026-09-04; it left a page of white space under
  the start tiles and hid the button). On every step or
  tile change `revealPanel()` (`src/lib/reveal-panel.ts`, shared with the
  deadline wizard since 2026-09-04) scrolls the panel's top edge under the
  sticky header (`window.scrollTo`, `auto` under reduced motion) and focuses
  the step heading with `preventScroll`; never the top of the page.
- The page is the breadcrumbs, the panel (its small serif heading is the h1),
  and one disclaimer line. Every start tile fits a 1366×768 viewport
  (2026-10-02, measured from the static export: bottom edges 554, 525, and
  761 px). The third tile is the tight one, so its spacing is a notch tighter
  (statement cards `px-3 py-2.5`, 8 px gaps); add a line there only after
  re-measuring.
- Your package (2026-10-01; start tiles rewritten 2026-10-02): the zip holds
  one PDF summary memo (what the person told us and the deadlines that may
  apply) plus their documents, organized and clearly named, nothing else
  (Arthur, 2026-10-02); the tile, the done-screen card (`PACKAGE_COPY.what`),
  and the review note say so, and `copy.test.ts` pins all three. The second
  start tile's first item is the package and its second the deadlines heads-up
  (`copy-start.ts` `WHAT_YOU_GET`; the earlier "Why we ask for so much up
  front" callout and fifth item "You leave with your file." are gone so nothing
  is said twice); the review screen says the package follows Send. The done
  screen's `PackageCard` polls `GET /:id/package` (`use-package.ts`: every 5 s,
  a 15-minute cap that survives a refresh via sessionStorage
  `rl-intake-package`): a pulsing line while `preparing`, then the "Download
  your package" button with size, documents, the last day, "The link in your
  email works once, so download your package and keep your own copy.", and
  "Your package is confidential and may be privileged."; an "arrives by email"
  line at the cap; nothing at all for `unavailable` or a 4xx. The tile and
  review copy promise the package, so the module's endpoint must be live
  before this ships.
- Package security (2026-10-02; module README "Package security"): every link
  to the zip works ONCE. Each `ready` status answer carries a new link good for
  15 minutes (`urlExpiresAt`); a GET of a link only opens a page on the intake
  server, so the button downloads with a form POST (`submitDownload` in
  `package.ts`: a hidden form of its own appended to `body`, because the done
  screen sits inside the step's `<form>` and forms cannot nest; never an
  `<a download>`, never a nested form). After a press the button holds still
  and the hook asks for a fresh link (1.5 s), and again when the window
  regains focus or the page comes back into view, and a minute before
  `urlExpiresAt`. "Send me a new link" calls `POST /api/intake/:id/package/link`
  (`requestPackageLink`) and says "A new link is on its way to <email>." or
  the server's own words (three a day).
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
  order). Copy lives in `src/lib/intake/copy.ts`, `copy-start.ts` (the start
  tiles), `copy-mic.ts`, `copy-review.ts`, and `copy-package.ts` only (the
  four siblings re-exported by `copy.ts`);
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
  office is "San Jose, California" and the firm meets by video only, never in
  person (Arthur, 2026-10-02: no office visits anywhere on the site); a court is named by
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
- Legion appears as Arthur's credential ("co-founder and CEO of Legion, an
  AI litigation platform") and, since 2026-09-04, as the Legion AI Litigator
  seal: the About page's "An AI-enabled practice" section
  (`components/about/AiPractice.tsx`, the Legion mark big beside the words,
  no box, no caption, then the designation block) and the homepage section
  (`components/home/LegionLitigator.tsx`). Both describe the platform as what
  the firm uses on the family's case and what the seal commits the lawyer to;
  neither says Arthur conferred the seal on himself. Never sell it, never
  address other lawyers, never a pitch, never "reads every page" or "reviews
  every document", never "better results".
- Never preview how the firm divides its work (Arthur, 2026-09-04): no "who
  does what", no "associate rates for the heavy lifting", no "senior judgment
  where it counts". The site says what the firm handles and who the lawyers
  are.
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
- Changing `site.indexNowKey` means renaming `public/<key>.txt` to match in the
  same commit; until the new file is live, IndexNow answers 403.
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
- Google Analytics (2026-09-16): the one third-party script on the site.
  `components/seo/Analytics.tsx` renders `GaLoader` from `site.analyticsId`
  (blank means no tag and no bar; the id is the web stream's measurement id under
  Analytics account "Rothrock Legal", property `rothrocklegal.com`,
  554691267) and stays off in the editor preview. Since 2026-10-01 it is
  consent-first (docs/CONSENT.md): nothing from Google loads until a yes in the
  privacy-choices bar, then basic Consent Mode v2 (`default` all denied, then
  `update`, then `config` with Google signals and ad personalization off) once
  the page is idle (SEO-SPEC §11), never on `/sign/` or `/schedule/`, with
  `?resume=` / `?t=` tokens stripped from the reported address
  (`lib/analytics/tag.ts`). A no removes the `_ga` cookies. It sends the four
  events in `lib/analytics/events.ts` (dropped, never queued, without a yes);
  mark them as key events in GA4 Admin. The privacy policy's "Technical
  information" and "Cookies and your choices" sections disclose it, and its
  effective date is `legal.privacyEffectiveDate` (October 1, 2026; the
  disclaimer and the accessibility statement keep `legal.effectiveDate`,
  September 16). The portal's Website traffic page reads the property through
  the GA4 Data API; it now counts only visitors who said yes. Removing the tag
  means blanking the id (the bar and footer link then disappear too) and
  rewriting the policy's analytics sentences.
- Visit counter (2026-10-01): the firm's own count, Umami 3.4.0 self-hosted in
  the Armory (service `umami`, admin at `http://localhost:3039` on the rig only;
  `legion-armory/docs/references/umami.md`). `site.counter` holds `origin`
  (`https://count.rothrocklegal.com`, a proxied CNAME to the rothrock-intake
  tunnel, which forwards only `/c.js` and `/api/c`) and the public `websiteId`.
  `components/seo/Counter.tsx` puts an inline loader in the static HTML of every
  page but `/sign/` and `/schedule/`; it does nothing under Global Privacy
  Control or Do Not Track, otherwise appends the tracker after load with
  `data-do-not-track`, `data-domains` (only `www.rothrocklegal.com` counts),
  and no query string or hash. No cookie, nothing written to the browser, no IP
  stored, so it does not wait for the bar (Arthur; docs/CONSENT.md section 5).
  The four events also go to it. Off in the editor preview. The off-switch is a
  blank `origin`: no tag, and `policyCounter()` drops its sentences from the
  bar's small print and the privacy policy (`counterCopy` in
  `config/consent-copy.ts`). The portal's read-only key is
  `rothrocklegal-portal/data/keys/portal-umami.conf`.
