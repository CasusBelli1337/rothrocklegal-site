# rothrocklegal-site

## What This Is

Static rebuild of **rothrocklegal.com** — Arthur Rothrock's law-firm website,
migrated off Wix. Next.js 15 App Router + TypeScript strict + Tailwind CSS 4,
exported with `output: 'export'` and deployed to GitHub Pages by CI.

The content is a faithful reproduction of the Wix site (source of truth:
`~/projects/rothrock-legal/reference/wix-capture/`, read-only). Every
deliberate editorial change is logged in `CHANGES.md` — keep that discipline
for future edits: **never silently change the wording of Arthur's copy.**

## Commands

- `npm run dev` — dev server
- `npm run build` — static export to `out/`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run check-links` — crawls `out/` for broken internal links (run after build)

NOTE (this rig): the shell can leak `NODE_ENV=production` — install with
`NODE_ENV=development npm install --include=dev`.

## Architecture

- `src/config/site.ts` — **all site-wide values** (firm name, phone, email,
  nav, social, palette, canonical host). Change details here, not in components.
- `src/config/redirects.ts` — old Wix URL → new URL map. Old URLs export as
  meta-refresh stub pages via `src/app/[...legacy]/`.
- `content/posts/*.md` — the 9 blog posts (frontmatter: title, date, oldSlug,
  category, image, readTime, excerpt). `oldSlug` also generates a redirect stub
  under `/post/<oldSlug>/`. Adding a post = adding a file (update the count
  check in `src/lib/posts.ts`).
- `content/glossary.md` — AI Terminology entries, one `Term: definition`
  paragraph each.
- `src/lib/` — post/glossary loaders + a tiny markdown renderer (no deps).
- `src/components/` — chrome, forms, and per-page section components.

## Conventions

- Two maroons are intentional: `#66043D` (bands/footer) vs `#672C44`
  (buttons/cards) — captured drift from Wix, preserved deliberately.
- Fonts: Raleway (headings), Open Sans (body), EB Garamond (serif accents),
  Jost (testimonials, substituting Wix-licensed Futura LT Light).
- Images live in `public/images/` (web-optimized WebP). Reference them through
  `asset('/images/...')` from `src/config/site.ts` — plain string srcs don't
  get the GitHub Pages basePath otherwise.
- Internal links: relative/`next/link` only. Do NOT hardcode a basePath — CI's
  `actions/configure-pages` injects it for the github.io project URL.
- No CNAME / custom domain until DNS cutover from Wix (deliberate).

## Deploy

Push to `main` → `.github/workflows/deploy.yml` builds and publishes to GitHub
Pages: https://casusbelli1337.github.io/rothrocklegal-site/
Canonical host after cutover: https://www.rothrocklegal.com (already set in
`site.ts`; the sitemap uses it).

Contact/mailing-list forms POST to `NEXT_PUBLIC_FORM_ENDPOINT`
(Formspree-compatible; see `.env.example`). When unset they fall back to a
prefilled `mailto:` — never a dead button.
