import { site } from '@/config/site';

/** Privacy policy, part 3: your choices and rights, children, the no-client note, changes, contact. */
export function PrivacyRights() {
  return (
    <>
      <h2>Your choices and rights</h2>
      <p>
        Email us at <a href={`mailto:${site.email}`}>{site.email}</a> and we will:
      </p>
      <ul>
        <li>Tell you what information we hold about you.</li>
        <li>Correct anything that is wrong.</li>
        <li>
          Delete it, except for the short conflict-check record and anything the law requires us to
          keep.
        </li>
      </ul>
      <p>
        We will confirm it is really you before we act, usually by replying to the email address on
        your request. We answer as promptly as we can, normally within 30 days. There is no charge
        and no penalty for asking.
      </p>
      <p>
        California law gives consumers rights over their personal information held by businesses
        above certain size thresholds (the California Consumer Privacy Act). Rothrock Legal is a
        small firm and does not currently meet those thresholds. Whether or not that law applies to
        us, we honor the requests above for everyone.
      </p>
      <p>
        <strong>&ldquo;Do Not Track&rdquo; signals.</strong> We do not track you across other
        websites or over time, and no other company collects information about your online activity
        through this site. Because there is nothing to switch off, this site works the same whether
        or not your browser sends a Do Not Track signal.
      </p>

      <h2>Children</h2>
      <p>
        This site is for adults. We do not knowingly collect information from anyone under 18. If
        you believe a minor has sent us information, email us and we will delete it.
      </p>

      <h2>Sending information does not make you a client</h2>
      <p>
        Sending a consult request, a contact-form note, or an email does not create an
        attorney-client relationship. That relationship begins only when both you and the firm sign
        an engagement letter. We may have to decline your matter, and after a conflict check we may
        not be able to explain why.
      </p>
      <p>
        Even so, what you tell us stays confidential. The rules that govern California lawyers
        require us to protect information from a prospective client the same way we protect a
        client&rsquo;s (Rule 1.18 of the California Rules of Professional Conduct), whether or not
        we take your case.
      </p>
      <p>
        Please do not send us documents that belong to another lawyer&rsquo;s client file, that you
        took from someone else without permission, or that you were told you may not share. If you
        are not sure, hold the document and tell us about it instead.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        When we change this policy we post the new version here and update the effective date at the
        top. If a change is significant and you have a consult request pending with us, we will also
        email you. Earlier versions are available on request.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy, or a request under this policy, go to{' '}
        <a href={`mailto:${site.email}`}>{site.email}</a>. You can also write to {site.name},{' '}
        {site.office.city}, {site.office.regionName}, or call {site.phone}.
      </p>
    </>
  );
}
