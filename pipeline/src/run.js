// Entry point. `node pipeline/src/run.js --cadence hourly` or `--only remotive,jobgurus` or `--all`.
// With SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set, writes to the database; otherwise dry-run to pipeline/out/.
import { SOURCES, CADENCE_MINUTES } from './sources.js';
import { normalize, slugify } from './lib/normalize.js';
import { DRY, upsert, select, patch, rpc, writeSnapshot } from './lib/db.js';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => (a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : [])).filter((x) => x.length));

function pickSources() {
  let list = SOURCES.filter((s) => s.enabled);
  if (args.only) {
    const ids = String(args.only).split(',');
    list = SOURCES.filter((s) => ids.includes(s.id));
  } else if (args.cadence && args.cadence !== 'all') {
    list = list.filter((s) => s.cadence === args.cadence);
  }
  return list;
}

async function ensureSources(list) {
  if (DRY) return;
  await upsert('sources', list.map((s) => ({
    id: s.id, name: s.name, kind: s.kind, base_url: s.base_url || null, attribution: s.attribution || null,
    allowed_in_schema: !!s.allowed_in_schema, full_description_allowed: !!s.full_description_allowed,
    cadence_minutes: CADENCE_MINUTES[s.cadence] || 60, enabled: true,
  })), 'id');
}

async function ensureEmployers(rows) {
  // Build employer rows from job rows, upsert by slug, return map name -> id.
  const byName = new Map();
  for (const r of rows) {
    if (!r.company) continue;
    const slug = slugify(r.company);
    if (!slug) continue;
    const cur = byName.get(slug) || { name: r.company, slug, domain: null, logo_url: null, logo_source: null };
    if (r._company_domain && !cur.domain) cur.domain = r._company_domain;
    if (r._company_logo && !cur.logo_url) { cur.logo_url = r._company_logo; cur.logo_source = 'source'; }
    byName.set(slug, cur);
  }
  const employers = [...byName.values()];
  if (DRY || !employers.length) return new Map(employers.map((e) => [e.slug, null]));
  // Do not overwrite a manual logo: fetch existing first.
  const existing = await select('employers', `select=id,slug,logo_source,logo_url,domain&slug=in.(${employers.map((e) => `"${e.slug}"`).join(',')})`);
  const keep = new Map((existing || []).map((e) => [e.slug, e]));
  const toUpsert = employers.map((e) => {
    const ex = keep.get(e.slug);
    if (ex && ex.logo_source === 'manual') return { ...e, logo_url: ex.logo_url, logo_source: 'manual' };
    if (ex && ex.logo_url && !e.logo_url) return { ...e, logo_url: ex.logo_url, logo_source: ex.logo_source };
    if (ex && ex.domain && !e.domain) return { ...e, domain: ex.domain };
    return e;
  });
  const saved = await upsert('employers', toUpsert, 'slug');
  return new Map(saved.map((e) => [e.slug, e.id]));
}

async function runSource(s) {
  const started = Date.now();
  let raws;
  try {
    raws = await s.run();
  } catch (e) {
    console.error(`[${s.id}] FAILED: ${e.message}`);
    if (!DRY) await patch('sources', `id=eq.${s.id}`, { last_run_at: new Date().toISOString(), last_error: e.message.slice(0, 500) });
    return { id: s.id, ok: false, error: e.message, count: 0 };
  }
  const rows = [];
  const seen = new Set();
  let dropped = 0;
  for (const raw of raws) {
    const row = normalize(raw, s);
    if (!row) { dropped++; continue; }
    if (seen.has(row.external_id)) continue;
    seen.add(row.external_id);
    rows.push(row);
  }
  const now = new Date().toISOString();
  if (DRY) {
    const file = await writeSnapshot(s.id.replace(/[^a-z0-9]+/gi, '_'), rows.map(({ _company_domain, _company_logo, ...r }) => r));
    console.log(`[${s.id}] ${rows.length} jobs (${dropped} dropped) in ${Date.now() - started}ms -> ${file}`);
    return { id: s.id, ok: true, count: rows.length, dropped };
  }
  const employerIds = await ensureEmployers(rows);
  const dbRows = rows.map(({ _company_domain, _company_logo, ...r }) => ({
    ...r,
    employer_id: r.company ? employerIds.get(slugify(r.company)) || null : null,
    last_seen_at: now,
    miss_count: 0,
    expired_at: null,
  }));
  await upsert('jobs', dbRows, 'source_id,external_id');
  // Expiry: jobs of this source not seen now get miss_count+1; two misses expire them.
  await rpc('mark_missing', { p_source_id: s.id, p_seen_at: now });
  await patch('sources', `id=eq.${s.id}`, { last_run_at: now, last_ok_at: now, last_count: rows.length, last_error: null });
  console.log(`[${s.id}] ${rows.length} jobs upserted (${dropped} dropped) in ${Date.now() - started}ms`);
  return { id: s.id, ok: true, count: rows.length, dropped };
}

async function main() {
  const list = pickSources();
  console.log(`${DRY ? 'DRY RUN' : 'LIVE'}: ${list.length} sources (${args.only ? 'only ' + args.only : 'cadence ' + (args.cadence || 'all')})`);
  await ensureSources(list);
  const results = [];
  // Run up to 4 sources at a time; politeness is per host inside http.js.
  const queue = [...list];
  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) results.push(await runSource(queue.shift()));
  });
  await Promise.all(workers);
  const ok = results.filter((r) => r.ok);
  const total = ok.reduce((a, r) => a + r.count, 0);
  console.log(`\nDone: ${ok.length}/${results.length} sources ok, ${total} jobs.`);
  for (const r of results.filter((r) => !r.ok)) console.log(`  failed: ${r.id}: ${r.error}`);
  await writeSnapshot('_summary', results);
  if (ok.length === 0 && results.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
