// Polite HTTP helpers. Zero dependencies: Node 22 built-in fetch.
const UA = 'QuickRolesBot/1.0 (+https://quickroles.africa/sources; bots@quickroles.africa)';
const lastHit = new Map(); // host -> timestamp of last request

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function politeDelay(url, minGapMs = 2000) {
  const host = new URL(url).host;
  const last = lastHit.get(host) || 0;
  const wait = last + minGapMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());
}

export async function get(url, { headers = {}, timeoutMs = 30000, minGapMs = 2000, retries = 2 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    await politeDelay(url, minGapMs);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': UA, accept: 'application/json, application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8', ...headers },
        signal: ctrl.signal,
        redirect: 'follow',
      });
      clearTimeout(t);
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status} for ${url}`);
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < retries) await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
}

export async function getJson(url, opts) {
  const res = await get(url, opts);
  return res.json();
}

export async function getText(url, opts) {
  const res = await get(url, opts);
  return res.text();
}

export async function postJson(url, body, { headers = {}, timeoutMs = 30000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'user-agent': UA, 'content-type': 'application/json', accept: 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}: ${(await res.text()).slice(0, 300)}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } finally {
    clearTimeout(t);
  }
}
