# Rothrock Legal – project handoff (written 2026-09-02)

Read this first when opening a Claude session in this repo. It records where
the redesign stands, Arthur's standing decisions, and what comes next. The
spec, dossiers, verification logs, and QA evidence live OUTSIDE this repo in
`~/projects/rothrock-legal/` (redesign/, team/, qa/, reference/); the Armory
repo holds the editor module and the intake module.

## State of the site

- Branch `redesign` (this checkout) is the complete redesign, NOT yet on
  `main`, NOT live. www.rothrocklegal.com still serves the 2026-08-31
  Wix-faithful rebuild. Preview: Armory → Rothrock Website Editor
  (`http://localhost:9080/tools/website-editor-rothrock/`; raw preview
  `http://localhost:9080/_preview/`). Never `next build` in this checkout.
- Gates on `redesign`: lint, typecheck, 199 Vitest tests, static export
  (94 HTML), `check-links` (34 stubs one hop, 0 broken), `check-seo`,
  `check-lens` (15 slot groups, no preview-tool traces), axe 0 violations.
- What the site is: T&E litigation firm site for beneficiaries AND trustees,
  11 practice pages, 4 attorney profiles (order Arthur, JJ, Gerry, Max;
  titles verified), the deadline wizard, the library (31 articles: 21 new
  drafts + 9 legacy + glossary), the consult-request intake flow, privacy
  policy + disclaimer (cleared by Arthur 2026-09-02), the lens
  (trustee/beneficiary framing, `docs/LENS.md`, preview switcher pill), the
  Legion v. United States block on About (Legion sued with outside counsel;
  never imply Rothrock Legal litigated it).

## Arthur's standing decisions (do not re-ask)

- Consult request is the primary action; phone is text only (no calls).
- Reply promise: "We strive to respond within one business day."
- Fully remote by default, in person by appointment when the case calls for
  it (this wording exists so a Google Business Profile is legitimate).
- Titles: Arthur "Founder and Trial Attorney", JJ "Of Counsel", Gerry and
  Max "Associate Attorney". Headshots confirmed as likenesses.
- No italic emphasis words in headlines (the `em-word` utility stays for
  the lens text renderer but is unused in H1s).
- HARD RULE: never cite or rely on unpublished decisions or unpublished
  parts of partially published opinions (audit category 13 enforces it).
- No em dashes anywhere. Awards named exactly as conferred. No street
  address ever (San Jose + service area).
- DNS stays at Spaceship for now (flaky host-side, see
  `~/projects/rothrock-legal/reference/dns/spaceship-reliability-2026-09-01/`).
- Data loss is unacceptable; outages are tolerable. The intake API runs on
  Arthur's rig (on battery backup) with every submission mirrored to
  OneDrive `#RothrockLegal/#Clients/Potential Clients/<reference – name>/`.
- No Terms of Use page unless the lawyer portal adds client logins.

## Publish procedure (when Arthur says go)

```
cd ~/projects/rothrocklegal-site
git checkout main && git merge --ff-only redesign && git push origin main
git checkout redesign   # keep the preview serving the branch
```

The Pages workflow deploys in ~2 minutes. Do NOT use the editor's Publish
button for this merge (it squashes). Before go-live: `NEXT_PUBLIC_INTAKE_API`
must point at the public intake host (see below) or the consult page falls
back to the email form; clear article drafts Arthur has read
(`draft: false` in `content/library/<slug>.md`).

## Intake API – hosting and durability

- Module: `~/projects/legion-armory/modules/legion-intake` (port 3038;
  public `/api/intake/*` via the Armory Caddy on localhost:9080; admin at
  `/tools/intake/`; Opus 5 single-pass evaluation; key
  `ROTHROCK_INTAKE_ANTHROPIC_API_KEY` in the Armory `.env`).
- Durability (built 2026-09-02): OneDrive mirror per intake, 15-minute
  reconcile with count verification, nightly `pg_dump` to
  `Potential Clients/_backups/`, red admin banner on any failure. See the
  module README "Durability and backups".
- Public ingress is UNDECIDED. Options are in the module's
  `docs/HOSTING-OPTIONS.md`: (a) Cloudflare Tunnel (needs DNS on
  Cloudflare; no open ports; recommended), (b) router port-forward + a
  dedicated public Caddy with Let's Encrypt + dynamic DNS at Spaceship
  (no third party, exposes the home IP), (c) Cloudflare Workers + R2
  (serverless fallback). Arthur prefers running from the rig; pick (a) or
  (b) with him before go-live. SMTP for notifications is unset; the admin
  page shows pending notifications.

## Next project: the Rothrock Legal lawyer portal

Arthur's plan: an internal portal (an "Armory for Rothrock Legal") whose
first job is organizing and grouping consult submissions, growing into the
tools colleagues need (terminals, timekeeping, matter tools). Suggested
seed: the intake admin UI + the Armory hub pattern (module manifests,
JWT auth, Postgres schema-per-module, Caddy routing). Data model to start
from: Intake → PotentialClient (grouped by parties/decedent) → Matter.
Keep client documents on the rig + OneDrive; no third-party storage.

## TODO (in order)

1. **SEO API check of the articles**: run the content engine's SEO audit
   and keyword tooling (DataForSEO is configured in the engine; see
   `~/projects/rothrock-legal/redesign/PLAYBOOK.md` for the method) over all
   21 new articles and the 11 practice pages; confirm titles/descriptions/
   keywords/headings are optimized for the Bay Area T&E intents in
   `TOPICS.md` and `TOPICS-TRUSTEE.md`; fix in the staging articles and
   re-import (`node scripts/import-articles.mjs`).
2. **Content-engine prompts, Rothrock edition**: read the EC2 content
   engine's tuned prompts (`modules/legion-content-engine/docs/
HANDOFF-LGN-1122-content-tuning.md` and the prompt repository) and
   produce a Rothrock-customized prompt set (family-member audience,
   trustee/beneficiary lenses, Bay Area local terms, the publication rule,
   the audit's 13 categories) as `~/projects/rothrock-legal/redesign/
PROMPTS-ROTHROCK.md`; then Arthur reviews the articles closely.
3. Google Business Profile: hidden-address service-area profile for
   Rothrock Legal from the firm's Google account, after checking Legion's
   profile hides its address; 10-step checklist in
   `~/projects/rothrock-legal/redesign/GBP-LOCAL-SEO.md` (video verification
   needs Arthur).
4. Decide intake ingress (above) and set `NEXT_PUBLIC_INTAKE_API` in
   `.github/workflows/deploy.yml`; configure SMTP or an email service.
5. Clear article drafts as Arthur reads them; the review reports
   (`ARTICLE-REVIEW.md`, `ARTICLE-REVIEW-TRUSTEE.md`, `PRACTICAL-LAW-CHECK.md`,
   `westlaw-check/WESTLAW-KEYCITE.md`) list the per-article judgment calls.
6. DMARC step-up to `p=quarantine` after ~2–3 weeks of clean reports
   (fixed 2026-09-01; reports arrive at arothrock@).
7. Optional: move DNS hosting to Cloudflare (runbook in the DNS report).

## Where things are

- Spec + dossiers: `~/projects/rothrock-legal/redesign/` (CONTRACTS.md is
  the shared rulebook; HANDOFF.md there is the fuller session log).
- Team dossier and headshot sources: `~/projects/rothrock-legal/team/`,
  OneDrive `#RothrockLegal/Website/Team Headshots/` and `Website/Logo/`.
- QA evidence: `~/projects/rothrock-legal/qa/`.
- Build worktrees: `~/projects/rothrocklegal-site-wt/` (disposable).
- Editor module site profile: `legion-armory/modules/legion-website-editor/
site-profiles/rothrock.md` (rebuild the container after changes).
