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
- DNS moves to Cloudflare (decided 2026-09-02 for the intake tunnel; the
  registrar stays Spaceship). Records are already copied; only the
  nameserver switch remains (see "Intake API" below).
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

## Intake API – hosting (DECIDED 2026-09-02: Cloudflare Tunnel) and durability

- Module: `~/projects/legion-armory/modules/legion-intake` (port 3038;
  public `/api/intake/*` via the Armory Caddy on localhost:9080; admin at
  `/tools/intake/`; Opus 5 single-pass evaluation; key
  `ROTHROCK_INTAKE_ANTHROPIC_API_KEY` in the Armory `.env`).
- Durability (built 2026-09-02): OneDrive mirror per intake, 15-minute
  reconcile with count verification, nightly `pg_dump` to
  `Potential Clients/_backups/`, red admin banner on any failure. See the
  module README "Durability and backups".
- Public ingress BUILT 2026-09-02, option (a) Cloudflare Tunnel, per the
  runbook in the module's `docs/HOSTING-OPTIONS.md` "Decision and runbook":
  Cloudflare zone `rothrocklegal.com` (account arothrock@, all Spaceship
  records copied, GitHub Pages records DNS-only), tunnel `rothrock-intake`
  healthy from the Armory `cloudflared` service, ingress exposes only
  `/api/intake/*` at `https://intake.rothrocklegal.com` (admin routes 404 at
  the edge). `deploy.yml` already builds with
  `NEXT_PUBLIC_INTAKE_API=https://intake.rothrocklegal.com`.
- STILL PENDING (one step, timed): DNSSEC was disabled at Spaceship on
  2026-09-02 about 1:25 PM PT; the registry DS record had a 24-hour TTL.
  On or after 2026-09-03 1:30 PM PT, change the nameservers at Spaceship to
  `kami.ns.cloudflare.com` and `rocco.ns.cloudflare.com`, verify
  `https://intake.rothrocklegal.com/api/intake/health` and that
  www.rothrocklegal.com and email still work, then re-enable DNSSEC on
  Cloudflare and paste its DS record into Spaceship. Until then the live
  consult page keeps the email fallback.
- SMTP DONE 2026-09-02: Google Workspace app password on arothrock@ via the
  git-ignored `data/keys/intake-smtp.conf`; real test send succeeded.
  Notifications from the September 1 test intakes stay "pending" (there is
  no retry endpoint); new submissions email the team.
- Accounts and secrets created today: `~/projects/rothrock-legal/redesign/
ACCOUNTS-2026-09-02.txt` (copy in OneDrive `#RothrockLegal/Website/`).

## Google Business Profile (created 2026-09-02, verification pending)

- Profile "Rothrock Legal" exists under arothrock@rothrocklegal.com
  (location id 14516233535435613881), primary category Estate litigation
  attorney, service-area business with no public address, 20 service areas,
  phone (408) 420-7034, website, hidden mailing address 500 Race St Apt 5416.
- Google offers ONLY video verification. Arthur records it (script in
  `redesign/GBP-IDENTITY-KIT.md` section 8). Do not edit the profile until
  it is verified; then complete step 6 of `GBP-LOCAL-SEO.md` (description,
  services, Q&A, photos, hours, appointment link) from the identity kit.
- Legion audit: none of Arthur's four signed-in Google accounts owns any
  Business Profile and a web search shows no Legion knowledge panel, so no
  conflicting listing was found.

## Next project: the Rothrock Legal lawyer portal (BUILD STARTED 2026-09-02)

Spec APPROVED with Arthur's decisions (light palette, `RLM-YYYY-NNN`,
current tailnet, firm-owned Postgres 17 holding `portal` + `intake`):
`~/projects/rothrock-legal/portal/PORTAL-SPEC.md` + `PORTAL-WORKFLOW.md`.
Repo `~/projects/rothrocklegal-portal` (GitHub `CasusBelli1337/rothrocklegal-portal`,
private). Its own `CLAUDE.md`/`docs/HANDOFF.md` are the entry points for
sessions opened there; this file only records that it exists.

## TODO (in order)

1. DONE 2026-09-02: SEO API check (`redesign/SEO-API-CHECK.md`; 23 pages
   changed, commit 747e821). Open judgment calls in its section 4.
2. DONE 2026-09-02: Rothrock prompt set (`redesign/PROMPTS-ROTHROCK.md`,
   1,683 lines, 11 prompts). Note: the local engine still holds the
   pre-tuning prompt rows; the tuned V4/V5 text lives in the seed file.
   Arthur reviews the articles closely next.
3. Google Business Profile: created; Arthur's video verification, then
   step 6 (above).
4. Intake ingress: nameserver switch on 2026-09-03 (above), then merge
   `redesign` to `main`.
5. Clear article drafts as Arthur reads them; the review reports
   (`ARTICLE-REVIEW.md`, `ARTICLE-REVIEW-TRUSTEE.md`, `PRACTICAL-LAW-CHECK.md`,
   `westlaw-check/WESTLAW-KEYCITE.md`) list the per-article judgment calls.
6. DMARC step-up to `p=quarantine` after ~2–3 weeks of clean reports
   (fixed 2026-09-01; reports arrive at arothrock@). Note the DMARC record
   now lives on Cloudflare once the nameservers switch.
7. Portal phase 1 build (see the portal repo's handoff).

## Where things are

- Spec + dossiers: `~/projects/rothrock-legal/redesign/` (CONTRACTS.md is
  the shared rulebook; HANDOFF.md there is the fuller session log).
- Team dossier and headshot sources: `~/projects/rothrock-legal/team/`,
  OneDrive `#RothrockLegal/Website/Team Headshots/` and `Website/Logo/`.
- QA evidence: `~/projects/rothrock-legal/qa/`.
- Build worktrees: `~/projects/rothrocklegal-site-wt/` (disposable).
- Editor module site profile: `legion-armory/modules/legion-website-editor/
site-profiles/rothrock.md` (rebuild the container after changes).
