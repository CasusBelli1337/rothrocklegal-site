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
- Gates on `redesign` (after Wave A, 2026-09-03): lint, typecheck, 262 Vitest
  tests, static export (95 HTML), `check-links` (34 stubs one hop, 0 broken),
  `check-seo`, `check-lens` (15 slot groups, two boot scripts, no preview-tool
  traces), axe 0 violations, Lighthouse mobile a11y 100.
- What the site is: T&E litigation firm site for beneficiaries AND trustees,
  11 practice pages, 4 attorney profiles (order Arthur, JJ, Gerry, Max;
  titles verified), the deadline wizard, the library (22 articles: 21
  drafts + the glossary; the nine legacy posts were retired 2026-09-03), the consult-request intake flow, privacy
  policy + disclaimer (cleared by Arthur 2026-09-02), the lens
  (trustee/beneficiary framing, `docs/LENS.md`, preview switcher pill). The
  Legion v. United States block on About, and the homepage pointer to it, were
  removed by Arthur on 2026-09-02 (evening): show, don't tell. Arthur's Legion
  credential sentence stays.

## 2026-09-03 (late afternoon): phone gone, icon header, library reset, About page, the caregiver article

Four commits on `redesign`: a569c0f (caregiver-marriage article + practice
section), 410a848 (library: deep covers, nine placeholders retired, dates
2022 to 2026), 1d58975 (About page "AI is in this firm's DNA", recognition
tiles, attorneys page), d1b775f (no phone, AA icon alone, deep maroon on every
filled surface; CLAUDE.md updated in the same commit), plus this docs commit.
Nothing pushed; `main` and the live site are unchanged.

### Arthur's notes, applied

- **No phone number anywhere.** `site.phone`/`phoneE164` deleted with every
  use (footer, contact band, legal pages, accessibility page, JSON-LD
  `telephone`, llms.txt). `PhoneIcon` deleted. `formatDetection.telephone:
  false` stays. The Google Business Profile still lists a number; that is
  outside the site.
- **Header.** The reading-options control is the 44px AA icon only
  (`ReadingOptionsButton`, `aria-label` "Reading options"); the header row is
  back on the normal `Container`, desktop nav from `xl` with `gap-4`, and while
  a text-size choice is active the desktop nav starts at `2xl` so the larger
  labels never wrap. Nav labels moved from `text-[15px]` to `text-ui`.
- **Deep maroon on every fill.** `maroon-700` is now text, links, and thin
  borders only: the practice sidebar "Worried about a deadline?" callout and
  the library `WizardCard` use `band-maroon`; the mobile consult bar, filter
  chips, reading-option chips, intake pressed states, mic button, and wizard
  progress bar use `maroon-900`. Guard grep in CLAUDE.md Palette.
- **Library.** Covers regenerated between maroon-800 and maroon-950 (they were
  the "almost pink"; the hero band was already deep). The nine 2022 to 2024
  Technology & the Law placeholders and their stock images are deleted; the AI
  glossary stays as that category's only article; all old `/post/` URLs land
  on `/library/`. Article dates now run from 2022-02-15 to 2026-08-27, each no
  earlier than the newest law, case, or fact it cites (`articles.test.ts`
  asserts the spread; table in the library agent's report is summarised in
  the commit). Dev-server gotcha added to CLAUDE.md: touch `articles.ts` after
  editing markdown or the preview keeps the old frontmatter.
- **About page.** "How we work" became `AiPractice.tsx`: eyebrow "An
  AI-enabled practice", h2 "AI is in this firm's DNA.", the Legion mark
  (`public/images/partners/legion-logo.svg`, copied from the Branding folder's
  `Logo.svg`, not recolored), two paragraphs, four points. Never "reads every
  page". CLAUDE.md's Legion copy rule carries this one exception.
- **Recognition.** One tile grid on the About page and the profile
  (`team/recognition-tiles.ts`): Super Lawyers, both Best Lawyers badges, Vice
  Chair ABA (aba.webp), Member Inn of Court (seal), Host of The Litigator's
  Path (cover, linked). Badge fields are additive on `member.ts`
  (`TeamRole.badge`, `TeamPodcast.badge`, `membershipBadges`). The attorneys
  page lost the duplicated who-does-what paragraph. Profile eyebrow is now
  "Recognition" / "Awards, roles, and the podcast."
- **Caregiver-marriage article.** `content/library/caregiver-married-my-parent-
  what-california-law-allows.md` (draft, 2026-08-11, Undue Influence &
  Capacity) on AB 328 (Stats. 2019, ch. 10, effective 2020-01-01): Probate
  Code §§ 21380(a)(4), 21382(a), 21611(d), plus the background (Fam. Code
  §§ 2210(c), 2211(c), Prob. Code §§ 1900, 1901, 6401, 21610, 21362, 21366,
  21384, 259, 859; Rice v. Clark; In re Marriage of Greenway). Every section
  was read on leginfo by the writing agent and § 21611(d) re-checked by the
  caller. **No 2024 to 2026 caregiver-marriage enactment exists** (AB 1134,
  Stats. 2025, ch. 633, is a coerced-marriage nullity bill and does not touch
  caregivers); Arthur should confirm the 2020 law is the change he meant. A
  plain-English section and FAQ were added to the undue-influence practice
  page; "needs an expert" there became "calls for medical testimony".

### Left for Arthur

- `legal.effectiveDate` (privacy policy, disclaimer) was not moved although
  the form and phone sentences were removed from both pages.
- `/accessibility/` still offers "a phone call instead of video" as an
  accommodation (no number shown).
- Draft intake sessions named "QA Screenshot" / "Timing Run (QA)" exist from
  today's screenshots and timing; never submitted, no email sent; they purge
  after 30 days or with `purge-qa-data.mjs`.
- Arthur is about to test the intake flow himself.

### Gates (integration worktree at d1b775f)

lint, typecheck, 38 test files / 330 tests, static export, check-links (88
pages, 6,351 references, 0 broken, 0 orphans), check-seo, check-lens (13 slot
groups, boot scripts 199 + 239 bytes, no preview traces).

## 2026-09-03 (afternoon): Arthur's second-round notes, the form retires, the posture pass

Three commits on `redesign`: db6c13d (secondary CTA becomes the wizard; footer
keeps its gradient), 0714d8d (copy notes + the contact form retires), e221432
(the approved posture pass), plus this docs commit. Nothing pushed; `main` and
the live site are unchanged. Preview: `http://localhost:9080/_preview/`.

### Arthur's notes, applied

- **Deadline tile.** "Am I too late?" is the heading (trustee lens: "Have you
  served the Notification by Trustee?"); no eyebrow, no lead. Each clock leads
  with its question, the body follows, and the brass statute citation sits at
  the bottom of the item. Secondary button is "Request a consult" (trustee:
  "Check a deadline"). Slots on `/` are 11; `check-lens` floor is 10.
- **Steps.** Number boxes are square and sit left of the title on one row;
  boxes align across the row (`items-start`, titles `min-h-10`). Step 4: "We
  file in court and keep the case moving. Mediation when it makes sense. Trial
  when it doesn't."
- **How we run your case.** "Records at scale." replaces "Every page gets
  read." (Arthur: never represent that every document is reviewed); the
  about page's software card says "Goes through the bank records" for the
  same reason. The redundant cost line under the section is gone.
- **Library preview** heading: "Answers to common questions." **Service area:**
  "We show up in person when it counts." The " – Probate Division" suffix is
  gone from the court's name everywhere it was a suffix (service-areas config,
  footer, FAQ answer, homepage, /service-areas/); sentence prose that describes
  the division stays.
- **The contact form is gone.** The consult request is the only way in.
  `ContactBand` is now the consult band (heading, lead, button; email, hours,
  what happens next; the phone number left the site later that day). `/contact/` keeps the details
  and the steps. The wizard's results end in "Bring these dates to a consult
  request" with one button. Deleted: `ContactForm.tsx`, `submit-form.ts`,
  `/contact/thank-you/`, `NEXT_PUBLIC_FORM_ENDPOINT`, `site.formCc`,
  `buildSummary`. The intake `Fallback` is an email-us notice. The privacy
  policy and disclaimer no longer mention a form (`legal.effectiveDate` was
  NOT changed; Arthur should decide whether that date moves). Site-wide the
  secondary button is `secondaryCta` = "Check my deadline" (the wizard page
  passes `secondary={null}` to its CtaBand).

### The posture pass (proposal items 1, 2, 4 to 12; item 3 declined)

- Radius tokens are 0 in `@theme` and every `rounded-*` utility was swept out
  of `src` (`rounded-full` survives only on spinners, the recording dot, and
  the preview lens pill). `wizard.css` lost its radii.
- Brass photo corners frame the practice-page `DeadlineCallout` (no top rule).
- Buttons: primary `maroon-900`, hover `maroon-950`; secondary `border-2`.
- Chips are hairline rectangles; the hero's five chips run as a full-width row
  under the two-column grid (3 + 2 at lg).
- `DecoRule` (3px over 1px brass, 4.5rem) under every `SectionHeading`.
- Photos and avatars are square; team cards and the profile portrait carry an
  offset brass keyline; the hero photo has a 12px offset keyline.
- Hover: `border-ink`, no shadow, no zoom (cards, library cards, nav panel).
- Testimonials: brass left bar, no curly quote.
- Display and h1 at weight 600, tracking -0.02em; nav labels `font-semibold`.
- `grid-hairline` at 7% ink.
- **The reveal animation is removed entirely**: `Reveal.tsx`, its test, the
  `[data-reveal]` CSS, and all 27 wrappers (unwrapped to plain `div`s or
  removed). Sections render static.
- Declined: the bands keep `band-maroon`; the footer uses `band-maroon-deep`
  (dark at the top so the CTA band above it meets it without a seam).

### Gates (integration worktree at e221432)

lint, typecheck, 36 test files / 321 tests, static export, check-links (96
pages, 6,971 references, 0 broken, 0 orphans), check-seo, check-lens (13 slot
groups, boot scripts 199 + 239 bytes, no preview traces).

## 2026-09-03 (midday): Arthur's homepage notes, header, footer, fast mode

Six commits on `redesign` (25f1f84, 4cd544b, 0f47191, 1213c17, ba3e470,
4c4dc1f) plus this docs commit. Nothing pushed; `main` and the live site are
unchanged. Preview: `http://localhost:9080/_preview/`.

### What changed on the site

- **Header.** The sand "Reading options" strip is gone. The control is the last
  item of the main nav after "About" (a button), and below `xl` a 44px AA icon
  button beside the menu button. Both open the same inline bar under the nav
  row, inside the sticky header, in flow. The desktop nav starts at `xl`
  (1280); 1024 to 1279 gets the compact row (logo, consult button, AA icon,
  menu). (Later that day the label went and the control became the AA icon
  alone, so the 85rem header column was reverted to the normal `Container`.)
- **Hero chips.** The Santa Clara County chip is gone. Vice Chair chip carries
  the ABA mark; new "Member, Honorable William A. Ingram American Inn of Court"
  chip with the Inn's seal; new "Host, The Litigator's Path podcast" chip
  linking to https://legion.law/podcasts (verified 200; `podcast.url` in
  `arthur-rothrock.ts` now points there). Icons in `public/images/badges/`
  (`aba.webp`, `american-inns-of-court.webp`, `litigators-path.webp`), adapted
  from `#Legion/Marketing/Announcements/2026 ABA AI & Robotics Institute
  Sponsorship` and the podcast cover. At 1280 the five chips stack one per row
  (each label is wider than half the text column); the posture proposal's chip
  item is the moment to relayout them.
- **Proof strip removed** (`ProofStrip.tsx`, `proof-points.ts`, `priorFirm`
  deleted). Arthur's team-card line is now "Co-founder and CEO of Legion, an AI
  litigation platform": no year counts for Arthur anywhere on the site. His bar
  admission year still shows on his profile as the license line.
- **Deadline tile rebuilt** (`DeadlineBand.tsx`, `deadline-cards.tsx`,
  `ui/PhotoCorners.tsx`). One square white tile held by brass photo-album
  corner mounts. Neutral/beneficiary: "Did you get a notice from the trustee?",
  three clocks (trust contest § 16061.8 with a "What counts as notice?"
  `<details>`, will contest §§ 8250/8270, one year from death CCP §§ 366.2/
  366.3), a "Think you might already be late? Talk to us anyway." teaser, then
  "Check my deadline" and a secondary button (later that day: "Request a consult"). Trustee:
  "Have you served the Notification by Trustee?", the notice (60 days, with a
  "What has to be in it?" list), the trust copy (§§ 16061.5, 16061.8), and
  accountings (§§ 16062, 16460). Every sentence traces to `rules*.ts`,
  `RULES.md`, `TRUSTEE-RULES.md`, or the notice article. Six deadline slots;
  `check-lens` floor for `/` is 12 (13 observed). HOMEPAGE-SPEC §2 in the
  redesign folder was rewritten to match.
- **"The cases we take" panel and the two complex-estates lines** under the
  problem cards are gone (`CasesWeTake.tsx`, `complexLine` slot deleted).
- **What to expect** is the four steps only, four across on `lg`
  (`HowWeWorkSteps layout="grid"`; `/contact/` keeps the list). Step 4 no longer
  names a court. **New section "How we run your case"**
  (`HowWeRunYourCase.tsx`): who does what (three rows, names linked) and why it
  costs less and moves faster (three points; the Legion sentence stays as the
  `why-faster-lead` slot, trimmed of the drafting clause the second point now
  carries).
- **Footer and CTA band** are one flat `bg-maroon-950` block with a single
  hairline seam (Arthur: not two purple tiles). `band-maroon` still gradients
  the heroes; the posture proposal covers those.

### Fast mode and the intake wait copy

- The dedicated intake key's Anthropic org has no fast-mode allowance; the
  default `ANTHROPIC_API_KEY` org does. Armory `docker-compose.yml` now
  substitutes `ROTHROCK_INTAKE_ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}` for the
  intake service (Armory commit 09c9418 on `program/phase2-intake-module`, not
  pushed). No `.env` was edited (the secrets guard blocks that, correctly). The
  container was recreated and logs `model claude-opus-5 fast`; a test call was
  served `speed: fast`.
- Measured one real text-only evaluation: **41 s** (was 124 s standard). Draft
  RL-2026-000021 (`timing.run.qa@example.com`) was never submitted, so no email
  went out; it purges after 30 days or with `purge-qa-data.mjs`. Copy now says
  "a minute or two"; `STEP_MINUTES.review` is 2.

### The visual-posture proposal (awaiting Arthur)

Arthur asked for a proposal to make the site read firmer and more geometric
(art deco, hard angles, no rounded tiles) without touching copy or palette.
Delivered as an artifact page with live before/after specimens
(https://claude.ai/code/artifact/6590f0d2-c3c4-4d78-8b28-b027b323678c) and a
Word copy at `#RothrockLegal/Website/Rothrock Legal - Visual Posture Proposal
(2026-09-03).docx`. Twelve numbered items in three passes; he answers with the
numbers. Nothing from it is implemented beyond the deadline tile's corners and
the flat footer block, which he asked for directly.

### Gates (integration worktree at 4c4dc1f)

lint, typecheck, 37 test files / 326 tests, static export, check-links (97
pages, 7,032 references, 0 broken, 0 orphans), check-seo, check-lens (13 slots
on `/`, boot scripts 199 + 239 bytes, no preview traces).

## Wave B (2026-09-03): the two emailed-link pages, and the Wave A review fixes

Branch `program/wave-b-site` (commits d380a88, 27a2b7c, cb09eb7), fast-forwarded
into `redesign` (this checkout) on 2026-09-03 at about 2:00 AM PT. Nothing is
pushed and `main` is untouched; the live site is unchanged.

### What changed on the site

- **Two pages a person reaches only from an email.** `/sign/?t=<token>` shows
  the engagement agreement as a PDF (pdf.js, painted page by page with
  "Preparing page 2 of 3"), opens the signature block only once the last page
  has been on screen (or the person presses "I have read it"), takes a typed or
  a drawn signature with the electronic-signature consent, and says "Thank you.
  We received your signature at 2:24 AM." `/schedule/?t=<token>` shows the open
  consultation times in Pacific time (the device's zone under each one when it
  differs), takes name, email, phone, and a note, books the time, and shows the
  Google Meet link with "what to have ready". Both pages are `noindex`, out of
  the sitemap, disallowed in robots.txt, and hidden from the mobile call bar.
- **Where the pages talk to.** `NEXT_PUBLIC_INTAKE_API + /api/intake/public/*`,
  which the Armory intake module passes through to the portal's public service
  (`PUBLIC_UPSTREAM=http://portal-public:4300`). The routes are
  `GET /sign/:token`, `GET /sign/:token/pdf`, `POST /sign/:token`,
  `GET /schedule/:token`, `POST /schedule/:token/book` (`src/lib/public/api.ts`).
  Verified live on 2026-09-03: two clients signed (typed at 390px, drawn at
  1280px) and a consultation was booked and cancelled through the preview at
  `http://localhost:9080/_preview/`, against the real portal.
- **`npm run pdfjs:assets`** copies pdf.js's worker, wasm decoders, and fonts
  into `public/pdfjs/` (git-ignored); `build` and `dev` run it first. The
  editor checkout had it run by hand once after the fast-forward (the editor
  container starts `next dev` directly).

### The Wave A review's follow-ups, applied (decisions made for Arthur)

1. **Privacy.** The contact step's card now says the same thing whether or not a
   request exists under the typed address: "If we already have a request under
   this email address, we just sent that inbox a link to continue it. If not,
   just keep going." Its button reads "Keep going". Nothing on screen tells a
   stranger whether a relative contacted the firm; only the inbox learns the
   answer. (The intake module's lookup reply still carries `found: true|false`
   in the network response; if that should be closed too, the change is in
   `legion-intake`'s lookup route, not the site.)
2. The microphone cards say a link is emailed ("type the same email address
   there and we will email you a link that picks up where you left off"), and
   the blocked-microphone card opens with "Here is how to turn the microphone
   back on in Safari".
3. The review step's minutes include the three-minute evaluation wait
   (`STEP_MINUTES.review` is 4), so "about 5 minutes to go" no longer sits above
   "takes about 3 minutes".
4. The homepage line lifted from the complex-estates page says "the forensic
   accountants and appraisers retained early" (no "experts").
5. The fee line under "After you send" reads "We tell you what it would take
   and what it would cost before any work starts." (no pitch).
6. The phone route's address can break after "com/" (`<wbr>`).
7. The text-field focus ring is maroon-700 (12.7:1 on white, was maroon-500 at
   6.8:1) in `globals.css`, `wizard.css`, the intake and contact form fields,
   and the library search box. Button and card focus outlines were left as
   they were.

### Gates (worktree, 2026-09-03)

lint, typecheck, 37 test files / 327 tests, static export (105 pages),
check-links (97 pages, 7,032 references, 0 broken, 0 orphans), check-seo,
check-lens (258 files, no preview traces). The preview served `/sign/` and
`/schedule/` after `npm install` and `npm run pdfjs:assets` in the editor
checkout.

## Phase 2 and Phase 7 (2026-09-02/03): consult flow v2, reading options, show-not-tell

Three builders worked overnight in parallel and an integrator merged them on
`program/wave-a`, which `redesign` now points at (commits 1dcc8c2 merge,
20bc2f8 palette, 15a4b31 wait copy, plus this doc commit). Nothing is pushed
and `main` is untouched; the live site is unchanged.

### What changed on the site

- **The consult request holds your hand.** Every screen says what comes next
  ("Next: what is going on, in a few taps."), the progress line counts minutes
  ("Step 3 of 8 · about 6 minutes to go"), the Continue button is tall and
  full-width on phones, Back is a text button, and the whole flow reads at 18px.
  Follow-up questions are all optional and say so.
- **The microphone never disappears.** Before asking, the page checks whether a
  microphone exists and whether the browser has blocked it. If blocked, a card
  shows numbered steps for that browser (Chrome, Edge, Safari on Mac, Firefox,
  Safari on iPhone or iPad, Chrome on Android, Samsung Internet) and a Try again
  button. If there is no microphone at all, the card offers the phone route with
  the site address. Recordings go to the server as a `voice-note` file and are
  transcribed there (see the transcriber below); what the browser heard is also
  kept verbatim as `spokenText`.
- **Continue by email.** When someone types an email that already has an
  unfinished request, a card says so and offers "Start fresh". The server emails
  a one-use link (24 hours) to that address; opening it shows "Welcome back" and
  lands on the first unfinished screen. A typed email alone never opens
  anything. Confirmed live: lookup answered `found: true` and the link email was
  recorded as sent.
- **Reading options.** A slim strip above the header with one button opens an
  inline bar: text size, contrast, motion, spacing. Choices persist (localStorage
  `rl-a11y`) and are restored before the page paints. `/accessibility/` carries
  the statement and the same controls; the footer links to it.
- **Show, not tell on the homepage.** A proof strip under the hero (six facts
  from Arthur's config), a one-line proof under each attorney on the team strip,
  "Results" renamed "What clients say", a "The cases we take" block lifted from
  the complex-estates page, and the four headshots as small circles on the
  corners of the deadline card (desktop only, a placeholder until real
  photography exists).
- **Palette.** The pink tints (maroon-50/100/200) are gone everywhere, intake
  included. #66043D stays the one strong color; selected and hovered surfaces
  are sand; callouts are white with a brass rule.
- **Hours** read "Mon to Fri, by appointment. Send a consult request any time."
  The **privacy policy** now names public-records checks, Google Meet and
  Calendar, the firm's signing page, Legion for client files after engagement,
  and the continue-by-email link; effective date September 2, 2026.

### What changed in the intake module (Armory, branch `program/phase2-intake-module`, deployed)

- Opus 5 **fast mode** is requested for every evaluation and falls back to
  standard speed on a 429. Today the key's Anthropic organization has a fast
  mode allowance of zero, so every run falls back. **Arthur: enable fast mode
  for that organization in the Anthropic Console**; nothing else needs to
  change, and `evaluation.attempts[].speed` will read `fast` afterwards.
- A **second evaluation pass** runs after submit when follow-up answers or new
  files arrived; the team email goes out after the final pass. Pass 1 is kept
  under `evaluation.previousPasses`.
- A **transcriber** container (faster-whisper small.en on the GPU) turns voice
  notes into text within seconds; the transcript is in the admin view, the
  evaluation input, and the OneDrive mirror.
- HEIC photos become JPEG on upload. `POST /lookup`, `POST /resume`,
  `POST /:id/resume-link` exist with rate limits (10 lookups per hour per IP,
  3 links per address per day). Details: `legion-armory/modules/legion-intake/README.md`.

### Measured on the deployed module (RL-2026-000018, 2026-09-03 06:04 UTC)

A real three-page PDF, a PNG, and a 6-second voice note, through the Armory
Caddy origin: transcript filled in 3 s; **pass 1 took 124 s** (standard speed,
6,481 tokens in, 9,587 out); **pass 2 took 120 s**; lookup `found: true` with
the resume-link email recorded as sent; submit returned the reference at once;
the team email was recorded 74 ms after pass 2 finished. The site's wait copy
now says "This usually takes about 3 minutes" (rounded up from 124 s). The
three of you received one QA email for RL-2026-000018 titled "QA Wave A
(integration test, ignore)"; RL-2026-000016 and 000017 are also synthetic.

### How to see it

Editor preview `http://localhost:9080/_preview/` (homepage, `/accessibility/`,
`/request-a-consult/`). Try the reading options, then reload. On the consult
page, type an email, tab away, and watch for the started-before card (only when
that email has an open request on the deployed module). Admin queue:
`http://localhost:9080/tools/intake/`. Screenshots: this session's scratchpad
`wave-a-qa-*.png` and `wave-a-site-*.png`.

### What Arthur should look at

1. The team proof lines restate a bio fact, but the wording is the builder's:
   `src/config/team/<slug>.ts` (`proofLine`). (The proof strip itself was
   removed on 2026-09-03 at Arthur's request.)
2. Resolved 2026-09-03: the corner photos became brass photo-album mounts.
3. The high-contrast palette values. (Resolved 2026-09-03: reading options
   moved into the nav row; see the section above.)
4. Resolved 2026-09-03: fast mode runs on the default key; wait copy re-measured.
5. The privacy policy additions naming Google and Legion.

### Not done

- No real-device microphone pass (iPhone Safari, Android Chrome); the browser
  steps were written from the current layouts and simulated in Chromium.
- Fast mode is not serving until the Console change above.
- The mobile menu has no Reading options entry (the strip scrolls away; by
  design, revisit if Arthur wants it reachable mid-page).
- Admin UI additions (pass notices, transcript section) were verified through
  the admin JSON, not screenshotted.
- Nothing pushed; `redesign` to `main` remains Arthur's call.

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
must point at the public intake host (see below) or the consult page shows
the email-us notice; clear article drafts Arthur has read
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
