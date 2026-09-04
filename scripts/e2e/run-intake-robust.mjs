// Robustness drive of the consult flow (a sibling of run-intake.mjs): many files,
// a live upload count, and the "Keep going while we finish reading" path. Same
// mechanics (Arthur's Chrome over CDP on localhost:9222, node fetch, Windows paths
// for the file chooser). Env:
//   INTAKE_BASE=http://localhost:9080/_preview       (default; the editor preview)
//   INTAKE_STORY_FILE=/path/to/story.txt             (default: a short built-in story)
//   INTAKE_FILES_DIR='C:\\Users\\rothr\\Downloads\\folder\\'  (Windows path; default: no uploads)
//   INTAKE_FILES='a.pdf;b.docx'                      (names inside that folder)
//   INTAKE_FILES_LIST=/path/to/list.txt              (one name per line; alternative to INTAKE_FILES)
//   INTAKE_KEEP_GOING=1                              (press "Keep going" when the evaluation runs long)
//   INTAKE_SHOTS=/dir/for/screenshots                (default scripts/e2e/shots)
//   INTAKE_VIEWPORT=390x844                          (default 1366x768; a phone size shows the sticky bar)
// Usage: node scripts/e2e/run-intake-robust.mjs [email]
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { openTab, closeTab, attachTarget } from './cdp-lib.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const SHOTS = process.env.INTAKE_SHOTS ?? `${HERE}shots`;
mkdirSync(SHOTS, { recursive: true });
const BASE = process.env.INTAKE_BASE ?? 'http://localhost:9080/_preview';
const EMAIL = process.argv[2] ?? 'intake-robust-qa@example.invalid';
const KEEP_GOING = process.env.INTAKE_KEEP_GOING === '1';
const DEFAULT_STORY =
  'My father died in Los Gatos on March 2, 2026. My sister is the trustee. In January she sent me a letter ' +
  'saying the trust was amended in 2025 to leave her the house and most of the accounts. Dad had dementia ' +
  'by then and she lived with him and handled his money. I have not seen the trust itself, only her letter.';
const STORY = process.env.INTAKE_STORY_FILE && existsSync(process.env.INTAKE_STORY_FILE)
  ? readFileSync(process.env.INTAKE_STORY_FILE, 'utf8').trim()
  : DEFAULT_STORY;
const WIN = process.env.INTAKE_FILES_DIR ?? '';
const NAMES = process.env.INTAKE_FILES_LIST
  ? readFileSync(process.env.INTAKE_FILES_LIST, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean)
  : (process.env.INTAKE_FILES ?? '').split(';').filter(Boolean);
const FILES = WIN ? NAMES.map((f) => WIN + f) : [];

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const secs = (t) => `${Math.round((Date.now() - t) / 1000)} s`;
let n = 0;
const target = await openTab(`${BASE}/request-a-consult/`);
const page = await attachTarget(target);
const shot = async (name) => {
  n += 1;
  const f = `${SHOTS}/${String(n).padStart(2, '0')}-${name}.png`;
  await page.shot(f);
  log('shot', f);
};
const heading = () => page.evaluate(`(document.getElementById('intake-step-heading')||{}).innerText || ''`);
const primary = async (label) => {
  await page.clickText('button', label);
  await page.wait(700);
};
const lines = async (max, from = 0) =>
  (await page.text()).split('\n').filter((l) => l.trim()).slice(from, from + max).join(' | ');
const timings = {};

try {
  const [vw, vh] = (process.env.INTAKE_VIEWPORT ?? '1366x768').split('x').map(Number);
  await page.setViewport(vw, vh);
  await page.wait(3000);
  await page.evaluate(`localStorage.removeItem('rl-intake')`);
  await page.navigate(`${BASE}/request-a-consult/`);
  await page.waitFor(`document.querySelector('.intake-flow') && document.body.innerText.includes('Before we start')`, 60000);
  await shot('start');
  await primary('Got it');
  await primary('Next');
  await page.evaluate(`document.querySelectorAll('.intake-flow input[type=checkbox]').forEach(c => { if (!c.checked) c.click(); })`);
  await page.wait(300);
  await primary('Start');
  await page.waitFor(`document.querySelector('#contact-name')`, 30000);
  await page.setValue('#contact-name', 'James L. Sorden');
  await page.setValue('#contact-email', EMAIL);
  await page.evaluate(`document.querySelector('#contact-email').blur()`);
  await page.wait(1500);
  await primary('Continue');
  await page.wait(1500);
  if (await page.evaluate(`document.body.innerText.includes('Started this before')`)) await primary('Continue');
  await page.waitFor(`document.querySelector('#story')`, 30000);
  await page.setValue('#story', STORY);
  await page.wait(1200);
  await primary('Continue');
  const t0 = Date.now();
  await page.waitFor(`document.body.innerText.includes('what we understood') || document.body.innerText.includes('Pick everything')`, 180000, 1000);
  timings.triage = secs(t0);
  log('triage done in', timings.triage);
  await shot('situations');
  await primary('Continue');
  await page.waitFor(`document.querySelector('input[type=file]')`, 30000);
  await shot('documents-empty');

  if (FILES.length > 0) {
    const t1 = Date.now();
    await page.setFiles('input[type=file]', FILES);
    log('files staged:', FILES.length);
    await page.wait(4000);
    await shot('documents-uploading');
    // Done when no row shows a percentage or a retry, whatever the outcome of each file.
    await page.waitFor(
      `!/\\b\\d{1,3}%/.test(document.body.innerText) && !document.body.innerText.includes('Trying again') && /\\d+ of \\d+ uploaded/.test(document.body.innerText)`,
      3_600_000,
      3000,
    );
    timings.uploads = secs(t1);
    const count = await page.evaluate(`(document.body.innerText.match(/\\d+ of \\d+ uploaded[^\\n]*/)||[''])[0]`);
    log('uploads settled in', timings.uploads, ':', count);
    const failed = await page.evaluate(
      `[...document.querySelectorAll('.intake-flow li')].filter(li => li.innerText.includes('Could not upload')).map(li => li.innerText.replace(/\\n/g,' · ')).join('\\n')`,
    );
    if (failed) log('not uploaded:\n' + failed);
    timings.uploadCount = count;
    timings.notUploaded = failed ? failed.split('\n').length : 0;
  }
  // Bring the live count line (and any "Could not upload" rows) into the frame before the shot.
  await page.evaluate(`(() => { const el = [...document.querySelectorAll('.intake-flow p')].find(p => /\\d+ of \\d+ uploaded/.test(p.innerText)); if (el) el.scrollIntoView({ block: 'center' }); })()`).catch(() => undefined);
  await page.wait(400);
  await shot('documents-uploaded');
  await primary('Continue');
  const t2 = Date.now();
  await page.wait(2500);
  await shot('evaluation-reading');
  await page.waitFor(
    `document.body.innerText.includes('Who is involved') || document.body.innerText.includes('Keep going while we finish reading')`,
    900000,
    3000,
  );
  const keepGoingShown = await page.evaluate(`document.body.innerText.includes('Keep going while we finish reading')`);
  if (keepGoingShown) {
    timings.keepGoingOfferedAfter = secs(t2);
    log('keep-going offered after', timings.keepGoingOfferedAfter);
    await shot('keep-going-offered');
    if (KEEP_GOING) {
      await primary('Keep going while we finish reading');
      timings.keepGoingPressed = true;
    } else {
      await page.waitFor(`document.body.innerText.includes('Who is involved')`, 1_800_000, 3000);
    }
  }
  await page.waitFor(`document.body.innerText.includes('Who is involved')`, 60000, 1000);
  timings.evaluationScreen = secs(t2);
  log('parties screen after', timings.evaluationScreen);
  await shot('parties');
  log('parties:', (await lines(30)).slice(0, 1500));
  if (await page.evaluate(`document.body.innerText.includes('Add at least one name') || document.querySelectorAll('input[id^=party-]').length === 0`)) {
    await page.setValue('#party-0-name', 'Carol E. Sordenstone');
  }
  await primary('Continue');
  await page.wait(800);
  if (await page.evaluate(`document.body.innerText.includes('Add at least one name')`)) {
    await page.setValue('#party-0-name', 'Carol E. Sordenstone');
    await primary('Continue');
  }
  await page.waitFor(`document.body.innerText.includes('Scope and cost')`, 30000);
  await shot('scope');
  await page.clickText('label, button', 'hourly').catch(() => page.clickText('label, button', 'Hourly'));
  await primary('Continue');
  await page.wait(1000);
  const h = await heading();
  log('after scope:', h);
  if (!h.includes('Check and send')) {
    await shot('follow-up');
    await primary('Continue');
    await page.waitFor(`document.body.innerText.includes('Check and send')`, 30000);
  }
  await shot('review');
  const t3 = Date.now();
  await primary('Send');
  await page.waitFor(`(document.getElementById('intake-step-heading')||{}).innerText.includes('Thank you')`, 120000, 1000);
  timings.send = secs(t3);
  await page.wait(800);
  await shot('done');
  const reference = await page.evaluate(`(document.body.innerText.match(/RL-\\d{4}-\\d{6}/)||[''])[0]`);
  timings.reference = reference;
  log('DONE', JSON.stringify(timings));
} catch (e) {
  log('ERROR', e.message);
  await shot('error').catch(() => undefined);
  log('body:', (await page.text().catch(() => '')).slice(0, 3000));
}
page.close();
await closeTab(target.id);
process.exit(0);
