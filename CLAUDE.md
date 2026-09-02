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

The editor preview shows a "Lens" pill bottom-right (Neutral / Beneficiary /
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

- `node scripts/check-lens.mjs` verifies the lens export (every copy slot
  carries all three framings, boot script in `<head>`, no preview-tool trace).

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
  chip and `noindex`. Count-checked at 4.
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
- `src/lib/seo/jsonld.ts` (typed builders: LegalService, WebSite, Person,
  ProfilePage, Article/BlogPosting, FAQPage, BreadcrumbList, WebPage) and
  `metadata.ts` (`pageMetadata()`: title, description, canonical, OG, Twitter).
- `src/components/<domain>/`: `layout`, `home`, `practice`, `team`, `library`,
  `wizard`, `forms`, `about`, `seo`, `ui`. Client components only where there
  is interaction (`LibraryClient`, `DeadlineWizard`, `ContactForm`, menus).

## Content

`content/library/<slug>.md` frontmatter (all required unless noted):

```
title, description (meta, aim for 155 chars), excerpt (cards),
date, updated (optional, defaults to date), author (team slug),
category, tags (comma list), primaryKeyword, secondaryKeywords (optional),
image (/images/...), imageAlt, draft (true|false), oldSlug (legacy posts only)
```

- `category` is one of the nine in `src/types/content.ts` `LIBRARY_CATEGORIES`:
  Deadlines, Trust Contests, Will Contests, Undue Influence & Capacity,
  Trustees & Fiduciaries, Elder Financial Abuse, Probate Process, Business
  Disputes, Technology & the Law. The last one holds the nine pre-redesign
  posts and the AI glossary; it is never featured or previewed.
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
  generate `public/images/library/<slug>.webp` (1200×675, maroon gradient by
  category, title in Newsreader, also the article's OG image), then build.
- Practice page prose: `content/practice/<slug>.md`, at least three `## `
  sections; headings become sidebar anchors.

## Pages (every URL has a trailing slash)

- `/` home, in the order a worried family member needs: hero, deadline band,
  problem cards, attorneys strip, how we work, results, library preview, FAQ,
  where we practice, contact band. A sticky call bar on mobile.
- `/trust-litigation/` hub + `/trust-contests/`, `/will-contests/`,
  `/undue-influence-and-capacity/`, `/breach-of-fiduciary-duty/`,
  `/trust-accounting-disputes/`, `/estate-property-disputes/`,
  `/financial-elder-abuse/`, `/business-disputes/`. One template
  (`components/practice/PracticePage.tsx`), each route file is five lines.
- `/attorneys/` + `/attorneys/<slug>/` for `arthur-rothrock`, `gerry-lin`,
  `jonathan-joannides`, `max-discher`.
- `/about/`, `/how-long-do-i-have/` (the wizard, ends in the contact form),
  `/library/` (search + category chips, `?category=&q=` synced to the URL) +
  `/library/<slug>/`, `/faq/`, `/service-areas/`, `/contact/`,
  `/contact/thank-you/` (noindex), `/privacy-policy/`, `/disclaimer/`.
- Generated: `/sitemap.xml`, `/robots.txt` (AI crawlers allowed explicitly),
  `/llms.txt`, `/library/index.json`, `/404.html`.
- Redirect stubs: every key in `src/config/redirects.ts` (old Wix paths,
  retired app pages, `/post/<slug>/` and `/post/<oldSlug>/`) exports through
  `src/app/[...legacy]/` as a meta-refresh page with a canonical to the target
  and `noindex`. Moving a page means adding its old URL there.

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
- No street address, ever. The office is "San Jose, California" by appointment
  and video; only the probate courthouse has an address on the site.
- Legion appears only as Arthur's credential ("co-founder and CEO of Legion,
  an AI litigation platform"). Never sell it, never address other lawyers.
- Every page ends in the footer compliance line: attorney responsible for the
  site, city, "Attorney advertising" (Rule 7.2(c); Bus. & Prof. Code
  § 6157.2(b)). Articles, practice pages, and the wizard carry the disclaimer.

## Gotchas

- Never run `next build` in `~/projects/rothrocklegal-site` (the editor's
  checkout). Build in a git worktree: `git worktree add
~/projects/rothrocklegal-site-wt/<name> -b <branch> <base>`.
- The shell can leak `NODE_ENV=production`, which breaks `npm install` and
  `next build`. Prefix both with `env -u NODE_ENV`.
- The editor's checkout must keep dev dependencies installed (Tailwind,
  TypeScript, sharp). A production-only install blanks the preview.
- AGENTS.md must stay a symlink to CLAUDE.md (the editor copies symlinks
  verbatim on deploy; a real file would drift).
- Meta descriptions are capped at build: `pageMetadata()` and the library
  loader throw above 160 chars, `check-seo.mjs` fails a page above 160, and
  `import-articles.mjs` rejects an article above 155.
- `[CONFIRM]` strings are dropped from JSON-LD by design (`verified()` in
  `jsonld.ts`), but they still render on the page inside a draft chip. Clear
  them in config; do not delete the filter.
- `site.replyPromise` and the fee answer in `faq.ts` are bracketed
  placeholders that render visibly until Arthur confirms them.
- `check-links.mjs` requires 30+ HTML files in `out/`; an empty or partial
  export fails loudly on purpose. So does an empty library index.
- Two of the four headshots (`gerry-lin`, `max-discher`) do not exist yet;
  `TeamCard`/`ProfileHero` fall back to initials until the WebP files land at
  `public/images/team/<slug>-800.webp` and `-400.webp`.
