import { site } from '@/config/site';
import { legal } from './legal-constants';

/** Privacy policy, part 1: every category of information the site collects and where each one goes. */
export function PrivacyCollect() {
  return (
    <>
      <h2>What we collect, and where it goes</h2>
      <p>
        We collect only what you choose to give us. There are four ways to send us information on
        this site, and each is described below. Nothing on this site collects information about you
        in the background.
      </p>

      <h3>The contact form (&ldquo;Tell us your story&rdquo;)</h3>
      <p>
        The short form on our contact page asks for your name, your email address, your phone number
        (optional), what happened, and whether you have received a formal notice. When you press
        send, the form is delivered to our email inboxes. Depending on how the site is set up, it
        travels either through a form-delivery service acting on our behalf or through your own
        email app.
      </p>

      <h3>The deadline tool (&ldquo;How Long Do I Have?&rdquo;)</h3>
      <p>
        Your answers stay in your own browser so you can come back to them. Nothing you enter in the
        deadline tool reaches us unless you then send the contact form or a consult request. You can
        clear the saved answers from the tool itself or by clearing your browser data.
      </p>

      <h3>The consult request</h3>
      <p>
        When you request a consult, we collect what you enter at each step. It can include all of
        the following:
      </p>
      <ul>
        <li>
          <strong>How to reach you:</strong> your full name, email address, phone number (optional),
          city, county, and how you prefer to hear back.
        </li>
        <li>
          <strong>Your situation:</strong> which situations fit, and your relationship to the person
          who died or to the estate.
        </li>
        <li>
          <strong>The people involved:</strong> the name of the person who died, the trustee or
          executor, other family members or opposing parties, and their lawyer if you know it. We
          need these names to run a conflict check.
        </li>
        <li>
          <strong>Your story:</strong> what happened, in your own words. You can type it, or press
          the microphone button and say it. If you use the microphone, the words appear as text and,
          where your browser supports it, we also receive the audio recording you made.
        </li>
        <li>
          <strong>Key dates:</strong> when the person passed away, when you received a notice or a
          copy of the trust, and other dates you were told matter.
        </li>
        <li>
          <strong>Documents you upload:</strong> trusts, wills, letters, account statements, and
          similar papers (PDF, images, Word, email, or text files, up to {legal.maxUploadMb} MB each
          and {legal.maxUploadFiles} files in total). We also receive the file names.
        </li>
        <li>
          <strong>Scope and cost:</strong> the rough value of what is in dispute, how you expect to
          pay for legal work, how urgent things are, and what you want to happen.
        </li>
        <li>
          <strong>Follow-up answers:</strong> anything you add when we ask a few more questions or
          for a few more documents on the last screen.
        </li>
      </ul>
      <p>
        Your progress is saved as you go, both in your own browser and as a draft on our server, so
        you can stop and come back. Drafts you never send are deleted after {legal.draftPurgeDays}{' '}
        days.
      </p>
      <p>
        <strong>About the microphone.</strong> Turning your speech into text is done by your
        browser, not by us. Most browsers, including Chrome, send the audio to the browser
        maker&rsquo;s speech service to do this, under that company&rsquo;s privacy policy. If you
        would rather not use it, type instead.
      </p>

      <h3>Email you send us</h3>
      <p>
        If you email us directly, we keep the email and any attachments the same way we keep a
        consult request.
      </p>

      <h3>Public records we may look at</h3>
      <p>
        As part of conflict checking and case review, we may look at public court records and
        other public sources about the people and the disputes described in your request. We do
        this to check for conflicts and to see what has already happened in court. We do not buy
        information about you from data brokers.
      </p>

      <h3>Video meetings and scheduling</h3>
      <p>
        Video consultations happen on Google Meet, and we schedule them on the firm&rsquo;s Google
        Calendar. When we set up a meeting with you, Google receives your name and email address so
        it can send you the invitation and the meeting link, under Google&rsquo;s own privacy
        policy. Nothing from Google runs on this website. If you would rather not use Google Meet,
        tell us and we will find another way to talk.
      </p>

      <h3>If we agree to work together</h3>
      <p>
        You sign the engagement agreement on a signing page that runs on the firm&rsquo;s own
        systems, not through a third-party e-signature company. After you become a client, we work
        on your file in Legion, the AI litigation platform our founder co-founded, which is listed
        among our providers below. Your file is then protected by the rules that cover client
        information, and this policy keeps applying to what you sent us before you became a client.
      </p>

      <h3>Technical information</h3>
      <p>
        This site does not use analytics, tracking cookies, advertising networks, or social-media
        pixels, and it does not build a profile of you. Two technical details exist because every
        website has them:
      </p>
      <ul>
        <li>
          The site is hosted on {legal.host.name}, which{' '}
          <a href={legal.host.dataCollectionUrl} rel="noopener noreferrer">
            logs visitor IP addresses for security
          </a>
          . We do not receive or use those logs.
        </li>
        <li>
          Our consult-request server uses your IP address only to limit abuse, such as too many
          requests at once. It does not store your IP address with your request.
        </li>
      </ul>
      <p>If you contact us by phone at {site.phone}, we collect what you tell us the same way.</p>
    </>
  );
}
