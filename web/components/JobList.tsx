import Link from 'next/link';
import { Header, Footer, BottomNav, SearchIcon } from '@/components/Chrome';
import { JobCard } from '@/components/JobCard';
import { listJobs, parseSearch, type JobQuery } from '@/lib/db';

export type Params = Record<string, string | string[] | undefined>;

const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(',') : []).map((s) => s.trim()).filter(Boolean);

export function queryFromParams(sp: Params, preset: Partial<JobQuery> = {}): JobQuery {
  const parsed = typeof sp.q === 'string' ? parseSearch(sp.q) : {};
  const loc = typeof sp.loc === 'string' && sp.loc ? sp.loc.slice(0, 60) : parsed.loc;
  const q: JobQuery = {
    q: parsed.q,
    loc,
    mode: arr(sp.mode), level: arr(sp.level), lane: arr(sp.lane), city: arr(sp.city),
    salary: sp.salary === '1', posted: (['today', '3d', '7d'] as const).find((x) => x === sp.posted),
    page: Number(sp.page) || 1, sort: (['newest', 'deadline', 'salary'] as const).find((x) => x === sp.sort) || 'newest',
    match: sp.match === '1',
  };
  if (loc && loc.toLowerCase() === 'hybrid') { q.loc = undefined; q.mode = ['hybrid']; }
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
const SORT = [['newest', 'Newest'], ['deadline', 'Deadline soonest'], ['salary', 'Pays well']];

export async function JobListPage({ sp, base, title, intro, preset = {}, active, lockedKeys = [] }: { sp: Params; base: string; title: string; intro?: string; preset?: Partial<JobQuery>; active?: 'jobs' | 'remote' | 'fresh'; lockedKeys?: string[] }) {
  const q = queryFromParams(sp, preset);
  const { jobs, total } = await listJobs(q);
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = q.page || 1;
  const searchText = typeof sp.q === 'string' ? sp.q : [q.q, q.loc].filter(Boolean).join(', ');
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
        <div className="section-head" style={{ paddingTop: 16 }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)' }}>{title}</h2>
          <span className="muted" style={{ fontSize: 13.5 }}>{total.toLocaleString()} job{total === 1 ? '' : 's'}{q.match ? ', best matches first' : ''}</span>
        </div>
        {intro && <p className="muted" style={{ margin: '4px 0 0', maxWidth: 640, fontSize: 14.5 }}>{intro}</p>}
        <form className="search" action={base} method="get" role="search" style={{ marginTop: 16, maxWidth: 'none' }}>
          <SearchIcon size={20} />
          <label htmlFor="q" className="sr-only">Search jobs</label>
          <input id="q" name="q" type="search" placeholder="Role, company or city. Try “nurse, Abuja”" defaultValue={searchText} />
          {Object.entries(sp).filter(([k]) => !['q', 'loc', 'page'].includes(k)).map(([k, v]) => <input key={k} type="hidden" name={k} value={Array.isArray(v) ? v.join(',') : v || ''} />)}
          <button type="submit" className="btn btn-ink">Search</button>
        </form>
        <div className="filters">
          {MODE.map(([v, l]) => <Toggle key={v} k="mode" v={v} label={l} />)}
          {!lockedKeys.includes('mode') && !lockedKeys.includes('level') && <span className="sep" aria-hidden="true" />}
          {LEVEL.map(([v, l]) => <Toggle key={v} k="level" v={v} label={l} />)}
        </div>
        <div className="filters" style={{ paddingTop: 6 }}>
          {LANE.map(([v, l]) => <Toggle key={v} k="lane" v={v} label={l} />)}
        </div>
        <div className="filters" style={{ paddingTop: 6 }}>
          {!lockedKeys.includes('posted') && POSTED.map(([v, l]) => <Link key={v} href={withParam(base, sp, 'posted', sp.posted === v ? null : v)} className={sp.posted === v ? 'on' : ''}>{l}</Link>)}
          {!lockedKeys.includes('salary') && <Link href={withParam(base, sp, 'salary', sp.salary === '1' ? null : '1')} className={sp.salary === '1' ? 'on' : ''}>Pays well</Link>}
          <span className="sep" aria-hidden="true" />
          <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Sort</span>
          {SORT.map(([v, l]) => <Link key={v} href={withParam(base, sp, 'sort', v === 'newest' ? null : v)} className={q.sort === v ? 'on' : ''}>{l}</Link>)}
        </div>
        {jobs.length ? (
          <div className="grid2">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
        ) : (
          <div className="empty"><h3>Nothing yet.</h3><p className="muted">We check again within the hour. Try fewer filters, or <Link href="/alerts" style={{ textDecoration: 'underline' }}>get an alert</Link> when it lands.</p></div>
        )}
        {pages > 1 && (
          <nav className="pager" aria-label="Pages">
            {page > 1 && <Link href={withParam(base, sp, 'page', String(page - 1))} className="btn btn-sm">Previous</Link>}
            <span className="btn btn-sm btn-soft" aria-current="page">{page} of {pages}</span>
            {page < pages && <Link href={withParam(base, sp, 'page', String(page + 1))} className="btn btn-sm">Next</Link>}
          </nav>
        )}
      </main>
      <Footer />
      <BottomNav active={active === 'remote' ? 'remote' : 'jobs'} />
    </>
  );
}
