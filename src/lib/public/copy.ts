/**
 * Every line of copy on /sign/ and /schedule/ (config over code; plain English
 * for someone who is not a lawyer, no em dashes, no promised outcomes).
 */

export const FIRM_EMAIL = 'arothrock@rothrocklegal.com';
export const FIRM_NAME = 'Rothrock Legal';
export const ATTORNEY_NAME = 'Arthur Rothrock';

export const SHARED_COPY = {
  tryAgain: 'Try again',
  questions: `Questions? Email ${FIRM_EMAIL}.`,
  disclaimerLink: 'Disclaimer',
  network: 'We could not reach our server. Check your connection and try again.',
  generic: 'Something went wrong on our side. Please try again.',
} as const;

export const SIGN_COPY = {
  eyebrow: FIRM_NAME,
  title: `Your agreement with ${FIRM_NAME}`,
  loading: 'Checking your link…',
  invalid: {
    title: 'This signing link is not valid or has expired.',
    body: `If you were expecting to sign an agreement with ${FIRM_NAME}, email ${FIRM_EMAIL} and we will send a new link.`,
  },
  loadFailed: 'We could not load your agreement.',
  preparedFor: 'Prepared for',
  intro:
    'This is the engagement agreement between you and Rothrock Legal. It sets out what we will do, how fees work, and what we ask of you. Read all of it first. The signature block opens when you reach the end.',
  forYouOnly: 'This page is for the person named above. If that is not you, please close it and let us know.',
  pdf: {
    preparing: (page: number, total: number) => `Preparing page ${page} of ${total}…`,
    failed: 'We could not display the agreement. Check your connection and try again.',
    pageLabel: (page: number, total: number) => `Page ${page} of ${total}`,
  },
  read: {
    heading: 'Read to the end',
    progress: (seen: number, total: number) => `You have reached page ${seen} of ${total}.`,
    done: 'You have read to the end. You can sign below.',
    hint: 'Scroll through the agreement, or confirm you have read it, to open the signature block.',
    confirm: 'I have read it',
  },
  signature: {
    heading: 'Sign the agreement',
    locked: 'The signature block opens once you have read to the end.',
    consent:
      'I agree to sign this agreement electronically. My electronic signature is as binding as a signature in ink. I can ask Rothrock Legal for a paper copy at any time, and I can stop before signing by closing this page.',
    nameLabel: 'Your full legal name',
    nameHint: 'As it should appear on the agreement.',
    method: 'How would you like to sign?',
    typed: 'Type my name',
    drawn: 'Draw',
    previewLabel: 'Preview of your typed signature',
    drawHint: 'Draw your signature with your finger, a stylus, or a mouse.',
    padLabel: 'Signature drawing area',
    clear: 'Clear',
    button: 'Sign the agreement',
    busy: 'Signing…',
    notFinal: 'Nothing is final until you press the button.',
  },
  problems: {
    notRead: 'Please read to the end of the agreement first.',
    consent: 'Please tick the box to agree to sign electronically.',
    name: 'Please type your full legal name.',
    drawn: 'Please draw your signature, or choose "Type my name".',
    imageTooLarge: 'That drawing is too detailed to send. Press Clear and sign again with fewer strokes.',
  },
  done: {
    eyebrow: 'Signed',
    title: 'Thank you.',
    received: (time: string) => `We received your signature at ${time}.`,
    copy: 'A copy will be emailed to you once everyone has signed.',
    nextWithOthers: `Next: the other person named in the agreement signs with their own link. Then ${ATTORNEY_NAME} countersigns for the firm and everyone receives the final copy by email.`,
    nextFirm: `Next: ${ATTORNEY_NAME} countersigns for the firm, and you receive the final signed copy by email.`,
  },
  alreadySigned: {
    title: 'You have already signed this agreement.',
    body: `A copy will be emailed to you once everyone has signed. If you have a question, email ${FIRM_EMAIL}.`,
  },
} as const;

export const SCHEDULE_COPY = {
  eyebrow: FIRM_NAME,
  title: `Choose a time to meet with ${ATTORNEY_NAME}`,
  loading: 'Checking your link…',
  invalid: {
    title: 'This scheduling link is not valid or has expired.',
    body: `If you were expecting to book a consultation with ${FIRM_NAME}, email ${FIRM_EMAIL} and we will send a new link.`,
  },
  loadFailed: 'We could not load the open times.',
  forName: 'For',
  intro: (minutes: number) =>
    `Pick the time that suits you. We meet by video on Google Meet, and the conversation takes about ${minutes} minutes. You will get an email with the details and a calendar file.`,
  timezone: 'All times are Pacific time (California).',
  deviceZone: (zone: string) =>
    `Your device is set to ${zone}. Your local time is shown under each one.`,
  noSlots: `There are no open times right now. Email ${FIRM_EMAIL} and we will find one together.`,
  slotTaken: 'That time was just taken. Here are the times still open.',
  refreshing: 'Checking which times are still open…',
  picked: (when: string) => `You picked ${when}.`,
  change: 'Choose a different time',
  yourTime: 'your time',
  form: {
    heading: 'Your details',
    name: 'Your name',
    email: 'Email',
    emailHint: 'The confirmation and the video link go here.',
    phone: 'Phone',
    notes: 'Anything we should know before we talk?',
    notesHint: 'Names, dates, or a question you want to be sure we cover.',
    button: 'Book this time',
    busy: 'Booking…',
  },
  problems: {
    slot: 'Please choose a time first.',
    name: 'Please enter your name.',
    email: 'Please enter an email address we can send the details to.',
  },
  booked: {
    eyebrow: 'You are booked',
    title: (day: string) => `See you on ${day}.`,
    when: (day: string, time: string) => `${day} at ${time} Pacific time.`,
    meet: 'Open the Google Meet link',
    noMeet: 'The video link is in your email.',
    emailed: 'We emailed you the details and a calendar file.',
    haveReadyHeading: 'What to have ready',
    haveReadyIntro: 'You do not need everything. Bring what you have.',
    haveReadyGeneric: [
      'The trust or will, if you have a copy.',
      'Any letters or notices you received, with their dates.',
      'A short timeline: who died, when, and what changed.',
      'Your questions. Write them down so none get lost.',
    ],
    notLawyersYet:
      'A consultation does not make us your lawyers. That happens only when both sides sign an engagement agreement.',
  },
} as const;
