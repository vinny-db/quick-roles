import Link from 'next/link';
import { Header, Footer, BottomNav } from '@/components/Chrome';
import { JobCard } from '@/components/JobCard';
import { listJobs, type JobQuery } from '@/lib/db';

export type Params = Record<string, string | string[] | undefined>;

const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(',') : []).map((s) => s.trim()).filter(Boolean);

export function queryFromParams(sp: Params, preset: Partial<JobQuery> = {}): JobQuery {
  const q: JobQuery = {
    q: typeof sp.q === 'string' ? sp.q.slice(0, 80) : undefined,
    loc: typeof sp.loc === 'string' ? sp.loc.slice(0, 60) : undefined,
    mode: arr(sp.mode), level: arr(sp.level), lane: arr(sp.lane), city: arr(sp.city),
    salary: sp.salary === '1', posted: (['today', '3d', '7d'] as const).find((x) => x === sp.posted),
    page: Number(sp.page) || 1, sort: (['newest', 'deadline', 'salary'] as const).find((x) => x === sp.sort) || 'newest',
    match: sp.match === '1',
  };
  return { ...q, ...preset, mode: preset.mode?.length ? preset.mode : q.mode, level: preset.level?.length ? preset.level : q.level, city: preset.city?.length ? preset.city : q.city };
}

function withParam(base: string, sp: Params, key: string, value: string | null) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v != null && k !== 'page' && k !== key) p.set(k, Array.isArray(v) ? v.join(',') : v);
  if (value) p.set(key, value);
  const s = p.toString();
  return s ? `${base}?${s}` : base;
}

const MODE = [['remote', 'Remote'], ['hybrid', 'Hybrid'], ['onsite', 'On site']];
const LEVEL = [['nysc', 'NYSC'], ['entry', 'Entry'], ['mid', 'Mid'], ['senior', 'Senior']];
const LANE = [['sales', 'Sales'], ['support', 'Support'], ['finance', 'Finance'], ['tech', 'Tech'], ['design', 'Design'], ['marketing', 'Marketing'], ['ops', 'Operations'], ['ngo', 'NGO'], ['health', 'Health'], ['teaching', 'Teaching']];
const POSTED = [['today', 'Today'], ['3d', '3 days'], ['7d', '7 days']];

export async function JobListPage({ sp, base, title, intro, preset = {}, active, lockedKeys = [] }: { sp: Params; base: string; title: string; intro?: string; preset?: Partial<JobQuery>; active?: 'jobs' | 'remote' | 'fresh'; lockedKeys?: string[] }) {
  const q = queryFromParams(sp, preset);
  const { jobs, total } = await listJobs(q);
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = q.page || 1;
  const Toggle = ({ k, v, label }: { k: string; v: string; label: string }) => {
    if (lockedKeys.includes(k)) return null;
    const cur = arr(sp[k]);
    const on = cur.includes(v);
    const next = on ? cur.filter((x) => x !== v) : [...cur, v];
    return <Link href={withParam(base, sp, k, next.length ? next.join(',') : null)} className={on ? 'on' : ''} aria-pressed={on}>{label}</Link>;
  };
  return (
    <>
      <Header active={active} />
      <main className="wrap">
        <div className="section-head" style={{ paddingTop: 20 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>{title}</h2>
          <span className="muted" style={{ fontSize: 14 }}>{total.toLocaleString()} job{total === 1 ? '' : 's'}{q.match ? ', best matches first' : ''}</span>
        </div>
        {intro && <p className="muted" style={{ margin: '6px 0 0', maxWidth: 640 }}>{intro}</p>}
        <form className="search" action={base} method="get" role="search" style={{ marginTop: 18, maxWidth: 'none' }}>
          <label htmlFor="q" className="sr-only">Search jobs</label>
          <input id="q" name="q" type="search" placeholder="Role, skill or company" defaultValue={q.q || ''} />
          <label htmlFor="loc" className="sr-only">Location</label>
          <input id="loc" name="loc" className="loc" type="text" placeholder="Lagos, Abuja, remote" defaultValue={q.loc || ''} />
          {Object.entries(sp).filter(([k]) => !['q', 'loc', 'page'].includes(k)).map(([k, v]) => <input key={k} type="hidden" name={k} value={Array.isArray(v) ? v.join(',') : v || ''} />)}
          <button type="submit" className="btn btn-ink" style={{ border: 0 }}>Search</button>
        </form>
        <div className="filters">
          {MODE.map(([v, l]) => <Toggle key={v} k="mode" v={v} label={l} />)}
          <span style={{ width: 1, height: 24, background: '#DDD' }} aria-hidden="true" />
          {LEVEL.map(([v, l]) => <Toggle key={v} k="level" v={v} label={l} />)}
          <span style={{ width: 1, height: 24, background: '#DDD' }} aria-hidden="true" />
          {LANE.map(([v, l]) => <Toggle key={v} k="lane" v={v} label={l} />)}
        </div>
        <div className="filters">
          {POSTED.map(([v, l]) => <Link key={v} href={withParam(base, sp, 'posted', sp.posted === v ? null : v)} className={sp.posted === v ? 'on' : ''}>{l}</Link>)}
          <Link href={withParam(base, sp, 'salary', sp.salary === '1' ? null : '1')} className={sp.salary === '1' ? 'on' : ''}>Pays well</Link>
          <form action={base} method="get" style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {Object.entries(sp).filter(([k]) => !['sort', 'page'].includes(k)).map(([k, v]) => <input key={k} type="hidden" name={k} value={Array.isArray(v) ? v.join(',') : v || ''} />)}
            <label htmlFor="sort" className="muted" style={{ fontSize: 13 }}>Sort</label>
            <select id="sort" name="sort" defaultValue={q.sort}>
              <option value="newest">Newest</option><option value="deadline">Deadline soonest</option><option value="salary">Pays well</option>
            </select>
            <button type="submit" className="btn btn-sm">Go</button>
          </form>
        </div>
        {jobs.length ? (
          <div className="grid2">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
        ) : (
          <div className="empty"><h3>Nothing yet.</h3><p className="muted">We check again within the hour. Try fewer filters, or <Link href="/alerts" style={{ textDecoration: 'underline' }}>get an alert</Link> when it lands.</p></div>
        )}
        {pages > 1 && (
          <nav className="pager" aria-label="Pages">
            {page > 1 && <Link href={withParam(base, sp, 'page', String(page - 1))} className="btn btn-sm">Previous</Link>}
            <span className="btn btn-sm" aria-current="page" style={{ background: 'var(--ink)', color: '#fff' }}>{page} of {pages}</span>
            {page < pages && <Link href={withParam(base, sp, 'page', String(page + 1))} className="btn btn-sm">Next</Link>}
          </nav>
        )}
      </main>
      <Footer />
      <BottomNav active={active === 'remote' ? 'remote' : 'jobs'} />
    </>
  );
}
