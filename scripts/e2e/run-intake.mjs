// End-to-end drive of the consult flow in Arthur's Chrome (remote debugging on
// localhost:9222; `curl` is denied here, so everything goes through node fetch and
// raw CDP). Chrome runs on Windows, so file paths handed to the file input are
// Windows paths. Never commit client materials: point the env vars at a folder
// outside the repo.
//   INTAKE_BASE=http://localhost:9080/_preview   (default; the editor preview)
//   INTAKE_STORY_FILE=/path/to/story.txt         (default: a short built-in story)
//   INTAKE_FILES_DIR='C:\\Users\\rothr\\Downloads\\folder\\'  (Windows path; default: no uploads)
//   INTAKE_FILES='a.pdf;b.docx'                  (names inside that folder)
// Usage: node scripts/e2e/run-intake.mjs [email]   (screenshots land in scripts/e2e/shots, git-ignored)
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { openTab, closeTab, attachTarget } from './cdp-lib.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const SHOTS = `${HERE}shots`;
mkdirSync(SHOTS, { recursive: true });
const BASE = process.env.INTAKE_BASE ?? 'http://localhost:9080/_preview';
const EMAIL = process.argv[2] ?? 'arothrock@rothrocklegal.com';
const DEFAULT_STORY =
  'My father died in Los Gatos on March 2, 2026. My sister is the trustee. In January she sent me a letter ' +
  'saying the trust was amended in 2025 to leave her the house and most of the accounts. Dad had dementia ' +
  'by then and she lived with him and handled his money. I have not seen the trust itself, only her letter.';
const STORY = process.env.INTAKE_STORY_FILE && existsSync(process.env.INTAKE_STORY_FILE)
  ? readFileSync(process.env.INTAKE_STORY_FILE, 'utf8').trim()
  : DEFAULT_STORY;
const WIN = process.env.INTAKE_FILES_DIR ?? '';
const FILES = WIN ? (process.env.INTAKE_FILES ?? '').split(';').filter(Boolean).map((f) => WIN + f) : [];

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
let n = 0;
const target = await openTab(`${BASE}/request-a-consult/`);
const page = await attachTarget(target);
const shot = async (name) => {
  n += 1;
  const f = `${SHOTS}/${String(n).padStart(2, '0')}-${name}.png`;
  await page.shot(f);
  log('shot', f, 'scrollY', await page.scrollY());
};
const heading = () => page.evaluate(`(document.getElementById('intake-step-heading')||{}).innerText || ''`);
const primary = async (label) => {
  await page.clickText('button', label);
  await page.wait(700);
};
const panelTop = () => page.evaluate(`(() => { const p = document.querySelector('.intake-flow'); return p ? Math.round(p.getBoundingClientRect().top) : null; })()`);

try {
  await page.setViewport(1366, 768);
  await page.wait(4000);
  await page.evaluate(`localStorage.removeItem('rl-intake')`);
  await page.navigate(`${BASE}/request-a-consult/`);
  await page.waitFor(`document.querySelector('.intake-flow') && document.body.innerText.includes('Before we start')`, 60000);
  log('start tile 1:', await heading());
  await shot('start-tile-1');
  log('page scrollHeight', await page.evaluate('document.documentElement.scrollHeight'), 'viewport 768');

  await primary('Got it');
  await shot('start-tile-2');
  await primary('Next');
  await shot('start-tile-3');
  await page.evaluate(`document.querySelectorAll('.intake-flow input[type=checkbox]').forEach(c => { if (!c.checked) c.click(); })`);
  await page.wait(300);
  await primary('Start');
  await page.waitFor(`document.querySelector('#contact-name')`, 30000);
  log('after Start: heading', await heading(), 'scrollY', await page.scrollY(), 'panelTop', await panelTop());
  await shot('contact');

  await page.setValue('#contact-name', 'James L. Sorden');
  await page.setValue('#contact-email', EMAIL);
  await page.evaluate(`document.querySelector('#contact-email').blur()`);
  await page.wait(1500);
  await primary('Continue');
  await page.wait(1500);
  if (await page.evaluate(`document.body.innerText.includes('Started this before')`)) {
    await shot('lookup-card');
    await primary('Continue');
  }
  await page.waitFor(`document.querySelector('#story')`, 30000);
  log('story: heading', await heading(), 'scrollY', await page.scrollY());
  await shot('story');
  await page.setValue('#story', STORY);
  await page.wait(1200);
  await primary('Continue');
  log('triage started');
  await shot('triage-reading');
  const t0 = Date.now();
  await page.waitFor(`document.body.innerText.includes('what we understood') || document.body.innerText.includes('Pick everything')`, 180000, 1000);
  log('triage done in', Math.round((Date.now() - t0) / 1000), 's');
  await shot('situations');
  log('situations text:', (await page.text()).split('\n').filter((l) => l.trim()).slice(0, 40).join(' | ').slice(0, 1500));
  await primary('Continue');
  await page.waitFor(`document.querySelector('input[type=file]')`, 30000);
  await shot('documents');
  if (FILES.length > 0) {
    await page.setFiles('input[type=file]', FILES);
    log('files staged');
    await page.waitFor(`(document.body.innerText.match(/Sent ·/g)||[]).length >= ${FILES.length}`, 240000, 2000);
    log('all uploads done');
  }
  await shot('documents-uploaded');
  await primary('Continue');
  log('evaluation started');
  await page.wait(2000);
  await shot('evaluation-reading');
  const t1 = Date.now();
  await page.waitFor(`document.body.innerText.includes('Who is involved')`, 900000, 3000);
  log('evaluation done in', Math.round((Date.now() - t1) / 1000), 's');
  await shot('parties');
  log('parties text:', (await page.text()).split('\n').filter((l) => l.trim()).slice(0, 60).join(' | ').slice(0, 2500));
  await primary('Continue');
  await page.waitFor(`document.body.innerText.includes('Scope') || document.body.innerText.includes('pay')`, 30000);
  await shot('scope');
  log('scope text:', (await page.text()).split('\n').filter((l) => l.trim()).slice(0, 40).join(' | ').slice(0, 1500));
  await page.clickText('label, button', 'hourly').catch(() => page.clickText('label, button', 'Hourly'));
  await primary('Continue');
  await page.wait(1000);
  const h = await heading();
  log('after scope: heading', h);
  await shot('after-scope');
  if (!h.includes('Check and send')) {
    log('follow-up text:', (await page.text()).split('\n').filter((l) => l.trim()).slice(0, 80).join(' | ').slice(0, 4000));
    await primary('Continue');
    await page.waitFor(`document.body.innerText.includes('Check and send')`, 30000);
  }
  await shot('review');
  log('review text:', (await page.text()).split('\n').filter((l) => l.trim()).slice(0, 60).join(' | ').slice(0, 2500));
  await primary('Send');
  await page.waitFor(`(document.getElementById('intake-step-heading')||{}).innerText.includes('Thank you')`, 120000, 1000);
  await page.wait(800);
  await shot('done');
  log('done text:', (await page.text()).split('\n').filter((l) => l.trim()).slice(0, 30).join(' | ').slice(0, 1500));
} catch (e) {
  log('ERROR', e.message);
  await shot('error').catch(() => undefined);
  log('body:', (await page.text().catch(() => '')).slice(0, 3000));
}
page.close();
await closeTab(target.id);
process.exit(0);
