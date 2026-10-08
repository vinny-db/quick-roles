// Supabase via PostgREST over fetch. No SDK. Uses the service role key (server side only).
import { writeFile, mkdir } from 'node:fs/promises';

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const DRY = !URL_ || !KEY || process.env.DRY_RUN === '1';

function headers(extra = {}) {
  return { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json', ...extra };
}

async function rest(path, { method = 'GET', body, prefer, query = '' } = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}${query}`, {
    method,
    headers: headers(prefer ? { prefer } : {}),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${method} ${path} ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

export async function upsert(table, rows, onConflict) {
  if (!rows.length) return [];
  const chunks = [];
  for (let i = 0; i < rows.length; i += 200) chunks.push(rows.slice(i, i + 200));
  const out = [];
  for (const c of chunks) {
    const r = await rest(table, { method: 'POST', body: c, prefer: 'resolution=merge-duplicates,return=representation', query: `?on_conflict=${onConflict}` });
    out.push(...(r || []));
  }
  return out;
}

export async function select(table, query) {
  return rest(table, { query: `?${query}` });
}

export async function patch(table, query, body) {
  return rest(table, { method: 'PATCH', query: `?${query}`, body, prefer: 'return=minimal' });
}

export async function rpc(fn, args) {
  return rest(`rpc/${fn}`, { method: 'POST', body: args });
}

// Dry-run sink: writes everything to pipeline/out/ for inspection.
export async function writeSnapshot(name, data) {
  await mkdir(new URL('../../out/', import.meta.url), { recursive: true });
  const file = new URL(`../../out/${name}.json`, import.meta.url);
  await writeFile(file, JSON.stringify(data, null, 2));
  return file.pathname;
}
