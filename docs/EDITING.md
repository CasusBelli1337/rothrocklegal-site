# Editing and publishing

How Arthur changes the site and what happens when he presses Publish. The
technical conventions are in `CLAUDE.md`.

## The editor

The site is edited through the Armory website editor for Rothrock Legal
(`http://localhost:9080/tools/website-editor-rothrock/`, compose service
`website-editor-rothrock`). It is a split screen: chat with Claude on the
left, a live preview of the site on the right.

- The editor container mounts `~/projects/rothrocklegal-site` as `/repo`.
  Whatever branch is checked out there is what the preview shows and what
  Publish sends live.
- The preview is `next dev` started by the container with `EDITOR_PREVIEW=1`,
  which makes `next.config.mjs` serve the site under the `/_preview` basePath
  behind Caddy. Nothing else should ever run `next dev` or `next build` in
  that checkout.
- Edits are ordinary file changes in the checkout. Claude edits the files,
  Next.js hot-reloads the preview, and nothing is committed until Publish.
- "Update to latest" pulls files that changed on `main` into the checkout
  without touching files Arthur has edited; files changed on both sides are
  kept as Arthur's version and reported so Claude can reconcile them.

## What Publish does

The button reads "Deploy to Production" and asks "Publish to
www.rothrocklegal.com?" before doing anything. On confirm, the editor:

1. **Catches up.** Fetches `origin/main` and brings unedited files in the
   checkout up to date so the deploy contains only Arthur's edits on top of
   the live code. If the live code removed something a page still imports,
   it stops here and says so.
2. **Captures.** Creates a temporary git worktree at `origin/main`, copies the
   checkout's contents into it (skipping `.git`, `node_modules`, `.next`,
   `out`), and drops stray screenshots.
3. **Commits.** Stages everything and commits as
   `chore: Rothrock Legal update via editor`. With no changes it still
   redeploys the current code.
4. **Pushes to `main`.** A plain push of that commit to `origin/main`. This is
   the live branch: there is no staging step and no pull request.
5. **Watches the build.** The push triggers `.github/workflows/deploy.yml`
   (install, `next build`, upload, publish to GitHub Pages). The editor finds
   that run by commit and streams its phases (Committing, Pushing, Building,
   Publishing, Live). The site at www.rothrocklegal.com updates when the run
   finishes, usually within a few minutes.
6. **Records.** The checkout's baseline is advanced to the pushed commit so
   the next edit-and-publish does not mistake this deploy for someone else's
   change.

Two consequences worth holding onto:

- **Publish ships the checked-out branch, whatever it is.** While the
  `redesign` branch is checked out (as it is during the redesign), Publish
  would put the redesign live. Do not press it until the redesign is approved
  and merged into `main`.
- **The build has gates.** A description over 160 characters, an article with
  an em dash or a missing disclaimer, an unknown category, or a broken
  internal link fails the workflow, and the site stays as it was. The editor
  shows the failure; ask Claude to fix it and publish again.

## Before un-drafting an article

Each new article is `draft: true` in its frontmatter. In that state it is on
the site with a "Draft – pending attorney review" tag, search engines are
told not to index it, and it is absent from `sitemap.xml` and `llms.txt`.
Before changing it to `draft: false`, check:

1. **Every citation.** Read the article's verification record (the
   `<slug>-VERIFICATION.md` beside the source article in the redesign
   folder) and confirm each statute and case is right, still current, and
   says what the article says it says.
2. **Every number.** Deadlines, day counts, ages, dollar thresholds. If a
   rule changed since 2026-09-01, fix the article and update `updated:`.
3. **The disclaimer and the CTA.** The article must end with the "Talk to a
   trust litigation lawyer in San Jose" section and the disclaimer paragraph;
   the build enforces both.
4. **No promises.** Nothing that implies an outcome, no "expert" or
   "specialist", awards named exactly as conferred, Legion only as a
   credential.
5. **The meta description** (`description:`) answers the title's question in
   155 characters or fewer, and `excerpt:` reads well on a card.
6. **The cover** exists at `public/images/library/<slug>.webp` and the
   `imageAlt` describes it.

Then set `draft: false`, bump `updated:` to today, and publish. The article
enters the sitemap and `llms.txt` on that build.

The same review applies to the two attorney profiles carrying `[CONFIRM]` and
to the privacy policy and disclaimer pages, which show the draft notice until
their `draft` flag is removed in code.

## Editing without the editor

For structural work (new pages, config changes, anything that needs a local
build), use a git worktree and the checks in `README.md`. Never check out a
different branch in `~/projects/rothrocklegal-site`, never build there, and
push only what Arthur has approved: a push to `main` is a deploy.
