/**
 * IndexNow (https://www.indexnow.org): tells Bing and the other IndexNow engines
 * (Yandex, Seznam, Naver, Yep) which URLs changed, right after a deploy. Run by
 * .github/workflows/deploy.yml in two steps; both are continue-on-error, so a
 * failure here never fails or delays the deploy.
 *
 *   node scripts/indexnow.mjs plan [--sitemap out/sitemap.xml] [--live <url>]
 *     Before the deploy. Compares the freshly built sitemap with the live one (the
 *     previous deploy's) and plans the URLs that are new, whose <lastmod> changed,
 *     or that left the sitemap. If the live sitemap cannot be read, or the live key
 *     file is missing (the first run), it plans the whole sitemap. Prints the list
 *     and writes it to $GITHUB_OUTPUT as `urls` when that is set.
 *
 *   node scripts/indexnow.mjs submit [--urls '<json array>'] [--sitemap <file|url>] [--dry-run]
 *     After the deploy. POSTs { host, key, keyLocation, urlList } to
 *     api.indexnow.org and logs the response code. The list comes from --urls or
 *     $INDEXNOW_URLS (the plan); when neither is set it submits every URL in
 *     --sitemap (default: the live sitemap). --dry-run prints the payload and sends nothing.
 *
 * The key lives in src/config/site.ts `indexNowKey` and is served at /<key>.txt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const ENDPOINT = 'https://api.indexnow.org/indexnow';
/** IndexNow accepts up to 10,000 URLs per POST. */
export const MAX_URLS = 10_000;
const MEANING = {
  200: 'OK, URLs submitted',
  202: 'Accepted, key validation pending',
  400: 'Bad request',
  403: 'Key not valid (key file missing or wrong)',
  422: 'URLs do not belong to the host, or the key does not match',
  429: 'Too many requests',
};

/** The canonical host and IndexNow key from src/config/site.ts (the script runs without a TS loader). */
export function readSiteConfig(source) {
  const host = /canonicalHost:\s*'(https:\/\/[^']+)'/.exec(source)?.[1];
  const key = /indexNowKey:\s*'([0-9a-f]{32})'/.exec(source)?.[1];
  if (!host || !key) throw new Error('site.ts: canonicalHost or indexNowKey not found');
  return { canonicalHost: host.replace(/\/$/, ''), key };
}

/** <url> entries of a sitemap, in order: [{ loc, lastmod }] (lastmod '' when absent). */
export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(([, block]) => ({
      loc: /<loc>\s*([^<]+?)\s*<\/loc>/.exec(block)?.[1] ?? '',
      lastmod: /<lastmod>\s*([^<]+?)\s*<\/lastmod>/.exec(block)?.[1] ?? '',
    }))
    .filter((entry) => entry.loc);
}

/** URLs that are new or whose lastmod changed since `previous`, then URLs that left the sitemap. */
export function changedUrls(current, previous) {
  const before = new Map(previous.map((entry) => [entry.loc, entry.lastmod]));
  const now = new Set(current.map((entry) => entry.loc));
  const changed = current
    .filter((entry) => before.get(entry.loc) !== entry.lastmod)
    .map((entry) => entry.loc);
  const removed = previous.filter((entry) => !now.has(entry.loc)).map((entry) => entry.loc);
  return [...changed, ...removed];
}

/** The POST body. Every URL must be on the canonical host (IndexNow answers 422 otherwise). */
export function buildPayload({ canonicalHost, key, urls }) {
  const host = new URL(canonicalHost).host;
  const foreign = urls.filter((url) => new URL(url).host !== host);
  if (foreign.length > 0) throw new Error(`not on ${host}: ${foreign.join(', ')}`);
  const urlList = [...new Set(urls)];
  if (urlList.length > MAX_URLS) throw new Error(`${urlList.length} URLs, max ${MAX_URLS}`);
  return { host, key, keyLocation: `${canonicalHost}/${key}.txt`, urlList };
}

function option(args, name) {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
}

async function load(source) {
  if (!/^https?:\/\//.test(source)) return fs.readFileSync(source, 'utf8');
  const response = await fetch(source, { headers: { 'cache-control': 'no-cache' } });
  if (!response.ok) throw new Error(`${source}: HTTP ${response.status}`);
  return response.text();
}

/** True when the live site already serves the key file (false on the first run). */
async function keyIsLive({ canonicalHost, key }) {
  try {
    return (await load(`${canonicalHost}/${key}.txt`)).trim() === key;
  } catch {
    return false;
  }
}

async function plan(args, config) {
  const current = parseSitemap(await load(option(args, '--sitemap') ?? 'out/sitemap.xml'));
  if (current.length === 0) throw new Error('the new sitemap lists no URLs');
  let urls = current.map((entry) => entry.loc);
  let reason = 'whole sitemap';
  try {
    const live = parseSitemap(
      await load(option(args, '--live') ?? `${config.canonicalHost}/sitemap.xml`),
    );
    if (live.length === 0) throw new Error('the live sitemap lists no URLs');
    if (!(await keyIsLive(config))) throw new Error('the key file is not live yet (first run)');
    urls = changedUrls(current, live);
    reason = `changed against the live sitemap (${live.length} URLs)`;
  } catch (error) {
    reason = `whole sitemap: ${error.message}`;
  }
  console.log(`IndexNow plan: ${urls.length} of ${current.length} URLs, ${reason}`);
  for (const url of urls) console.log(`  ${url}`);
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `urls=${JSON.stringify(urls)}\n`);
}

/** The planned list, or null when there is no plan (submit the whole sitemap then). */
function plannedUrls(args) {
  const raw = option(args, '--urls') ?? process.env.INDEXNOW_URLS ?? '';
  if (raw.trim() === '') return null;
  const urls = JSON.parse(raw);
  if (!Array.isArray(urls) || urls.some((url) => typeof url !== 'string'))
    throw new Error('the URL list must be a JSON array of strings');
  return urls;
}

async function submit(args, config) {
  let urls = plannedUrls(args);
  if (urls === null) {
    const source = option(args, '--sitemap') ?? `${config.canonicalHost}/sitemap.xml`;
    urls = parseSitemap(await load(source)).map((entry) => entry.loc);
    console.log(`IndexNow: no plan, submitting all ${urls.length} URLs in ${source}`);
  }
  if (urls.length === 0) {
    console.log('IndexNow: no URL changed in this deploy; nothing submitted.');
    return 0;
  }
  const payload = buildPayload({ ...config, urls });
  if (args.includes('--dry-run')) {
    console.log(`IndexNow dry run: would POST to ${ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return 0;
  }
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const meaning = MEANING[response.status] ?? 'Unexpected response';
  console.log(`IndexNow: HTTP ${response.status} (${meaning}) for ${payload.urlList.length} URLs`);
  const body = (await response.text()).trim();
  if (body) console.log(body.slice(0, 500));
  return response.ok ? 0 : 1;
}

async function main(args) {
  const config = readSiteConfig(
    fs.readFileSync(path.join(process.cwd(), 'src', 'config', 'site.ts'), 'utf8'),
  );
  if (args[0] === 'plan') return plan(args, config).then(() => 0);
  if (args[0] === 'submit') return submit(args, config);
  console.error('usage: node scripts/indexnow.mjs plan|submit [--dry-run] (see the file header)');
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(`IndexNow: ${error.message}`);
      process.exit(1);
    },
  );
}
