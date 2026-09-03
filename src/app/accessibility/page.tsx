import { LegalPage } from '@/components/layout/LegalPage';
import { ReadingOptionGroups } from '@/components/layout/ReadingOptionGroups';
import { legal } from '@/components/legal/legal-constants';
import { a11yOptions } from '@/config/a11y';
import { site } from '@/config/site';
import { pageMetadata } from '@/lib/seo/metadata';

const DESCRIPTION =
  'How Rothrock Legal keeps this site readable for everyone: the standard we work to, the reading options, and how to tell us about a barrier.';

export const metadata = pageMetadata({
  title: 'Accessibility',
  description: DESCRIPTION,
  path: '/accessibility/',
});

/** Accessibility statement (WCAG 2.2 AA target) with the reading options set right on the page. */
export default function AccessibilityPage() {
  return (
    <LegalPage
      eyebrow="About this site"
      title="Accessibility"
      description={DESCRIPTION}
      path="/accessibility/"
    >
      <p>
        Many people who come to this site are worried, in a hurry, and reading on a phone. Some use
        a screen reader, a keyboard instead of a mouse, or larger text. We want every one of them to
        be able to read what is here and reach us. This page says what we do about that and how to
        tell us when something gets in the way.
      </p>

      <h2>What we work to</h2>
      <p>
        We build this site to the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA, the
        standard most public bodies and courts use. In practice that means:
      </p>
      <ul>
        <li>
          Every page has one main heading and headings in order, so a screen reader can outline it.
        </li>
        <li>
          Everything works from the keyboard. Press Tab to move between links and buttons; the first
          stop on every page is a &ldquo;Skip to content&rdquo; link.
        </li>
        <li>
          Text is dark on light backgrounds at a contrast of at least 4.5 to 1, and body text is 16
          pixels or larger.
        </li>
        <li>Every button and link is at least 44 pixels tall on a touch screen.</li>
        <li>Photos of people say who they are; decorative images are skipped by screen readers.</li>
        <li>
          Forms have visible labels, and errors are written out in words, not shown by color alone.
        </li>
        <li>
          Nothing moves on its own, and the small animations obey your device&rsquo;s reduce-motion
          setting.
        </li>
        <li>
          No pop-ups cover what you are reading. Menus and options push the page down instead.
        </li>
      </ul>
      <p>
        We check every build with automated tools (Lighthouse and axe) on a phone-sized screen and
        fix what they find before the site is published.
      </p>

      <h2>Reading options</h2>
      <p>
        The AA button in the menu bar at the top of every page (it is named &ldquo;Reading
        options&rdquo; for screen readers) opens four settings. You can also set them here. They are
        saved on this device only, in your browser, and you can set them back to normal at any time.
      </p>
      <ul>
        {a11yOptions.map((option) => (
          <li key={option.key}>
            <strong>{option.label}:</strong> {option.hint}{' '}
            {option.values.map((v) => v.label).join(', ')}.
          </li>
        ))}
      </ul>
      <div className="not-prose my-8 border border-line bg-white p-5 sm:p-6">
        <ReadingOptionGroups />
      </div>
      <p>
        Your browser can help too. On most computers, holding <kbd>Ctrl</kbd> (or <kbd>&#8984;</kbd>{' '}
        on a Mac) and pressing <kbd>+</kbd> makes the whole page bigger, and the site is built to
        keep working at up to 400 percent. Phones have a text-size setting under Accessibility that
        this site follows.
      </p>

      <h2>Video meetings and documents</h2>
      <p>
        We meet by video on Google Meet, which offers live captions. If you need captions, an
        interpreter, extra time, or a phone call instead of video, tell us when you send your
        request and we will set it up. If a document we send you is hard to read, ask and we will
        send it in another form.
      </p>

      <h2>Tell us about a barrier</h2>
      <p>
        If any part of this site is hard for you to use, please tell us. Email{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>. It helps to say which page you were on
        and what happened. {site.replyPromise} Reporting a barrier does not make you a client and
        does not put anything on the record about your legal matter.
      </p>

      <h2>Where we stand</h2>
      <p>
        This site was rebuilt in 2026 with accessibility in mind from the first page. A few things
        we know about: the deadline tool and the consult request need JavaScript to run, and some
        older articles link to court websites we do not control. We review this page and re-test the
        site whenever we make a substantial change.
      </p>
      <p>
        <strong>Last reviewed:</strong> {legal.effectiveDate}. Responsible attorney:{' '}
        {site.responsibleAttorney}, {site.name}, {site.office.city}, {site.office.regionName}.
      </p>
    </LegalPage>
  );
}
