# rothrocklegal.com

The website of Rothrock Legal, a trust and estate litigation firm in San Jose,
California. A static Next.js 15 site: trust and will contests, undue influence,
trustee disputes, elder financial abuse, a plain-English "how long do I have"
deadline wizard, and a library of articles for families.

- **Live:** https://www.rothrocklegal.com
- **Branch `redesign`:** the 2026-09-01 redesign, not yet merged to `main`.
  What changed and why: [CHANGES.md](CHANGES.md).
- **For agents and developers:** [CLAUDE.md](CLAUDE.md) (conventions, content
  schema, gotchas), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (data flow),
  [docs/EDITING.md](docs/EDITING.md) (how Arthur edits and publishes).

## How it deploys

Every push to `main` runs `.github/workflows/deploy.yml`: `npm ci`,
`next build` (static export to `out/`), upload, and publish to GitHub Pages,
which serves the custom domain. There is no staging site; `main` is live.

Arthur normally publishes through the Armory website editor, whose Publish
button commits the checkout, pushes to `main`, and watches that workflow run.
See `docs/EDITING.md` before pressing it.

## Running the checks locally

Work in a git worktree, never in `~/projects/rothrocklegal-site` (the editor's
live checkout). The shell can leak `NODE_ENV=production`, so strip it:

```bash
env -u NODE_ENV npm install
npm run lint
npm run typecheck
npm test
env -u NODE_ENV npm run build      # static export to out/
npm run check-links                # broken internal links in out/
node scripts/check-seo.mjs         # h1, title, description, canonical, JSON-LD, sitemap
```

## Where content lives

- Articles: `content/library/<slug>.md` (frontmatter schema in `CLAUDE.md`).
  New articles are imported with `node scripts/import-articles.mjs` and get
  covers from `node scripts/make-covers.mjs`. `draft: true` keeps an article
  out of search engines until it is cleared.
- Practice page prose: `content/practice/<slug>.md`; the structured parts
  (headline, deadline, statutes, FAQ) in `src/config/practice/<slug>.ts`.
- Attorneys: `src/config/team/<slug>.ts`, headshots in `public/images/team/`.
- Firm facts, navigation, footer, palette: `src/config/site.ts`.
- Old URLs: `src/config/redirects.ts` (every retired URL keeps a redirect page).

## Contact form

The form posts to `NEXT_PUBLIC_FORM_ENDPOINT` (a Formspree-compatible
endpoint; see `.env.example`) when it is set. When it is not, which is the
current state, submitting opens a prefilled email to the firm with the two CC
addresses from `site.formCc`, so a message is never lost to a dead button. The
deadline wizard prefills the same form with the visitor's answers and dates.
