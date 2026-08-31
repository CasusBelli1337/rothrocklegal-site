# rothrocklegal.com — static site

Rothrock Legal's website, rebuilt from Wix as a static Next.js site.

- **Live (temporary):** https://casusbelli1337.github.io/rothrocklegal-site/
- **Canonical (after DNS cutover):** https://www.rothrocklegal.com
- Editorial changes vs. the old Wix site: see [CHANGES.md](CHANGES.md)

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & verify

```bash
npm run typecheck
npm run lint
npm run build      # static export to out/
npm run check-links
```

## Deploy

Every push to `main` deploys automatically via GitHub Actions
(`.github/workflows/deploy.yml`): `actions/configure-pages` (injects the
github.io basePath), `next build`, `upload-pages-artifact`, `deploy-pages`.

**Custom domain:** deliberately not configured yet — DNS still points at Wix.
At cutover: add the custom domain in the repo's Pages settings (which commits a
CNAME), point DNS at GitHub Pages, and keep `site.canonicalHost` as is.

## Content

- Blog posts: `content/posts/*.md` (frontmatter documented in `CLAUDE.md`).
  Old Wix slugs redirect via the `oldSlug` field.
- Site-wide values (phone, email, nav, palette): `src/config/site.ts`.
- Contact + mailing-list forms: set `NEXT_PUBLIC_FORM_ENDPOINT` (see
  `.env.example`) to a Formspree-compatible endpoint; without it, submissions
  open a prefilled email to the firm.
