# Privacy choices – the consent bar

Added 2026-10-01. Nothing from a third party, and nothing that sets a cookie
or keeps anything on the device to count visits, runs until the visitor says
yes. Today that means Google Analytics 4 (GA4), the one third-party script on
the site. The design leaves room for an advertising category (a Meta pixel is
planned) that turns on with one config entry. The firm's own cookieless
counter is the one thing that counts visits without a yes; section 5 says why.

## 1. How it works

- **Categories** (`src/config/consent.ts`): `necessary` (always on; browser
  storage that never leaves the device: this choice, the reading options, the
  form drafts, the lens), `analytics` (GA4; offered when `site.analyticsId` is
  set), and `advertising` (defined, offered only once a vendor is listed). A
  category with no vendor is never shown and can never be granted.
- **The record** lives in `localStorage` under `rl-consent`:
  `{ version, savedAt, granted: ['analytics'], signal }`
  (`src/lib/consent/store.ts`). It counts only when it is the current
  `consentConfig.version`, under 12 months old (`maxAgeDays: 365`), and, if a
  privacy signal is on now, was made while it was on. Otherwise the bar asks
  again. Every storage touch is wrapped; a blocked storage keeps the choice
  for the page only.
- **Before paint**: an inline `<head>` script (`src/lib/consent/boot.ts`,
  under 450 bytes, `CONSENT_BOOT_MAX_BYTES`) applies the same rules and stamps
  `html[data-consent]`: `ask` (the bar shows), the granted categories
  (`analytics`), or `none`. `boot.test.ts` runs it against a matrix of stored
  values and signals and requires it to agree with `consentAttribute()`.
- **The bar** (`src/components/consent/ConsentBanner.tsx`) is in the static
  HTML of every page, right after the skip link (so keyboard and screen-reader
  visitors meet it first), drawn fixed at the bottom. Before hydration
  `globals.css` shows it only under `html[data-consent='ask']`; without
  JavaScript it never shows, and no tracker can run. Below `lg` it stacks
  above the mobile consult bar where that renders (`showsMobileConsultBar`).
  While open, `use-bar-inset.ts` sets `--consent-bar-h` (body padding, so the
  footer's last line scrolls clear) and `--consent-cover` (scroll padding, so
  a focused control is never hidden behind it, WCAG 2.4.11; and the offset
  the consult flow's sticky action bar keeps, `intake.css`, so its button
  stacks above the bar instead of under it). Both are measured again when
  the bar resizes or a page change moves it, and `--consent-cover` rounds
  down so no hairline of page shows between the two bars (2026-10-02,
  `use-bar-inset.test.tsx`). Any new bottom-sticky element must read
  `--consent-cover` the same way.
- **Choices**: "Accept analytics", "Decline", and "Choose", one style and one
  size (`styles.ts`). "Choose" opens the categories inline (switches, one
  sentence each, "Save choices"). Escape inside the bar declines a first
  visit, or closes a reopened bar without changing anything. "Accept
  analytics" never grants advertising.
- **Reopening**: `PrivacyChoicesButton` in the footer's legal row ("Privacy
  choices") and in the privacy policy's "Cookies and your choices" section
  opens the bar with the categories showing and focus on its heading; closing
  returns focus to the button.
- **Signals**: `navigator.globalPrivacyControl === true` or
  `navigator.doNotTrack === '1'` is treated as a no. Before a choice nothing
  runs anyway; the bar adds a line naming the signal. A yes given before the
  signal appeared stops counting and the bar asks again. A yes to analytics
  given with the signal note on screen stands (CCPA regs § 7025(c)(3) allows
  asking after notice of the conflict). A sale-or-share category
  (`saleOrShare: true`, advertising) never runs while a signal is on, whatever
  is stored.
- **GA4** (`src/lib/analytics/tag.ts`, `src/components/seo/GaLoader.tsx`):
  basic Consent Mode. Nothing from Google loads before a yes. After a yes,
  once the page is idle: `gtag('consent','default', all four denied)`, then
  `update` with the choice, then `js` and `config` (with
  `allow_google_signals: false` and `allow_ad_personalization_signals: false`),
  then gtag.js is injected. A later no (or a signal) sends `update` denied,
  sets `window['ga-disable-<id>']`, and expires every `_ga*` cookie on the host
  and its parent domain; the same cookie sweep runs for every visitor without
  a yes, which clears cookies left from before 2026-10-01. Never on `/sign/` or
  `/schedule/` (the bar still shows there).
- **Events** (`trackEvent`, `#seam:ga4-events`): for GA4, dropped, never
  queued, without a current yes; a later yes does not replay them. The same
  events also go to the counter (section 5), which needs no yes.

## 2. Gates

- `npm test`: `store.test.ts` (default denied, grant, decline, expiry, version
  bump, GPC/DNT), `boot.test.ts` (cap, parity), `client.test.ts`,
  `ConsentBanner.test.tsx` (first visit, hides after a choice, Escape, Choose,
  reopen from the footer, GPC note, stacking), `GaLoader.test.tsx` and
  `tag.test.ts` (no Google script before a yes; one after; withdrawal),
  `events.test.ts` and `EmailClickTracker.test.tsx` (events dropped before a
  yes), `consent-copy.test.tsx` (voice guide, no em dash, sentence length,
  including the rendered policy section and the counter sentences),
  `consent-advertising.test.tsx` (the advertising switch, and the seam ledger
  below), `counter.test.ts` and `Counter.test.tsx` (blank config means no tag,
  off in the preview, off on `/sign/` and `/schedule/`, off under GPC or DNT,
  the tag's attributes), and `events.test.ts` (every event reaches both GA4 and
  the counter; GA4 still only after a yes).
- `node scripts/check-consent.mjs` (after a build): every page carries the
  boot script in `<head>` under the cap, no page's static `<html>` carries
  `data-consent`, no static HTML references googletagmanager.com or
  google-analytics.com, every page carries the bar and the footer button, the
  privacy policy carries the section the bar links to, every page but `/sign/`
  and `/schedule/` carries the counter's one inline loader (those two never
  mention the counter host), no `<script src>` points off the site, and the
  only off-site script any inline script names is the counter's.

## 3. Turning on advertising

The seam is `#seam:consent-advertising`. The ledger below lists every source
file that carries the marker; `consent-advertising.test.tsx` fails if a file
gains or loses it without this list changing.

<!-- seam:consent-advertising -->

| File                         | What changes                                                            |
| ---------------------------- | ----------------------------------------------------------------------- |
| `src/config/consent.ts`      | Add the vendor to `advertising.vendors`. This is the switch.            |
| `src/config/consent-copy.ts` | The bar's message, the footer label, the policy sentences (review them) |
| `src/lib/analytics/tag.ts`   | Consent Mode's three ad types follow the advertising category           |

<!-- /seam -->

The one entry shows the advertising switch, renames the footer link "Do Not
Sell or Share My Personal Information" (Civ. Code § 1798.135(a)(1)), and swaps
the privacy policy's advertising sentences. Before adding it:

1. Load the pixel only through the consent store (a loader like `GaLoader`
   that waits for `state.advertising`), never from a tag manager or a
   hard-coded snippet.
2. Never run it on `/request-a-consult/`, `/sign/`, `/schedule/`, or any page
   with a form; turn off Meta's automatic advanced matching, so no typed
   field ever reaches Meta. The privacy policy promises that what a visitor
   sends is never shared for advertising.
3. Have a lawyer review `policyAdvertisingCopy.withAdvertising` and the
   short-version line, name the vendor, move `legal.privacyEffectiveDate`, and
   re-check the CCPA thresholds: sharing the data of 100,000 or more
   California consumers or households a year makes the firm a "business"
   (§ 1798.140(d)(1)(B)).
4. The cookie controls alone are not an acceptable opt-out of sale or sharing
   (CCPA regs § 7026(a)(4)): keep the email opt-out in the policy beside the
   link, and keep honoring GPC (§ 7025(e)). Where the CCPA applies, show that
   a GPC signal was honored, e.g. "Opt-Out Request Honored" (§ 7025(c)(6)).
   § 7015 allows "Your Privacy Choices" with the CPPA icon instead of the
   long link name; that is a one-line change in `privacyChoicesLabels`.
5. Re-check `GA_PRIVACY_CONFIG` if Google Ads is involved, and bump
   `consentConfig.version` so every visitor is asked again.

## 4. Why this design (sources checked 2026-10-01)

- **Consent before any third-party script.** The California Invasion of
  Privacy Act makes it unlawful to read a communication in transit "without
  the consent of all parties", and reaches anyone who "aids, agrees with,
  employs, or conspires" with the reader (Pen. Code § 631(a)); § 637.2(a)
  sets $5,000 per violation. The Ninth Circuit read § 631(a) to require
  _prior_ consent (Javier v. Assurance IQ, No. 21-16351, 9th Cir. May 31,
  2022, unpublished). In 2024 federal courts let "pen register" claims
  (§ 638.51) over ordinary trackers proceed (Shah v. Fandom, N.D. Cal. Oct.
  21, 2024; Mirmalek v. Los Angeles Times, N.D. Cal. Dec. 12, 2024), and in
  2026 the Court of Appeal revived class claims over the Meta Pixel and
  Google Analytics (Doe v. Adventist Health System/West, B344951, cert. for
  pub. Aug. 24, 2026). SB 690 (Stats. 2026, ch. 976, approved Sept. 30, 2026)
  leaves only the Attorney General able to sue over website pen registers,
  but it does not touch §§ 631 or 632.
- **Basic Consent Mode, not advanced.** Google: in basic mode "No data is
  sent before a user consents"; in advanced mode, cookieless pings are sent
  while consent is denied, and Google says those may include the IP address,
  the very data the pen-register suits are about.
- **Equal choices.** CCPA regs § 7004(a)(2)(C)-(D): "Accept All" beside only
  "More Information" is not symmetrical; a "yes" button more prominent than
  the "no" is not either; § 7004(a)(3): silence is not consent.
- **GPC and Do Not Track.** CalOPPA requires the policy to say how the site
  responds to Do Not Track (Bus. & Prof. Code § 22575(b)(5)) and whether
  other parties collect information over time and across sites (b)(6). The
  CCPA regs require honoring GPC as an opt-out of sale/sharing (§ 7025) and
  allow asking for consent after noting the conflict (§ 7025(c)(3)). AB 566
  (Stats. 2025, ch. 465) makes browsers offer the signal from January 1, 2027.
- **No "Do Not Sell or Share" link today.** The firm does not sell or share,
  and the policy says so; a business that does not sell or share and says so
  in its policy need not post the notice of right to opt out (§ 7013(g)). The
  firm is likely under every § 1798.140(d) threshold today.

## 5. First-party counter

Added 2026-10-01 at Arthur's request: an accurate first-party count of visits
that needs no prompt, with GA4 and the bar left exactly as they are.

- **What it is.** Umami 3.4.0, self-hosted in the Armory (service `umami`;
  `legion-armory/docs/references/umami.md`). The tracker is
  `https://count.rothrocklegal.com/c.js` and posts to `/api/c` on the same
  host; the tunnel forwards only those two paths, and the admin is on the rig
  only. Telemetry and update checks are off, so Umami Software receives
  nothing.
- **Config** (`site.counter`): `origin` and `websiteId`. A blank origin is the
  off-switch: no tag, and `policyCounter()` drops every counter sentence from
  the bar and the policy.
- **The tag** (`src/lib/analytics/counter.ts`, `components/seo/Counter.tsx`):
  an inline loader in the static HTML of every page but `/sign/` and
  `/schedule/`. Under GPC or DNT (the same test as `privacySignal()`) it does
  nothing, so not even the script is fetched; otherwise it appends the tracker
  after the load event with `data-do-not-track` (Umami's own DNT check),
  `data-auto-track`, `data-domains="www.rothrocklegal.com"` (a local build
  never counts), and `data-exclude-search` and `data-exclude-hash` (a `?t=` or
  `?resume=` token never leaves the browser). Off in the editor preview.
- **What it keeps** (checked against the Umami 3.4.0 source and the `umami`
  database on 2026-10-01): per page view, the path and title and the referring
  site; per visitor, the browser, OS, device type, screen size, language, and
  country (from Cloudflare's `cf-ipcountry` header; region and city stay empty
  unless Cloudflare's "visitor location headers" transform is turned on, so
  leave it off). The tracker sets no cookie and writes nothing to the browser;
  it only reads `localStorage['umami.disabled']`, Umami's own opt-out switch.
  The IP address arrives in `cf-connecting-ip`, is used for the bot check and
  the visitor hash, and is not stored: no table has an IP or user-agent
  column. A visitor is `uuid(website, IP, user agent, daily salt)` keyed by
  the server's `APP_SECRET` (`SALT_ROTATION=day`), so the same person is a new
  visitor each day and the hash cannot be reversed without the secret.
  Headless browsers are dropped as bots. Raw rows are kept 13 months.
- **Why no prompt.** The sources are those in section 4, checked 2026-10-01;
  the two Court of Appeal cases named here were not re-verified on Westlaw for
  this note.
  - _First party, no third party._ The firm runs the software on its own
    computer and is the intended recipient of the request. CIPA § 631(a)
    reaches one who reads a communication "without the consent of all
    parties"; California courts have long read it as aimed at third-party
    eavesdroppers, not a party to the communication (Rogers v. Ulrich (1975)
    52 Cal.App.3d 894; Warden v. Kahn (1979) 99 Cal.App.3d 805). The tracker
    suits rest on a separate company that can use the data for its own ends;
    here there is none. Cloudflare carries the request as the firm's network
    provider, as it does every consult request, and runs no script of its own
    on the page.
  - _No cookie, no stored identifier, nothing on the device._ There is nothing
    for the bar to switch off, and nothing is sold or shared for advertising
    under the CCPA (§ 1798.140(ad), (ah)).
  - _Pen registers._ The counter reads the IP address in transit, as every web
    server does, keeps only the daily hash, and stores no address. SB 690
    (Stats. 2026, ch. 976) leaves suits over website pen registers to the
    Attorney General alone, and a first-party count that keeps no address is
    the least exposed form of that question. Revisit this section if the count
    ever moves to a third-party service.
  - _CalOPPA._ The policy must say what the site collects (§ 22575(b)(1)) and
    how it responds to Do Not Track ((b)(5)). "Technical information" names the
    counter and what it records; both signal paragraphs say a signal leaves the
    visitor out.
  - _Symmetry._ The count is not offered as a choice, so it adds no button and
    no switch, and the three choices stay equal (§ 7004(a)(2)). The bar's small
    print says in one sentence that the count runs unless a privacy signal is
    on, so "Decline" is never read as turning it off.
