export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return w < 5 ? `${w}w ago` : new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function deadlineLabel(iso: string | null | undefined): { text: string; urgent: boolean } | null {
  if (!iso) return null;
  const d = new Date(iso);
  const days = Math.ceil((d.getTime() - Date.now()) / 86400e3);
  if (days < 0) return { text: 'Closed', urgent: true };
  if (days === 0) return { text: 'Closes today', urgent: true };
  if (days <= 14) return { text: `Closes in ${days} day${days === 1 ? '' : 's'}`, urgent: days <= 5 };
  return { text: `Closes ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, urgent: false };
}

export function levelLabel(level: string) {
  return { nysc: 'NYSC / intern', entry: 'Entry level', mid: 'Mid level', senior: 'Senior', unknown: '' }[level] || '';
}

export function laneLabel(lane: string) {
  return { sales: 'Sales', support: 'Customer support', finance: 'Finance', tech: 'Tech', design: 'Design', marketing: 'Marketing', ops: 'Operations', ngo: 'NGO and development', health: 'Health', teaching: 'Teaching', other: '' }[lane] || '';
}

export function modeLabel(mode: string, scope?: string) {
  if (mode === 'remote') return scope === 'worldwide' ? 'Remote, open worldwide' : scope === 'africa' ? 'Remote, Africa' : scope === 'nigeria' ? 'Remote, Nigeria' : scope === 'emea' ? 'Remote, EMEA' : 'Remote';
  if (mode === 'hybrid') return 'Hybrid';
  if (mode === 'onsite') return 'On site';
  return '';
}

export function salaryLabel(j: { salary_text?: string | null; salary_min?: number | null; salary_max?: number | null; currency?: string | null }) {
  if (j.salary_min && j.salary_max) {
    const sym = j.currency === 'NGN' ? 'N' : j.currency === 'USD' ? '$' : j.currency === 'GBP' ? '£' : j.currency === 'EUR' ? '€' : '';
    const f = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));
    return j.salary_min === j.salary_max ? `${sym}${f(j.salary_min)}` : `${sym}${f(j.salary_min)} to ${sym}${f(j.salary_max)}`;
  }
  return j.salary_text ? j.salary_text.slice(0, 40) : '';
}

export function locationLine(j: { company?: string | null; location_text?: string | null; city?: string | null; work_mode?: string; remote_scope?: string }) {
  const parts: string[] = [];
  if (j.company) parts.push(j.company);
  const where = j.work_mode === 'remote' ? modeLabel('remote', j.remote_scope) : j.city || j.location_text || '';
  if (where) parts.push(where);
  if (j.work_mode === 'hybrid') parts.push('hybrid');
  return parts.join(' · ');
}

export function logoFor(j: { logo_url?: string | null; employer_domain?: string | null }) {
  if (j.logo_url) return j.logo_url;
  if (j.employer_domain) return `/api/logo?d=${encodeURIComponent(j.employer_domain)}`;
  return null;
}
