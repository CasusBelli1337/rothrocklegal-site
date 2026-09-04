// Raw-CDP helpers for driving Arthur's Windows Chrome (localhost:9222) from WSL.
// One page target per script; every script must call close() and process.exit().
import { writeFileSync } from 'node:fs';

const CDP = 'http://localhost:9222';

export async function openTab(url) {
  const res = await fetch(`${CDP}/json/new?${url}`, { method: 'PUT' });
  const target = await res.json();
  return target;
}

export async function closeTab(id) {
  await fetch(`${CDP}/json/close/${id}`).catch(() => undefined);
}

export async function attachTarget(target) {
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  };
  const send = (method, params = {}, timeoutMs = 60000) =>
    new Promise((res, rej) => {
      const myId = ++id;
      pending.set(myId, { res, rej });
      ws.send(JSON.stringify({ id: myId, method, params }));
      setTimeout(() => {
        if (pending.has(myId)) {
          pending.delete(myId);
          rej(new Error(`${method} timed out`));
        }
      }, timeoutMs);
    });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails)
      throw new Error(r.exceptionDetails.text + ' ' + (r.result?.description || '') + ' :: ' + expression.slice(0, 120));
    return r.result?.value;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const text = () => evaluate('document.body.innerText || ""');
  const url = () => evaluate('location.href');
  const navigate = async (u) => {
    await send('Page.enable');
    await send('Page.navigate', { url: u });
    await wait(1500);
  };
  const setViewport = async (width = 1366, height = 768) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  };
  const shot = async (file) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(file, Buffer.from(r.data, 'base64'));
    return file;
  };
  /** Waits until the predicate expression returns truthy, polling. */
  const waitFor = async (expression, timeoutMs = 30000, every = 500) => {
    const start = Date.now();
    for (;;) {
      const v = await evaluate(`Boolean(${expression})`).catch(() => false);
      if (v) return v;
      if (Date.now() - start > timeoutMs) throw new Error(`waitFor timed out: ${expression.slice(0, 100)}`);
      await wait(every);
    }
  };
  const click = async (selector) => {
    const ok = await evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.scrollIntoView({block:'center'}); el.click(); return true; })()`,
    );
    if (!ok) throw new Error(`click: no element for ${selector}`);
  };
  /** Clicks the first element matching selector whose text includes needle. */
  const clickText = async (selector, needle) => {
    const ok = await evaluate(
      `(() => { const els = [...document.querySelectorAll(${JSON.stringify(selector)})]; const el = els.find(e => (e.innerText||'').trim().includes(${JSON.stringify(needle)})); if (!el) return false; el.scrollIntoView({block:'center'}); el.click(); return true; })()`,
    );
    if (!ok) throw new Error(`clickText: no ${selector} containing "${needle}"`);
  };
  /** Sets a React-controlled input/textarea value through the native setter so React sees it. */
  const setValue = async (selector, value) => {
    const ok = await evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.focus(); const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; const setter = Object.getOwnPropertyDescriptor(proto, 'value').set; setter.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`,
    );
    if (!ok) throw new Error(`setValue: no element for ${selector}`);
  };
  /** Attaches Windows-side files to a file input (Chrome resolves the paths on the Windows host). */
  const setFiles = async (selector, windowsPaths) => {
    const doc = await send('DOM.getDocument', { depth: 0 });
    const node = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector });
    if (!node.nodeId) throw new Error(`setFiles: no element for ${selector}`);
    await send('DOM.setFileInputFiles', { nodeId: node.nodeId, files: windowsPaths });
  };
  const scrollY = () => evaluate('window.scrollY');
  const close = () => ws.close();
  return { send, evaluate, wait, text, url, navigate, setViewport, shot, waitFor, click, clickText, setValue, setFiles, scrollY, close, target, listeners };
}
