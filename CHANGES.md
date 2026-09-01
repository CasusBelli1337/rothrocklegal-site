# CHANGES – deliberate changes to rothrocklegal.com

Two logs. The first covers the redesign on branch `redesign` (not live). The
second is the original Wix-migration log for the site that went live on
2026-08-31; it is kept as written.

## Redesign (2026-09-01) – not yet live

Branch `redesign`, built from the specs in the redesign folder (CONTRACTS,
DESIGN-BRIEF, IA, HOMEPAGE-SPEC, SEO-SPEC, LIBRARY-SPEC, DEADLINE-RULES).
Nothing here is on `main` yet; a push to `main` is a deploy.

### Positioning

1. **Repositioned as a trust and estate litigation firm** for San Jose, Santa
   Clara County, and the Bay Area: trust contests, will contests, undue
   influence and capacity, trustee breach and removal, accountings, Probate
   Code § 850 property disputes, financial elder abuse. Business and
   partnership disputes stay as a secondary page (`secondary: true`, last in
   nav and footer).
2. **Everything that marketed Legion to other lawyers is gone**: the "For
   Lawyers, By Lawyers" page and nav item, the Legion three-step band, the
   "What is AI" band, every "Book a demo"/"DEMO" button. Legion now appears
   only as Arthur's credential ("co-founder and CEO of Legion, an AI
   litigation platform") and as the reason the firm's AI-assisted process is
   credible. The AI essays survive in the library (item 15).
3. **Homepage reordered by what a worried family member needs first**: hero,
   deadline band (wizard), problem-led practice cards, attorneys strip, how we
   work, results and client words, from the library, five-question FAQ, where
   we practice, contact band. A sticky call bar on mobile. The old Services /
   Who We Are / Updates / Legion sections are retired.
4. **Credentials updated and named exactly as conferred**: Super Lawyers®
   Rising Stars, Northern California (2020–2026); Best Lawyers: Ones to
   Watch® in America, Commercial Litigation and Litigation – Trusts and
   Estates (2024–2027 editions); Vice Chair, American Bar Association
   Artificial Intelligence and Robotics National Institute. Badges in
   `public/images/badges/`. Every fact traces to the dossier; items the
   dossier could not verify are left out rather than guessed.

### Design system

5. **New type and palette.** Newsreader (headlines, variable, optical sizing)
   and Instrument Sans (everything else) load through `next/font`; Raleway,
   Open Sans, EB Garamond, and Jost are retired. The brand maroon `#66043D` is
   the single primary in a nine-step scale on warm paper (`#F8F5F0`) and sand
   backgrounds with a restrained brass accent; the second maroon `#672C44`,
   the navy, and the gold are retired. Tokens live in `globals.css` `@theme`
   and are mirrored in `site.ts` `palette`.
6. **Real people instead of stock symbols.** Arthur's hero photo, 800 and 400
   px headshots, generated library covers. No gavels, scales, columns, or
   handshakes on the new pages (the legacy posts keep their old images).
7. **Header and footer rebuilt**: five nav items with a problem-led dropdown
   for the practice pages, the phone number, and a "Talk to a lawyer" button;
   a four-column footer (brand, practice areas, resources, courts we appear in)
   over a compliance bar (item 22). The mailing-list form is removed; no list
   is maintained.

### Information architecture and redirects

8. **New URL map.** Practice pages are flat top-level slugs under a
   `/trust-litigation/` hub (`/trust-contests/`, `/will-contests/`,
   `/undue-influence-and-capacity/`, `/breach-of-fiduciary-duty/`,
   `/trust-accounting-disputes/`, `/estate-property-disputes/`,
   `/financial-elder-abuse/`, `/business-disputes/`); hierarchy is expressed by
   breadcrumbs and BreadcrumbList JSON-LD, not nested URLs. New:
   `/attorneys/` + four profiles, `/how-long-do-i-have/`, `/library/` +
   articles, `/service-areas/`, `/contact/thank-you/`. Kept: `/`, `/about/`,
   `/faq/`, `/contact/`, `/privacy-policy/`, `/disclaimer/`.
9. **Retired URLs redirect** (meta-refresh stubs with a canonical to the
   target and `noindex`, from `src/config/redirects.ts`):
   `/news-and-events/` → `/library/`; `/for-lawyers-by-lawyers/` →
   `/library/?category=technology-and-the-law`; `/ip-considerations/` →
   `/library/intellectual-property-considerations/`; `/ai-glossary/` →
   `/library/ai-glossary/`; all nine `/post/<slug>/` and their nine old Wix
   slugs → `/library/<slug>/`; the Wix-era paths (`/home`, `/about-1`,
   `/about-8`, `/contact-7`, `/projects-6`, `/general-5`, `/blog`, the five
   `/blog/categories/*`) retargeted to the new pages. 34 stubs in total.
10. **One `/service-areas/` page** with a section per city (San Jose, Palo
    Alto, Sunnyvale, Mountain View, Cupertino, Los Gatos, Saratoga, Campbell,
    Milpitas, Fremont) and the four courts, rather than per-city pages.
11. **Practice pages from one template** (`PracticePage.tsx`): answer-first
    summary, prose sections from `content/practice/<slug>.md`, a "How long do
    I have?" callout, statutes in plain English, a FAQ accordion (FAQPage
    JSON-LD), related reading, and the disclaimer.

### Attorneys

12. **`/attorneys/` and four profile pages** for Arthur E. Rothrock, Gerry
    Lin, Jonathan "JJ" Joannides, and Max Discher, from
    `src/config/team/<slug>.ts`: bio, bar status (only where verified against
    the State Bar), education, memberships, recognition, talks and press, and
    Person / ProfilePage JSON-LD. Two titles ("Of Counsel", "Associate
    Attorney") are Arthur's call and carry `[CONFIRM]`; those pages show a
    draft chip and are `noindex` until cleared.

### Library

13. **`/library/` replaces `/news-and-events/`**, modeled on legion.law's
    library: a featured article, the wizard card, category chips, and search.
    Search runs in the browser over a build-time `/library/index.json`
    fetched on the first keystroke; chips and query sync to `?category=&q=`
    so deep links work on a static host.
14. **Ten new articles, all `draft: true`** until Arthur reviews them: How
    Long Do You Have to Contest a Trust or Will in California?; How to Contest
    a Trust in California; How to Contest a Will in California; Undue
    Influence in California; Can You Prove Lack of Testamentary Capacity in
    California?; What to Do If a Sibling or Caregiver Steals Your Inheritance;
    How to Remove a Trustee in California; California Trustee Won't Give You
    an Accounting or the Trust?; Elder Financial Abuse in California; Santa
    Clara County Probate Court: How Trust Litigation Works. Each cite was
    checked against the statute text; a verification record sits beside each
    source article. A draft renders with a "Draft – pending attorney review"
    tag, `noindex`, and is left out of the sitemap and `llms.txt`.
15. **The nine pre-redesign posts and the AI glossary** moved into the library
    under "Technology & the Law", copy unchanged, with their old slugs kept
    for redirects and BlogPosting JSON-LD. That category is never featured on
    the homepage or in related reading.
16. **Article template**: hero with cover, reading time and dates, table of
    contents, body, FAQ accordion (FAQPage JSON-LD), author box, related
    articles, wizard card, CTA band, and the disclaimer as the last paragraph.
    Article and BlogPosting JSON-LD carry author, dates, category, and tags.

### The deadline wizard

17. **`/how-long-do-i-have/`**: four to nine plain-English questions (date of
    death, trust or will, trustee's notice, copy of the trust, probate status,
    concerns, and the dates they need). Seven rules, each verified against the
    statute text on 2026-09-01 and recorded in `src/lib/deadlines/RULES.md`:
    trust contest (Probate Code § 16061.8, later of 120 days from service or
    60 days from delivery of the trust), will contest (§ 8270), claims
    against a decedent (CCP § 366.2), broken promise (CCP § 366.3),
    creditor's claim (Probate Code § 9100), financial elder abuse (Welf. &
    Inst. Code § 15657.7), breach of trust (Probate Code § 16460). Weekend and
    court-holiday days roll forward under CCP § 12a using the published 2026
    and 2027 Santa Clara court holidays.
18. **Results** list every deadline that may apply, soonest first, each with
    the statute (linked to leginfo), how the date was computed, and caveats.
    A banner appears when any deadline is within 30 days or has passed.
    Answers persist in the browser so a refresh does not lose them. The page
    ends in the contact form, prefilled with a summary of the answers and
    dates, and carries the disclaimer.

### SEO and AI search

19. **Metadata and JSON-LD on every page.** `pageMetadata()` gives each page a
    title, description (build fails above 160 chars), canonical, OpenGraph,
    and Twitter card. The root layout emits a LegalService + WebSite graph
    (no street address; `areaServed` from `service-areas.ts`; `sameAs` to the
    firm's Super Lawyers and Best Lawyers profiles). Pages add WebPage,
    BreadcrumbList, ProfilePage/Person, Article/BlogPosting, and FAQPage.
    Anything still marked `[CONFIRM]` is filtered out of JSON-LD.
20. **`sitemap.xml`, `robots.txt`, `llms.txt`** are generated from config at
    build. The sitemap carries `lastModified` per page and excludes drafts,
    redirect stubs, the thank-you page, and `index.json`. `robots.txt` allows
    the AI answer engines by name (GPTBot, ClaudeBot, PerplexityBot, and
    others). `llms.txt` lists the practice pages, wizard, attorneys, and every
    published article. The OG card is `/images/og/site.png`; each library
    cover doubles as its article's OG image.
21. **Build gates**: `scripts/check-seo.mjs` (one `<h1>`, title, description,
    canonical, `og:image`, parsable JSON-LD, no em dash, legacy paths are
    stubs, sitemap/robots/llms present) joins `scripts/check-links.mjs`.

### Compliance and forms

22. **Compliance footer line on every page**: "© 2026 Rothrock Legal · Arthur
    E. Rothrock, attorney responsible for this site · San Jose, California ·
    Attorney advertising", with the Privacy Policy and Disclaimer links, the
    results disclaimer ("Every case is different. Past results do not
    guarantee a similar outcome."), and the Super Lawyers trademark line
    (Rule 7.2(c); Bus. & Prof. Code § 6157.2(b)). No "expert" or
    "specialist" wording anywhere; the disclaimer page says so. No street
    address on the site; only the probate courthouse has one.
23. **Testimonials** kept verbatim (Darius, Mark, Tony) and always rendered
    with the results disclaimer. The privacy policy and disclaimer were
    rewritten for the new site (contact form fields, the wizard's local
    storage, no cookies) and still carry the visible draft notice.
24. **Contact form** fields are now name, email, phone, "What happened?", and
    whether a trustee or lawyer has sent a formal notice. Delivery is
    unchanged: `NEXT_PUBLIC_FORM_ENDPOINT` when set, otherwise a prefilled
    email to arothrock@rothrocklegal.com with the two CCs. A successful
    endpoint post lands on `/contact/thank-you/` (noindex).

### Open items that need Arthur

25. Confirm the titles "Of Counsel" (Jonathan Joannides) and "Associate
    Attorney" (Max Discher), then remove `[CONFIRM]` so the profiles index.
26. Confirm the reply-time promise (`site.replyPromise`, shown in brackets on
    the contact band, contact page, thank-you page, and "How we work").
27. Write the fee answer for "What does it cost to contest a trust or will?"
    (`src/config/faq.ts`; the bracketed placeholder is visible on the home
    page and `/faq/`, and is included in the FAQPage JSON-LD as written).
28. Review the ten draft articles against their verification records and flip
    `draft: false` on each one approved.
29. Approve the privacy policy and disclaimer text and drop the `draft` flag
    on those two pages.
30. Supply headshots for Gerry Lin and Max Discher (800×800 and 400×400 WebP
    at `public/images/team/<slug>-800.webp` and `-400.webp`); the pages show
    initials until then.
31. Decide whether to set a form endpoint (`NEXT_PUBLIC_FORM_ENDPOINT`) or
    keep the email fallback.
32. Two code-level loose ends for whoever merges: the sitemap still lists the
    two `noindex` profile pages, and the two draft-flagged legal pages are
    indexable; both go away as items 25 and 29 are cleared, or by filtering
    them in `sitemap.ts`.
33. Approve the merge of `redesign` into `main`; that push is the cutover.

## Wix migration (live since 2026-08-31)

Everything not listed here reproduces the Wix site's content verbatim
(capture of 2026-08-30). Wording of Arthur's real copy was not paraphrased.

## Fixes

1. **"Sevices" typo fixed** → "Comprehensive Legal **Services** for your Needs"
   (home services card title).
2. **"Intellectual Propert Considerations" title-tag typo fixed** → "Property"
   (`/ip-considerations` page metadata; the visible H1 was already correct).
3. **Copyright year** in the footer: 2024 → **2026**.
4. **"Book a Demo" / "DEMO" buttons** pointed at `/book-a-demo`, a dead,
   never-configured Wix Bookings stub. Both now route to **/contact/**.
5. **Google map removed** (contact page): the embedded map was pinned on San
   Francisco while the copy says Silicon Valley. Replaced with a clean
   "Silicon Valley, California" location band ("Serving clients throughout the
   San Francisco Bay Area and beyond." is new supporting copy).
6. **Unconfigured Wix video widget removed** from News & Events ("Video
   Channel Name", "Video Title" ×5, dummy runtimes). Its "Media Coverage"
   section header went with it — the category had zero posts.
7. **Broken sitemap fixed**: the Wix site advertised `/sitemap.xml` but served
   a 404. The rebuild generates a real `sitemap.xml` + `robots.txt`.
8. **Unstyled browser-blue links** and stray Wix rich-text colors (#0000EE,
   #8B0000) are styled to the brand palette.
9. **FAQ question/answer pairing** follows the visually-correct order from the
   live site's screenshots (the Wix DOM emitted Q1's heading out of order).
10. **Phone number display normalized** to "(408) 420-7034" everywhere (the
    Wix contact page showed "(408)420-7034" without the space in one spot).

## Removals (Wix template debris)

11. `/for-lawyers-by-lawyers`: dropped the unedited Wix placeholder blocks —
    the "Every website has a story…" lorem intro, the `123-456-7890` /
    `info@mysite.com` template contact strip, and the social bar that pointed
    at **Wix's own** Facebook/Twitter/Instagram/LinkedIn accounts. A new
    "Keep exploring" section links the AI Glossary and IP Considerations pages.
12. Wix system stubs not rebuilt: `/book-a-demo`, `/book-online`,
    `/booking-calendar`, `/booking-form`, `/service-page`, `/checkout`,
    `/cart-page`, `/thank-you-page`, `/popup-sak5d`, `/search`.
13. Per-post view counters, like buttons, share buttons, and the comment box
    (Wix Blog app features with no static equivalent) were dropped.
14. The floating Wix chat widget and reCAPTCHA were dropped (Wix services).
    Spam protection can come from the form endpoint service when configured.

## Structure / navigation

15. **Renamed pages** (old URL keeps a meta-refresh + canonical redirect stub):
    `/about-1`→`/about`, `/about-8`→`/faq`, `/contact-7`→`/contact`,
    `/projects-6`→`/ip-considerations`, `/general-5`→`/ai-glossary`,
    `/home`→`/`, `/blog`→`/news-and-events`, and all five
    `/blog/categories/*` pages →`/news-and-events`.
16. **Blog post slugs corrected** — every old slug was leftover draft text
    (two were jokes). New slugs derive from the real titles; each old slug
    serves a redirect stub (frontmatter `oldSlug`):
    | Old slug | New slug |
    | --- | --- |
    | ai-and-the-law-navigating-the-minefield-of-emerging-legal-issues | the-legal-landscape-of-ai-commercial-transactions |
    | client-alerts | antitrust-concerns-with-ai-pricing |
    | client-alerts-1 | the-ai-revolution-a-call-to-action-for-lawyers |
    | client-alerts-2 | employment-law-risks-and-considerations |
    | get-jacked-with-ai | data-privacy-compliance-challenges |
    | how-to-train-you-ai-to-be-a-man | intellectual-property-considerations |
    | insights-into-legal-innovation-and-technology | what-is-ai |
    | press-releases | revolutionizing-legal-access-the-journey-of-the-caselaw-access-project |
    | tech-meets-law-stay-updated-with-our-insights | **ai-and-the-law-navigating-the-minefield** |
    The last slug is truncated deliberately: its full title-derived slug is
    byte-identical to the _old_ slug of a different post (The Legal Landscape),
    and the old URL must keep redirecting to the article it always showed.
17. **Orphaned pages surfaced**: "For Lawyers" added to the header nav;
    For Lawyers By Lawyers, IP Considerations, and AI Glossary added to the
    footer Quick Links. (On Wix these pages existed but were linked nowhere.)
18. **The two overlapping blog indexes merged**: `/news-and-events` keeps its
    sectioned layout and gains an "All Posts" archive section carrying what
    `/blog` added (full post list, dates, read times, category labels). The
    "View More…" buttons — which led to the Wix blog app — now jump there.
19. **New draft legal pages** (marked "DRAFT — pending attorney review" in the
    body, noindexed, linked in the footer): `/privacy-policy` and
    `/disclaimer` (CA-appropriate attorney-advertising disclaimer). The Wix
    site had no disclaimer, privacy policy, or attorney-advertising notice.

## Presentation

20. **Testimonials**: Darius keeps his real photo; **Mark and Tony** — gray
    placeholder silhouettes on Wix — get tasteful initial-letter avatars.
21. **Fonts**: Wix-licensed faces can't be reused. Raleway / Open Sans /
    EB Garamond load from Google Fonts as before-equivalents; **Jost**
    substitutes Futura LT Light (testimonial quotes). Georgia/Avenir/Proxima
    appeared only inside Wix widget chrome and are gone with the widgets.
22. **Both captured maroons preserved** per element: #66043D (bands, footer)
    and #672C44 (buttons, cards) — the drift is in the original design and was
    deliberately not unified.
23. Baked-text images (section headings, the Legion 3-step strip, the "Why
    Choose Us" cards, icon rows) were rebuilt as real HTML text with inline
    SVG icons — same copy, now selectable/accessible/SEO-visible.
24. The hexagon band texture and the "TRY IT NOW" crowd-photo masked text were
    recreated with SVG (the originals were licensed Wix image assets).
25. Meta descriptions are new (the Wix pages had none); titles reuse the
    captured title tags. "AI TERMINOLOGY" title-cased to "AI Terminology".

## Forms

26. Wix intercepted form posts server-side; a static site cannot. Both forms
    (contact + mailing list) POST to `NEXT_PUBLIC_FORM_ENDPOINT` when set
    (Formspree-compatible). When unset — the current state — submitting opens
    a **prefilled email** to arothrock@rothrocklegal.com — CC
    jonathan@rothrocklegal.com and glin@rothrocklegal.com per Arthur
    (2026-08-31), so no single inbox can miss a submission — and shows a
    notice saying so. Documented in `.env.example` and README.
    **Reminder from the capture notes:** existing Wix form submissions and
    mailing-list contacts must be exported from the Wix dashboard before the
    Wix site is retired.
