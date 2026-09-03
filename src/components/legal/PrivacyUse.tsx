import { legal } from './legal-constants';

/** Privacy policy, part 2: use, AI processing, who can see it, security, and retention. */
export function PrivacyUse() {
  return (
    <>
      <h2>How we use it</h2>
      <p>We use what you send us for these purposes only:</p>
      <ul>
        <li>To decide whether we can help with your matter.</li>
        <li>
          To run a conflict check. We compare every name you give us against our client list before
          we can talk about your matter.
        </li>
        <li>To reply to you, ask follow-up questions, and give you a written fee estimate.</li>
        <li>If you become a client, as part of your file.</li>
      </ul>
      <p>
        We do not use your information for marketing. We do not sell it, rent it, or share it for
        advertising, and we never will.
      </p>

      <h2>How we use AI</h2>
      <p>
        When you send a consult request, a single automated pass reads everything you sent and
        organizes it for us: a summary, a timeline, the names involved, what seems to be missing,
        and a short list of follow-up questions. That is what makes it possible for a lawyer to
        review your request within a business day instead of weeks.
      </p>
      <ul>
        <li>
          <strong>A lawyer reviews everything.</strong> The AI does not decide whether we take your
          case, does not give you legal advice, and does not reply to you. A lawyer at the firm
          reads your request and decides what happens next.
        </li>
        <li>
          <strong>The AI provider.</strong> We use a commercial AI service from {legal.ai.provider}.
          Its{' '}
          <a href={legal.ai.commercialTermsUrl} rel="noopener noreferrer">
            commercial terms
          </a>{' '}
          state that it may not train its models on customer content. Its published policies state
          that, by default, it{' '}
          <a href={legal.ai.trainingPolicyUrl} rel="noopener noreferrer">
            does not use inputs or outputs from its commercial products to train its models
          </a>{' '}
          and that it{' '}
          <a href={legal.ai.retentionPolicyUrl} rel="noopener noreferrer">
            deletes inputs and outputs from its systems within 30 days
          </a>
          , with limited exceptions such as legal requirements. The provider processes what you send
          only to provide the service to us.
        </li>
        <li>
          <strong>The deadline tool does not use AI.</strong> It applies a fixed table of rules to
          your answers, inside your browser.
        </li>
      </ul>

      <h2>Who can see it</h2>
      <p>Your information is seen by:</p>
      <ul>
        <li>The attorneys and staff at Rothrock Legal who evaluate and handle requests.</li>
        <li>
          Companies that provide services to us and that may only use your information to do that
          work: our email provider, the form-delivery service (if one is in use), the company that
          hosts the site and the consult-request system, the AI provider described above, Google
          (Meet and Calendar) when we schedule a video meeting with you, and Legion, the AI
          litigation platform our founder co-founded, where we work on client files after you
          become a client.
        </li>
        <li>
          Anyone we are required by law to share it with, for example under a court order or
          subpoena. Even then, we share only what the law requires and we assert every protection
          that applies.
        </li>
      </ul>
      <p>
        We do not share your information with data brokers, advertisers, or anyone else. If another
        lawyer or party needs to see what you sent us, we will ask you first.
      </p>

      <h2>Storage and security</h2>
      <ul>
        <li>Everything you send through this site travels over an encrypted connection (HTTPS).</li>
        <li>
          Consult requests and uploaded documents are stored on systems the firm controls, and
          access is limited to the firm.
        </li>
        <li>
          Ordinary email is not fully secure. Please do not put Social Security numbers, bank
          account numbers, or passwords in an email or a consult request unless we ask you for them.
        </li>
        <li>
          No website or storage system is perfectly secure. We use reasonable safeguards, and we
          will tell you if we learn that your information has been exposed.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>
          <strong>Drafts you never send:</strong> deleted {legal.draftPurgeDays} days after you last
          touched them.
        </li>
        <li>
          <strong>Requests you send:</strong> kept while we evaluate your matter and follow up with
          you.
        </li>
        <li>
          <strong>If you become a client:</strong> your request becomes part of your file and is
          kept under our file-retention rules for client files.
        </li>
        <li>
          <strong>If we do not take your matter:</strong> deleted {legal.declinedRetentionMonths}{' '}
          months after our last contact with you. We keep only a short conflict-check record (the
          names you gave us, the date, and the type of matter) so that we never take a case against
          you later, plus anything the law requires us to keep.
        </li>
        <li>
          <strong>Contact-form notes and emails:</strong> kept on the same schedule as a request.
        </li>
      </ul>
      <p>You can ask us to delete your information sooner. See the next section.</p>
    </>
  );
}
