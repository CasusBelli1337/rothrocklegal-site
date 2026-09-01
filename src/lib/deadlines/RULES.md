# Deadline rules – verification record

Every rule in `rules.ts` was checked against the statute text on
leginfo.legislature.ca.gov on **2026-09-01**. Quotes below are from that text.
Re-verify each January (the Legislature amends the Probate Code often).

## Counting conventions (`dates.ts`)

- **CCP § 12** – "The time in which any act provided by law is to be done is
  computed by excluding the first day, and including the last, unless the last
  day is a holiday, and then it is also excluded." → `addDays(start, n)`.
- **CCP § 12a(a)** – "If the last day for the performance of any act provided
  or required by law to be performed within a specified period of time is a
  holiday, then that period is hereby extended to and including the next day
  that is not a holiday. For purposes of this section, 'holiday' means all day
  on Saturdays, all holidays specified in Section 135 and, to the extent
  provided in Section 12b, all days that by terms of Section 12b are required
  to be considered as holidays." § 12a(b) applies it to "all other provisions
  of law providing or requiring an act to be performed ... within a specified
  period of time, whether expressed in this or any other code". →
  `rollToCourtDay`. CCP § 366.2(b)(1) and § 366.3(b) name §§ 12, 12a, 12b
  expressly, so the roll applies to the one-year rules too.
- **CCP § 135** – judicial holidays are the Gov. Code § 6700 holidays except
  Lunar New Year, Diwali, Genocide Remembrance Day (April 24), Admission Day
  (September 9), and Columbus Day; plus every Saturday and the day after
  Thanksgiving; "If a judicial holiday falls on a Saturday or a Sunday, the
  Judicial Council may designate an alternative day for observance."
  (Amended by Stats. 2025, Ch. 358, effective 2026-01-01.)
- **Gov. Code § 6700(a)** – the underlying list (Jan 1, MLK Day, Feb 12,
  Presidents' Day, Mar 31, Memorial Day, June 19, July 4, Labor Day, Native
  American Day (fourth Friday in September), Nov 11, Thanksgiving, Dec 25,
  plus the ones § 135 excludes).
- **Holiday table** – `holidays.ts` carries the published 2026 and 2027
  schedules from https://santaclara.courts.ca.gov/general-information/court-holidays
  (fetched 2026-09-01; 2026 cross-checked with https://www.courts.ca.gov/holidays.htm).
  Saturday holidays are observed the Friday before, Sunday holidays the Monday
  after (July 3, 2026; June 18, July 5, and Dec 24, 2027). Jan 1, 2028 is a
  Saturday; its Friday observance (Dec 31, 2027) was not on the court's 2027
  list as fetched, so the verified table omits it and only the rule-based
  generator includes it. Re-check when the court publishes 2028.
- **CCP § 12b** (office closed all day counts as a holiday) is noted, not
  encoded: closures are unpredictable and rolling later is never the safe
  direction. The copy tells visitors to act before the earlier date.
- Months and years are calendar months/years, clamped to the last day of a
  shorter target month (Jan 31 + 1 month = Feb 28; Feb 29 + 1 year = Feb 28).
  The clamp always picks the earlier, safer date.

## Rules

### trust-contest – Probate Code § 16061.8

> "A person upon whom the notification by the trustee is served pursuant to
> this chapter, whether the notice is served on the person within or after the
> time period set forth in subdivision (f) of Section 16061.7, shall not bring
> an action to contest the trust more than 120 days from the date the
> notification by the trustee is served upon the person, or 60 days from the
> date on which a copy of the terms of the trust is delivered pursuant to
> Section 1215 to the person during that 120-day period, whichever is later."
> (Amended by Stats. 2022, Ch. 30 (AB 1745), effective 2023-01-01.)

Encoded as two clocks, later-of: 120 days from service; 60 days from delivery
of the trust copy, **only when delivery falls inside the 120-day window**
(before the notice or after day 120 → the 60-day clock does not start).

- § 16061.7(e): "The notification by trustee shall be served by any of the
  methods described in Section 1215 to the last known address." § 1215(a):
  "Delivery by mail is complete when the notice or other paper is deposited in
  the mail." → the wizard asks for the **mailing** date, not the arrival date.
- § 16061.7(h) required warning, verbatim: "You may not bring an action to
  contest the trust more than 120 days from the date this notification by the
  trustee is served upon you or 60 days from the date on which a copy of the
  terms of the trust is delivered to you during that 120-day period, whichever
  is later."
- **Gap:** no notice served → no § 16061.8 clock. The copy says so plainly,
  then says the other limits on the page and laches still apply and never
  says "unlimited time". "Not sure" is treated as possibly running.

### will-contest – Probate Code §§ 8270, 8250

> § 8270(a): "Within 120 days after a will is admitted to probate, any
> interested person, other than a party to a will contest and other than a
> person who had actual notice of a will contest in time to have joined in the
> contest, may petition the court to revoke the probate of the will."
> § 8270(b): a minor or an incompetent person with no guardian or conservator
> at admission "may petition the court to revoke the probate of the will at
> any time before entry of an order for final distribution."
> § 8250(a): "When a will is contested under Section 8004, the contestant
> shall file with the court an objection to probate of the will."

Encoded: 120 days from the order admitting the will. Filed-but-not-admitted,
not filed, and not sure → no clock; copy points to objecting at or before the
hearing and to the court's case index. The § 8270(a) exclusions and § 8270(b)
appear as caveats.

### broken-promise – CCP § 366.3

> (a) "If a person has a claim that arises from a promise or agreement with a
> decedent to distribution from an estate or trust or under another
> instrument, whether the promise or agreement was made orally or in writing,
> an action to enforce the claim to distribution may be commenced within one
> year after the date of death, and the limitations period that would have
> been applicable does not apply." (b) not tolled or extended "except as
> provided in Sections 12, 12a, and 12b" and the named Probate Code parts.

Encoded: one year from the date of death.

### claims-against-decedent – CCP § 366.2

> (a) "If a person against whom an action may be brought on a liability of
> the person, whether arising in contract, tort, or otherwise, and whether
> accrued or not accrued, dies before the expiration of the applicable
> limitations period, and the cause of action survives, an action may be
> commenced within one year after the date of death, and the limitations
> period that would have been applicable does not apply." (b)(1) excepts
> "Sections 12, 12a, and 12b of this code."

Encoded: one year from the date of death; shown when the visitor says the
person owed them money or property.

### creditor-claim – Probate Code § 9100

> (a) "A creditor shall file a claim before expiration of the later of the
> following times: (1) Four months after the date letters are first issued to
> a general personal representative. (2) Sixty days after the date notice of
> administration is mailed or personally delivered to the creditor."
> (c) "Nothing in this section shall be interpreted to extend or toll any
> other statute of limitations".

Encoded as two clocks, later-of; shown only for "owed money". No letters →
no clock, and the copy says the one-year § 366.2 limit runs regardless.

### elder-abuse – Welfare & Institutions Code § 15657.7

> "An action for damages pursuant to Sections 15657.5 and 15657.6 for
> financial abuse of an elder or dependent adult, as defined in Section
> 15610.30, shall be commenced within four years after the plaintiff discovers
> or, through the exercise of reasonable diligence, should have discovered,
> the facts constituting the financial abuse."

Encoded: four years from the discovery date the visitor gives. Caveats warn
that "should have discovered" can be earlier, and that a deceased abuser can
bring the one-year § 366.2 limit into play.

### breach-of-trust – Probate Code § 16460

> (a)(1) "If a beneficiary has received an interim or final account in
> writing, or other written report, that adequately discloses the existence of
> a claim against the trustee for breach of trust, the claim is barred as to
> that beneficiary unless a proceeding to assert the claim is commenced within
> three years after receipt of the account or report."
> (a)(2) if the account "does not adequately disclose the existence of a
> claim ... or if a beneficiary does not receive any written account or
> report, the claim is barred ... unless a proceeding to assert the claim is
> commenced within three years after the beneficiary discovered, or reasonably
> should have discovered, the subject of the claim."

Encoded: three years from receipt of an accounting when one was received,
otherwise three years from the discovery date; the "adequately discloses"
condition is a caveat because the wizard cannot judge it.

## Not encoded (on purpose)

- Laches, equitable tolling, defective or unserved notices, no-contest
  clauses, tolling for minors or incapacity – fact-specific; the copy names
  them and sends the visitor to a lawyer.
- Probate Code § 19000 et seq. trust creditor-claim procedure and § 9353
  (suit after a rejected claim) – not verified for this build; the copy only
  says "its own short deadline".
