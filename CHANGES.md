# CHANGES — deliberate differences from the Wix site

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
