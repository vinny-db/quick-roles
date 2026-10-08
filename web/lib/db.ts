// Read access to Supabase over PostgREST. Public key on the server for reads; service key for writes.
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const PUB = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export type Job = {
  id: string; slug: string; title: string; company: string | null; location_text: string | null; city: string | null; country: string | null;
  work_mode: string; remote_scope: string; level: string; lane: string; salary_text: string | null; salary_min: number | null; salary_max: number | null;
  currency: string | null; deadline: string | null; posted_at: string | null; first_seen_at: string; last_seen_at: string; expired_at: string | null;
  apply_url: string; source_url: string | null; description_html: string | null; summary: string | null; tags: string[]; source_id: string;
  logo_url: string | null; employer_domain: string | null; attribution: string | null; allowed_in_schema: boolean;
};

export const configured = () => Boolean(URL_ && PUB);

async function rest<T>(path: string, opts: { method?: string; body?: string; headers?: Record<string, string>; key?: string; revalidate?: number } = {}): Promise<{ data: T; count: number | null }> {
  if (!URL_) return { data: [] as unknown as T, count: 0 };
  const key = opts.key || PUB;
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method: opts.method || 'GET',
    body: opts.body,
    headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json', prefer: opts.method ? 'return=representation' : 'count=exact', ...(opts.headers || {}) },
    cache: opts.revalidate === 0 ? 'no-store' : undefined,
    next: opts.revalidate === 0 ? undefined : { revalidate: opts.revalidate ?? 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const range = res.headers.get('content-range');
  const count = range && range.includes('/') ? Number(range.split('/')[1]) : null;
  const text = await res.text();
  return { data: (text ? JSON.parse(text) : null) as T, count: Number.isFinite(count as number) ? count : null };
}

const esc = (s: string) => s.replace(/[,.()"'\\*]/g, ' ').replace(/\s+/g, ' ').trim();

const PLACES = ['remote', 'hybrid', 'work from home', 'lagos', 'abuja', 'port harcourt', 'ibadan', 'kano', 'kaduna', 'enugu', 'benin', 'calabar', 'uyo', 'jos', 'owerri', 'abeokuta', 'ilorin', 'onitsha', 'warri', 'asaba', 'akure', 'maiduguri', 'yola', 'bauchi', 'sokoto', 'minna', 'lokoja', 'makurdi', 'ikeja', 'lekki', 'yaba', 'victoria island', 'ogun', 'rivers', 'delta', 'nigeria', 'ghana', 'kenya', 'accra', 'nairobi'];

// "accountant, Lagos" or "remote design" or "nurse in Abuja" -> { q: 'accountant', loc: 'Lagos' }
export function parseSearch(raw: string): { q?: string; loc?: string } {
  const text = raw.replace(/\s+/g, ' ').trim().slice(0, 100);
  if (!text) return {};
  const lower = text.toLowerCase();
  if (text.includes(',')) {
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
    const loc = parts.find((p) => PLACES.includes(p.toLowerCase().replace(/^in /, '')));
    const q = parts.filter((p) => p !== loc).join(' ').trim();
    return { q: q || undefined, loc: loc?.replace(/^in /i, '') };
  }
  for (const place of PLACES) {
    const re = new RegExp(`(^|\\s)(in\\s+)?${place.replace(' ', '\\s+')}(\\s|$)`, 'i');
    if (re.test(lower)) {
      const q = text.replace(re, ' ').replace(/\s+/g, ' ').trim();
      return { q: q || undefined, loc: place === 'work from home' ? 'remote' : text.match(new RegExp(place, 'i'))![0] };
    }
  }
  return { q: text };
}

export type JobQuery = {
  q?: string; loc?: string; mode?: string[]; level?: string[]; lane?: string[]; city?: string[]; salary?: boolean; posted?: 'today' | '3d' | '7d';
  page?: number; sort?: 'newest' | 'deadline' | 'salary'; excludeSources?: string[]; match?: boolean; limit?: number;
};

const SELECT = 'id,slug,title,company,location_text,city,country,work_mode,remote_scope,level,lane,salary_text,salary_min,salary_max,currency,deadline,posted_at,first_seen_at,last_seen_at,apply_url,source_url,summary,tags,source_id,logo_url,employer_domain,attribution,allowed_in_schema';

export async function listJobs(qy: JobQuery): Promise<{ jobs: Job[]; total: number }> {
  const p = new URLSearchParams();
  p.set('select', SELECT);
  const limit = qy.limit || 20;
  const page = Math.max(1, qy.page || 1);
  p.set('limit', String(limit));
  p.set('offset', String((page - 1) * limit));
  if (qy.q) { const t = esc(qy.q); if (t) p.set('or', `(title.ilike.*${t}*,company.ilike.*${t}*,summary.ilike.*${t}*)`); }
  if (qy.loc) {
    const l = esc(qy.loc).toLowerCase();
    if (l.includes('remote')) p.set('work_mode', 'eq.remote');
    else p.append('or', `(city.ilike.*${l}*,location_text.ilike.*${l}*)`);
  }
  if (qy.level?.length) p.set('level', `in.(${qy.level.join(',')})`);
  if (qy.lane?.length) p.set('lane', `in.(${qy.lane.join(',')})`);
  if (qy.city?.length) {
    // Jobs in the picked cities (in the picked non-remote modes, if any) OR remote jobs. Remote roles that
    // take Nigeria always come along, so "Remote" + "Lagos" means remote plus Lagos, not remote only.
    const cities = `city.in.(${qy.city.map((c) => `"${esc(c)}"`).join(',')})`;
    const local = (qy.mode || []).filter((m) => m !== 'remote');
    const localClause = local.length ? `and(${cities},work_mode.in.(${local.join(',')}))` : cities;
    p.append('or', `(${localClause},work_mode.eq.remote)`);
  } else if (qy.mode?.length) {
    p.set('work_mode', `in.(${qy.mode.join(',')})`);
  }
  if (qy.salary) p.set('salary_min', 'not.is.null');
  if (qy.posted) {
    const hours = qy.posted === 'today' ? 24 : qy.posted === '3d' ? 72 : 168;
    p.set('first_seen_at', `gte.${new Date(Date.now() - hours * 3600e3).toISOString()}`);
  }
  if (qy.excludeSources?.length) p.set('source_id', `not.in.(${qy.excludeSources.join(',')})`);
  const order = qy.sort === 'deadline' ? 'deadline.asc.nullslast,posted_at.desc.nullslast' : qy.sort === 'salary' ? 'salary_max.desc.nullslast,posted_at.desc.nullslast' : 'posted_at.desc.nullslast,first_seen_at.desc';
  p.set('order', order);
  const { data, count } = await rest<Job[]>(`live_jobs?${p.toString()}`, { revalidate: 300 });
  let jobs = data || [];
  if (qy.match) jobs = rankByOverlap(jobs, qy);
  return { jobs, total: count ?? jobs.length };
}

function rankByOverlap(jobs: Job[], qy: JobQuery) {
  const score = (j: Job) =>
    (qy.mode?.includes(j.work_mode) ? 1 : 0) + (qy.level?.includes(j.level) ? 1 : 0) + (qy.lane?.includes(j.lane) ? 1 : 0) + (qy.city?.some((c) => c.toLowerCase() === (j.city || '').toLowerCase()) ? 1 : 0);
  return [...jobs].sort((a, b) => score(b) - score(a));
}

export async function getJob(slug: string): Promise<Job | null> {
  const { data } = await rest<Job[]>(`jobs?select=${SELECT.replace(',logo_url,employer_domain,attribution,allowed_in_schema', '')},description_html,expired_at,employers(logo_url,domain),sources(attribution,allowed_in_schema)&slug=eq.${encodeURIComponent(slug)}&limit=1`, { revalidate: 600 });
  const row: any = data?.[0];
  if (!row) return null;
  return { ...row, logo_url: row.employers?.logo_url ?? null, employer_domain: row.employers?.domain ?? null, attribution: row.sources?.attribution ?? null, allowed_in_schema: !!row.sources?.allowed_in_schema };
}

export async function similarJobs(job: Job): Promise<Job[]> {
  const p = new URLSearchParams({ select: SELECT, lane: `eq.${job.lane}`, limit: '4', order: 'posted_at.desc.nullslast', slug: `neq.${job.slug}` });
  if (job.city) p.append('or', `(city.eq.${esc(job.city)},work_mode.eq.remote)`);
  const { data } = await rest<Job[]>(`live_jobs?${p.toString()}`, { revalidate: 600 });
  return data || [];
}

export async function stats(): Promise<{ live: number; today: number; lastRun: string | null }> {
  const since = new Date(Date.now() - 24 * 3600e3).toISOString();
  const [a, b, c] = await Promise.all([
    rest<Job[]>('live_jobs?select=id&limit=1', { revalidate: 300 }),
    rest<Job[]>(`live_jobs?select=id&first_seen_at=gte.${since}&limit=1`, { revalidate: 300 }),
    rest<{ last_ok_at: string }[]>('sources?select=last_ok_at&order=last_ok_at.desc.nullslast&limit=1', { revalidate: 300 }),
  ]).catch(() => [{ count: 0 }, { count: 0 }, { data: [] }] as any);
  return { live: a.count || 0, today: b.count || 0, lastRun: c.data?.[0]?.last_ok_at || null };
}

export async function listSources() {
  const { data } = await rest<any[]>('sources?select=id,name,kind,base_url,attribution,last_ok_at,last_count&enabled=eq.true&order=last_count.desc.nullslast', { revalidate: 600 });
  return data || [];
}

export async function listGov() {
  const { data } = await rest<any[]>('gov_recruitments?select=*&order=status.asc,updated_at.desc', { revalidate: 600 });
  return data || [];
}

export async function allSlugs(): Promise<{ slug: string; last_seen_at: string; allowed_in_schema: boolean }[]> {
  const { data } = await rest<any[]>('live_jobs?select=slug,last_seen_at,allowed_in_schema&limit=5000&order=posted_at.desc.nullslast', { revalidate: 3600 });
  return data || [];
}

// Writes (server only).
export async function insert(table: string, row: Record<string, unknown>) {
  if (!SRV) throw new Error('Server key missing');
  return rest(`${table}`, { method: 'POST', body: JSON.stringify(row), key: SRV, revalidate: 0, headers: { prefer: 'return=representation' } });
}
