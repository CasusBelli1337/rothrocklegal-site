import type { BrowserInfo, BrowserKind } from './browser';

/**
 * Every microphone string: the button, the listening line, the one-sentence
 * warning before the browser asks, and the three cards (no microphone, blocked,
 * unsupported). Re-exported from copy.ts so the hygiene tests see it.
 */

export const CONSULT_PAGE_SHORT_URL = 'www.rothrocklegal.com/request-a-consult/';

export const MIC_COPY = {
  speak: 'Speak instead of typing',
  record: 'Record a voice note',
  stop: 'Stop',
  checking: 'Checking for a microphone…',
  listening: 'Listening… your words appear below as we hear them.',
  listeningRecordOnly: 'Listening… we are recording your voice note. Press Stop when you are done.',
  prompt: 'Your browser will ask to use the microphone. Choose Allow.',
  asking:
    'Look for a small message from your browser, usually near the top of the window, and choose Allow.',
  busy: 'Something else is using the microphone. Close other apps or tabs that might be using it, then try again.',
  noConnection:
    'Turning speech into text needs an internet connection. Check your connection and try again, or keep typing.',
  stopped: 'The microphone stopped. Press the button to continue, or keep typing.',
  couldNotStart: 'We could not start the microphone. You can keep typing.',
  tryAgain: 'Try again',
  keepTyping: 'Typing works just as well. Nothing you have written is lost.',
} as const;

export const MIC_UNSUPPORTED = {
  title: 'This browser cannot record.',
  body: 'You can keep typing, or use your phone with the same email. Open this page on your phone, type the same email address, and we will join the two together.',
} as const;

export const MIC_NO_DEVICE = {
  title: 'We could not find a microphone on this computer.',
  body: 'You can keep typing. Or open this page on your phone: type the same email address there and we will join the two together.',
  urlLabel: 'On your phone, go to',
} as const;

export const MIC_DENIED = {
  title: 'The microphone is blocked for this page.',
  lead: 'That is easy to fix, and takes about a minute. Here is how in',
  afterSteps: 'Then come back here and press Try again.',
} as const;

export const BROWSER_NAMES: Record<BrowserKind, string> = {
  'chrome-desktop': 'Chrome',
  edge: 'Microsoft Edge',
  'safari-mac': 'Safari on a Mac',
  firefox: 'Firefox',
  'safari-ios': 'Safari on an iPhone or iPad',
  'chrome-android': 'Chrome on Android',
  samsung: 'Samsung Internet',
  unknown: 'your browser',
};

/** Where the microphone switch lives, one browser at a time. Checked against the 2025 and 2026 layouts. */
const STEPS: Record<BrowserKind, readonly string[]> = {
  'chrome-desktop': [
    'Look at the top of the window, just left of the web address. Click the small icon there. It looks like a lock or two little sliders.',
    'In the menu that opens, find Microphone and switch it on. If you see a list, choose Allow.',
    'Close the menu. If Chrome shows a Reload button near the top, click it.',
  ],
  edge: [
    'Click the lock icon just left of the web address at the top of the window.',
    'Click Permissions for this site.',
    'Next to Microphone, choose Allow.',
    'Close the menu. If Edge shows a Refresh button, click it.',
  ],
  'safari-mac': [
    'In the menu bar at the very top of your screen, click Safari.',
    'Click Settings for rothrocklegal.com (older Safari says Settings for This Website).',
    'Next to Microphone, choose Allow.',
    'Click anywhere on the page to close the small window.',
  ],
  firefox: [
    'Look just left of the web address for a microphone icon with a line through it, or a lock.',
    'Click it. Next to Use the Microphone, you will see Blocked with a small X. Click the X.',
    'Press Try again below. Firefox asks once more: choose Allow. You can tick Remember this decision.',
  ],
  'safari-ios': [
    'Tap the small icon at the left end of the address bar. It says aA, or looks like two little sliders.',
    'Tap Website Settings.',
    'Tap Microphone, then tap Allow.',
    'Tap Done.',
    'If the microphone still does not start, open the Settings app on your iPhone or iPad, scroll to Safari, tap Microphone, and choose Ask or Allow.',
  ],
  'chrome-android': [
    'Tap the lock icon (or the sliders icon) just left of the web address.',
    'Tap Permissions.',
    'Tap Microphone and choose Allow.',
    'If Microphone is not listed, open your phone’s Settings app, tap Apps, tap Chrome, tap Permissions, and allow Microphone.',
  ],
  samsung: [
    'Tap the lock icon just left of the web address.',
    'Tap Permissions.',
    'Turn on Microphone.',
    'If Microphone is not listed, open your phone’s Settings app, tap Apps, tap Samsung Internet, tap Permissions, and allow Microphone.',
  ],
  unknown: [
    'Look for a small lock, aA, or settings icon next to the web address at the top of the screen.',
    'Tap or click it and find Microphone.',
    'Choose Allow. Reload the page if the browser asks you to.',
  ],
};

const PHONE_SETTINGS_HINT =
  'If that does not work, open your phone’s Settings app, find your browser in the list of apps, and turn on Microphone.';

/** The numbered steps for this browser; phones with an unknown browser also get the Settings-app hint. */
export function micSteps(browser: BrowserInfo): readonly string[] {
  const steps = STEPS[browser.kind];
  if (browser.kind === 'unknown' && browser.device !== 'desktop')
    return [...steps, PHONE_SETTINGS_HINT];
  return steps;
}
