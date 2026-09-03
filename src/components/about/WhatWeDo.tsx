import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getPracticeArea, practiceHref, practicePages } from '@/config/practice-areas';
import { oddLastSpan } from '@/lib/grid';

const inlineLink = 'text-maroon-700 underline underline-offset-3 hover:text-maroon-600';

/** The practice in plain words, then a card per practice page (CONTRACTS §5). */
export function WhatWeDo() {
  const primary = practicePages.filter((a) => !a.secondary);
  const secondary = practicePages.filter((a) => a.secondary);
  const trustees = getPracticeArea('for-trustees');
  const complex = getPracticeArea('complex-estates');
  return (
    <section className="py-16 lg:py-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="What we do"
            title="Trust and estate litigation. That's the practice."
            lead="Most of our cases start the same way. Someone died, the trust or the will isn't what everyone expected, and the person holding the money won't explain."
          />
          <p className="mt-6 max-w-[64ch] text-body-lg text-ink-2">
            We contest trusts and wills, prove undue influence and lack of capacity, remove and
            surcharge trustees and executors who break the rules, force accountings, recover
            property that was moved out of a trust or estate under Probate Code section 850, and
            stop financial elder abuse. Most of it is heard in the Santa Clara County Superior
            Court&rsquo;s Probate Division in San Jose, and we regularly appear in the San Mateo,
            Alameda, and San Francisco Superior Courts.
          </p>
          <p className="mt-4 max-w-[64ch] text-body-lg text-ink-2">
            We work both sides of the table. A{' '}
            <Link href={practiceHref(trustees)} className={inlineLink}>
              family-member trustee
            </Link>{' '}
            who never asked for the job and is now facing an accounting demand, a removal petition,
            or a surcharge claim gets a defense, and a trustee acting in good faith can hire us at
            the trust&rsquo;s expense. And when the estate is a{' '}
            <Link href={practiceHref(complex)} className={inlineLink}>
              complicated one
            </Link>
            , with several properties, an LLC or a family business held in trust, and millions at
            issue, that is the kind of case this firm was built to run.
          </p>
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {primary.map((area, i) => (
            <Card
              key={area.slug}
              href={practiceHref(area)}
              className={`flex flex-col ${oddLastSpan(i, primary.length, 'lg')}`}
            >
              <h3 className="font-sans text-h4 text-ink transition-colors group-hover:text-maroon-700">
                {area.title}
              </h3>
              {area.card && (
                <p className="mt-2 font-serif-italic text-body text-ink-2 italic">
                  &ldquo;{area.card.headline}&rdquo;
                </p>
              )}
              <p className="mt-auto pt-4 text-small font-medium text-maroon-700">
                What you can do <span aria-hidden="true">&rarr;</span>
              </p>
            </Card>
          ))}
        </Reveal>
        {secondary.map((area) => (
          <p key={area.slug} className="mt-8 max-w-[64ch] text-body text-ink-2">
            We also take{' '}
            <a
              href={practiceHref(area)}
              className="tap-link text-maroon-700 underline underline-offset-3 hover:text-maroon-600"
            >
              business and partnership disputes
            </a>{' '}
            when a family company is part of the fight.
          </p>
        ))}
      </Container>
    </section>
  );
}
