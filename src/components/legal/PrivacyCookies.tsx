import { PrivacyChoicesButton } from '@/components/consent/PrivacyChoicesButton';
import { buttonClass } from '@/components/ui/Button';
import { consentConfig } from '@/config/consent';
import { policyAdvertising, policyCounter, privacyChoicesLabel } from '@/config/consent-copy';

/** Privacy policy: "Cookies and your choices" (docs/CONSENT.md; the anchor is linked from the bar). */
export function PrivacyCookies() {
  const counter = policyCounter();
  return (
    <>
      <h2 id="cookies-and-your-choices">Cookies and your choices</h2>
      <p>
        On your first visit, a bar at the bottom of the screen asks about analytics. Until you say
        yes, nothing from Google loads and no analytics cookie is set.
      </p>
      {counter && <p>{counter.cookies}</p>}
      <p>This site keeps two kinds of information in your browser:</p>
      <ul>
        <li>
          <strong>Needed for the site (always on).</strong> Your privacy choice, your reading
          options, and your progress in the deadline tool and the consult request. The site also
          notes which topics you have read, so the next pages fit. These stay on your device; we
          never see them. The consult request also saves a draft with us, as described above.
        </li>
        <li>
          <strong>Analytics (only if you say yes).</strong> Google Analytics, described under
          Technical information above. Its cookies have names that start with _ga and last up to two
          years, unless you clear them or change your answer.
        </li>
      </ul>
      <p>{policyAdvertising().full}</p>
      <p>
        <strong>What we keep about your choice.</strong> Your browser stores your answer, the date
        you gave it, and whether a privacy signal was on. It is saved on your device under the name{' '}
        {consentConfig.storageKey} and is never sent to us. After 12 months, or if we change what we
        ask, the bar asks again.
      </p>
      <p>
        <strong>Changing your mind.</strong> Use {privacyChoicesLabel()} at the bottom of every
        page, or the button below. Saying no takes effect at once and removes the analytics cookies.
        The site works the same either way.
      </p>
      <p>
        <PrivacyChoicesButton className={buttonClass('secondary', 'sm')}>
          Open privacy choices
        </PrivacyChoicesButton>
      </p>
      <p>
        <strong>Global Privacy Control and Do Not Track.</strong> If your browser sends either
        signal, we treat it as a no to analytics and advertising, and the bar says so. You can still
        turn analytics on yourself. Advertising, if we ever use it, stays off while the signal is
        on.{counter && ` ${counter.signal}`}
      </p>
    </>
  );
}
