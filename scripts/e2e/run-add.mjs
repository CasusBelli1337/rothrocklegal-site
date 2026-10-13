// End-to-end drive of "Add to your request" (/request-a-consult/add/) in Arthur's
// Chrome (remote debugging on localhost:9222; `curl` is denied here, so this uses
// node fetch and raw CDP through cdp-lib.mjs). Two runs make one test:
//
// 1. Ask for a link:   node scripts/e2e/run-add.mjs <email>
//    Types the address, presses "Email me a link", and screenshots the uniform card.
//    The module then emails `<site>/request-a-consult/add/?t=<token>` to that address
//    (one use, 24 hours). Copy the link (or just its token) from that email. With SMTP
//    off, the module keeps the message as a pending notification on the request: read
//    it on the admin page (http://localhost:9080/tools/intake/, the request's
//    Notifications) or in GET /api/intake/admin/intakes/<id> with the service token.
//
// 2. Add to the request:   node scripts/e2e/run-add.mjs <email> <token or full link>
//    Opens the link on the preview, types a note, uploads the files below, reloads the
//    page to prove the note and the files come back, presses Send, checks the done
//    screen, and reloads once more to prove the done screen stays.
//
// Environment:
//   INTAKE_BASE=http://localhost:9080/_preview   (default; the editor preview, which
//                                                  reaches the module at /api/intake/*)
//   ADD_NOTE='...'                               (default: a short built-in note)
//   ADD_FILES_DIR='C:\\Users\\rothr\\Downloads\\folder\\'   (a Windows folder) or a local
//                 folder such as /home/me/test-docs/ (turned into \\wsl.localhost\<distro>\...
//                 for Chrome on Windows; /mnt/c/... becomes C:\...). Default: no uploads.
//   ADD_FILES='a.pdf;b.jpg'                      (names inside that folder)
// Screenshots land in scripts/e2e/shots/ (git-ignored) as add-NN-<step>.png. Exits 1 on
// any failure. Never point it at client materials or a real request.
import { mkdirSync } from 'node:fs';
import { attachTarget, closeTab, openTab } from './cdp-lib.mjs';

const HERE = new URL('.', import.meta.url).pathname;
const SHOTS = `${HERE}shots`;
mkdirSync(SHOTS, { recursive: true });
const BASE = process.env.INTAKE_BASE ?? 'http://localhost:9080/_preview';
const PAGE = `${BASE}/request-a-consult/add/`;
const [EMAIL, LINK] = process.argv.slice(2);
const NOTE =
  process.env.ADD_NOTE ??
  'I found the letter from the trustee dated January 9, 2026. My aunt Rosa Delgado also has a copy of the 2019 trust.';

/** Chrome runs on Windows: hand it Windows paths for files that live in WSL. */
function windowsPath(p) {
  if (/^[A-Za-z]:\\/.test(p) || p.startsWith('\\\\')) return p;
  const drive = /^\/mnt\/([a-z])\/(.*)$/.exec(p);
  if (drive) return `${drive[1].toUpperCase()}:\\${drive[2].replaceAll('/', '\\')}`;
  const distro = process.env.WSL_DISTRO_NAME ?? 'Ubuntu';
  return `\\\\wsl.localhost\\${distro}${p.replaceAll('/', '\\')}`;
}
const DIR = process.env.ADD_FILES_DIR ?? '';
const FILES = DIR
  ? (process.env.ADD_FILES ?? '')
      .split(';')
      .filter(Boolean)
      .map((f) => windowsPath(DIR + f))
  : [];

if (!EMAIL) {
  console.error('Usage: node scripts/e2e/run-add.mjs <email> [token or link]');
  process.exit(1);
}
const tokenOf = (value) => {
  if (!value) return null;
  const match = /[?&]t=([A-Za-z0-9_-]+)/.exec(value);
  return match ? match[1] : value.trim();
};
const TOKEN = tokenOf(LINK);

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const target = await openTab(PAGE);
const page = await attachTarget(target);
let n = 0;
const shot = async (name) => {
  n += 1;
  const f = `${SHOTS}/add-${String(n).padStart(2, '0')}-${name}.png`;
  await page.shot(f);
  log('shot', f);
};
const heading = () =>
  page.evaluate(`(document.getElementById('add-step-heading')||{}).innerText || ''`);
const bodyLines = async (max = 40) =>
  (await page.text())
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, max)
    .join(' | ');
const alertText = () =>
  page.evaluate(`(document.querySelector('[role=alert]')||{}).innerText || ''`);

async function askForLink() {
  await page.navigate(PAGE);
  await page.waitFor(`document.querySelector('#add-email')`, 60000);
  log('ask screen:', await heading());
  await shot('ask');
  await page.setValue('#add-email', EMAIL);
  await page.clickText('button', 'Email me a link');
  await page.waitFor(`document.body.innerText.includes('Check your email')`, 30000);
  await shot('asked-card');
  log('card:', await bodyLines(30));
}

async function uploadFiles() {
  if (FILES.length === 0) return;
  log('uploading', FILES.length, 'file(s)');
  await page.setFiles('input[type=file]', FILES);
  const done = `${FILES.length} of ${FILES.length} uploaded`;
  await page.waitFor(`document.body.innerText.includes(${JSON.stringify(done)})`, 180000, 1000);
  log('uploads done:', done);
}

async function openAndFill() {
  await page.navigate(`${PAGE}?t=${encodeURIComponent(TOKEN)}`);
  await page.waitFor(
    `document.querySelector('#add-note') || document.querySelector('#add-email') || /no longer|wait before/i.test(document.body.innerText)`,
    60000,
  );
  if (!(await page.evaluate(`Boolean(document.querySelector('#add-note'))`))) {
    await shot('open-refused');
    throw new Error(`the link did not open an addition: ${await bodyLines(20)}`);
  }
  if ((await page.url()).includes('t=')) throw new Error('the token was left in the address bar');
  log('open screen:', await heading());
  await shot('open');
  await page.setValue('#add-note', NOTE);
  await uploadFiles();
  await page.waitFor(`document.body.innerText.includes('Saved')`, 15000);
  await shot('filled');
}

async function reloadKeepsWork() {
  await page.navigate(`${PAGE}`);
  await page.waitFor(`document.querySelector('#add-note')`, 30000);
  const note = await page.evaluate(`document.querySelector('#add-note').value`);
  if (note !== NOTE) throw new Error(`after a reload the note reads ${JSON.stringify(note)}`);
  if (FILES.length) {
    const done = `${FILES.length} of ${FILES.length} uploaded`;
    await page.waitFor(`document.body.innerText.includes(${JSON.stringify(done)})`, 15000);
  }
  log('reload kept the note and', FILES.length, 'file(s)');
  await shot('after-reload');
}

async function sendAndCheck() {
  await page.clickText('button', 'Send');
  await page.waitFor(
    `(document.getElementById('add-step-heading')||{}).innerText.includes('Added to your request') || document.querySelector('[role=alert]')`,
    60000,
    1000,
  );
  if (!(await heading()).includes('Added to your request')) {
    await shot('send-failed');
    throw new Error(`Send failed: ${await alertText()}`);
  }
  await page.wait(600);
  await shot('done');
  log('done:', await bodyLines(25));
  await page.navigate(`${PAGE}`);
  await page.waitFor(
    `(document.getElementById('add-step-heading')||{}).innerText.includes('Added to your request')`,
    30000,
  );
  await shot('done-after-reload');
}

let failed = false;
try {
  await page.setViewport(1366, 768);
  await page.wait(1500);
  await page.evaluate(`sessionStorage.removeItem('rl-intake-add')`).catch(() => undefined);
  if (!TOKEN) await askForLink();
  else {
    await openAndFill();
    await reloadKeepsWork();
    await sendAndCheck();
  }
  log('OK');
} catch (e) {
  failed = true;
  log('ERROR', e.message);
  await shot('error').catch(() => undefined);
  log('body:', await bodyLines(60).catch(() => ''));
}
page.close();
await closeTab(target.id);
process.exit(failed ? 1 : 0);
