// Builds a human-readable report from pipeline/out (dry runs) for the reports branch.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';

const outDir = new URL('../out/', import.meta.url);
const files = (await readdir(outDir)).filter((f) => f.endsWith('.json') && f !== '_summary.json');
const summary = JSON.parse(await readFile(new URL('_summary.json', outDir), 'utf8'));
const lines = [`# Pipeline dry run, ${new Date().toISOString()}`, '', '| Source | OK | Jobs | Dropped | Error |', '|---|---|---|---|---|'];
let total = 0;
for (const r of summary.sort((a, b) => (b.count || 0) - (a.count || 0))) {
  total += r.count || 0;
  lines.push(`| ${r.id} | ${r.ok ? 'yes' : 'NO'} | ${r.count || 0} | ${r.dropped ?? ''} | ${(r.error || '').replace(/\|/g, '/').slice(0, 120)} |`);
}
lines.push('', `Total jobs: ${total}`, '', '## Samples (first 3 per source)', '');
const samples = {};
for (const f of files) {
  const rows = JSON.parse(await readFile(new URL(f, outDir), 'utf8'));
  samples[f.replace('.json', '')] = rows.slice(0, 3);
  lines.push(`### ${f.replace('.json', '')} (${rows.length})`);
  for (const r of rows.slice(0, 3)) lines.push(`- ${r.title} | ${r.company || '-'} | ${r.location_text || '-'} | ${r.work_mode}/${r.remote_scope} | ${r.level}/${r.lane} | ${r.deadline || ''} | ${r.apply_url}`);
  lines.push('');
}
await mkdir(new URL('../../reports/', import.meta.url), { recursive: true });
await writeFile(new URL('../../reports/latest.md', import.meta.url), lines.join('\n'));
await writeFile(new URL('../../reports/latest.json', import.meta.url), JSON.stringify({ summary, samples }, null, 2));
console.log(lines.slice(0, 40).join('\n'));
