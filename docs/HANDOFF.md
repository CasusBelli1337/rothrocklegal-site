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
- Gates on `redesign`: lint, typecheck, 205 Vitest tests, static export
  (94 HTML), `check-links` (34 stubs one hop, 0 broken), `check-seo`,
  `check-lens` (15 slot groups, no preview-tool traces), axe 0 violations.
- What the site is: T&E litigation firm site for beneficiaries AND trustees,
  11 practice pages, 4 attorney profiles (order Arthur, JJ, Gerry, Max;
  titles verified), the deadline wizard, the library (31 articles: 21 new
  drafts + 9 legacy + glossary), the consult-request intake flow, privacy
  policy + disclaimer (cleared by Arthur 2026-09-02), the lens
  (trustee/beneficiary framing, `docs/LENS.md`, preview switcher pill). The
  Legion v. United States block on About, and the homepage pointer to it, were
  removed by Arthur on 2026-09-02 (evening): show, don't tell. Arthur's Legion
  credential sentence stays.

## Mobile pass (2026-09-02, branch `redesign-mobile` merged into `redesign`)

Researched current mobile best practices (checklist with sources in
`~/projects/rothrock-legal/qa/mobile/mobile-best-practices.md`), audited every
page at 320 to 430 px with Playwright and Lighthouse mobile, and fixed what
fell short: fonts (Newsreader without the opsz axis, italic on demand: 302 KB
to 88 KB preloaded), a `<picture>` hero with phone crops, the reveal motion no
longer gated on hydration, the consult page's CLS, 44 px tap targets
(`tap-row` / `tap-link` utilities), smaller headline floors on phones, menu
sheet scroll lock and focus trap, safe-area insets, the consult bar hiding
while typing, `theme-color` and `format-detection`. Lighthouse mobile went
from 75 to 82 to 92 to 98; LCP from 5 to 8 s to 2.4 to 3.3 s; CLS 0 on every
audited page. Details, before/after table, and how to re-run the audit:
`docs/MOBILE.md`. QA evidence (scripts, results, 390 px screenshots):
`~/projects/rothrock-legal/qa/mobile/`.

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
- NAMESERVERS SWITCHED 2026-09-02 about 6:45 PM PT (Arthur asked to go
  early; Spaceship had already stopped signing, so the DNSSEC wait added
  nothing). Cloudflare zone ACTIVE; site 200, apex 301, MX/SPF/DKIM/DMARC
  identical; `https://intake.rothrocklegal.com/api/intake/health` answers
  through the tunnel; admin routes 404 at the edge. DNSSEC re-enabled on
  Cloudflare (key tag 2371, algorithm 13) and its DS record registered at
  Spaceship (corrected once from algorithm 8 to 13 within a minute).
  Spaceship's old servers still serve the old records, so resolvers holding
  the old delegation keep the site and email working; they only lack the
  new names (intake, portal) until they refresh (usually under an hour,
  worst case 48 h). The redesign is still NOT merged to `main`; that is
  Arthur's go-live call, separate from DNS.
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

## The Rothrock Legal lawyer portal (PHASE 1 BUILT 2026-09-02)

Spec approved with Arthur's decisions (light palette, `RLM-YYYY-NNN`,
firm-owned Postgres 17 holding `portal` + `intake`):
`~/projects/rothrock-legal/portal/PORTAL-SPEC.md` + `PORTAL-WORKFLOW.md`.
Repo `~/projects/rothrocklegal-portal`, GitHub `CasusBelli1337/rothrocklegal-portal`
(private, CI green). Its `CLAUDE.md` and `docs/HANDOFF.md` are the entry
points for sessions opened there. Built and verified live on 2026-09-02:
login with forced password change, intakes (read-through on the moved intake
schema), suggestions that never group on their own, potential clients with
parties, notes, activity, OneDrive folders, matters with the five subfolders
and intake document copies, nightly backup with a passed restore drill,
folder reconcile, jobs screen. Stack: `docker compose up -d` in the repo,
UI at http://127.0.0.1:9090. The intake database now lives in
`rothrock-postgres` (127.0.0.1:5434); the old copy on `legion-postgres` may
be dropped after 2026-10-02.

ACCESS DECISION (Arthur, 2026-09-02 evening): the portal is reached at
`https://portal.rothrocklegal.com` through the same Cloudflare Tunnel, with
Cloudflare Access enforcing Google Workspace sign-in (`@rothrocklegal.com`)
at the edge. Tailscale is NOT the path for colleagues (Serve is still on as
a stopgap; turn it off with `tailscale serve --https=443 off` once Access
works). Done today: Zero Trust organization `rothrocklegal.cloudflareaccess.com`,
Google identity provider (OAuth client in Google Cloud project
`rothrock-portal-sso` under arothrock@), tunnel ingress rule
`portal.rothrocklegal.com -> rothrocklegal-portal-caddy-1:80`, proxied
CNAME `portal`, the site footer link "Attorney Portal" (commit db42b7a on
`redesign`), and the portal code that trusts the Access identity (see the
portal handoff). DONE after the switch: Access application "Rothrock Legal portal" (policy:
allow emails ending in @rothrocklegal.com, session 24 h), `ACCESS_TEAM_DOMAIN`
and `ACCESS_AUD` set in the portal env, API restarted with Access on,
Tailscale Serve turned off. Verified through Cloudflare by IP: HTTPS good and
an unauthenticated request is redirected to the Access sign-in. Still owed:
one real Google sign-in from a browser whose resolver already sees the new
delegation (the rig's Windows resolver still cached the old one at 7:10 PM),
then Arthur opens https://portal.rothrocklegal.com or the footer link.

## TODO (in order)

1. DONE 2026-09-02: SEO API check (`redesign/SEO-API-CHECK.md`; 23 pages
   changed, commit 747e821). Open judgment calls in its section 4.
2. DONE 2026-09-02: Rothrock prompt set (`redesign/PROMPTS-ROTHROCK.md`,
   1,683 lines, 11 prompts). Note: the local engine still holds the
   pre-tuning prompt rows; the tuned V4/V5 text lives in the seed file.
   Arthur reviews the articles closely next.
3. Google Business Profile: created; Arthur's video verification, then
   step 6 (above).
4. DONE 2026-09-02: nameserver switch, DNSSEC on Cloudflare, Access app.
   Remaining: Arthur's go-live decision (merge `redesign` to `main`).
5. Clear article drafts as Arthur reads them; the review reports
   (`ARTICLE-REVIEW.md`, `ARTICLE-REVIEW-TRUSTEE.md`, `PRACTICAL-LAW-CHECK.md`,
   `westlaw-check/WESTLAW-KEYCITE.md`) list the per-article judgment calls.
6. DMARC step-up to `p=quarantine` after ~2–3 weeks of clean reports
   (fixed 2026-09-01; reports arrive at arothrock@). Note the DMARC record
   now lives on Cloudflare once the nameservers switch.
7. Portal: first real Google sign-in check; confirm Max's email; Arthur's first 15 minutes (portal handoff); phase 2 per the spec.

## Where things are

- Spec + dossiers: `~/projects/rothrock-legal/redesign/` (CONTRACTS.md is
  the shared rulebook; HANDOFF.md there is the fuller session log).
- Team dossier and headshot sources: `~/projects/rothrock-legal/team/`,
  OneDrive `#RothrockLegal/Website/Team Headshots/` and `Website/Logo/`.
- QA evidence: `~/projects/rothrock-legal/qa/`.
- Build worktrees: `~/projects/rothrocklegal-site-wt/` (disposable).
- Editor module site profile: `legion-armory/modules/legion-website-editor/
site-profiles/rothrock.md` (rebuild the container after changes).
