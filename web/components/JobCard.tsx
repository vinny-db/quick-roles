import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Job } from '@/lib/db';
import { timeAgo, deadlineLabel, levelLabel, modeLabel, salaryLabel, locationLine, logoFor } from '@/lib/format';
import { ExtIcon } from './Chrome';

const ICONS: Record<string, ReactNode> = {
  design: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.6 7.6"></path><circle cx="11" cy="11" r="2"></circle></svg>,
  support: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M4 13a8 8 0 0116 0"></path><rect x="3" y="13" width="4" height="6" rx="1.5"></rect><rect x="17" y="13" width="4" height="6" rx="1.5"></rect><path d="M19 19a3 3 0 01-3 2h-3"></path></svg>,
  tech: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.4" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"></path></svg>,
  finance: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><ellipse cx="12" cy="6" rx="8" ry="3"></ellipse><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"></path><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path></svg>,
  sales: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M3 10v4h3l8 5V5L6 10z"></path><path d="M17 9a4 4 0 010 6M19.5 6.5a8 8 0 010 11"></path></svg>,
  health: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"></path></svg>,
  marketing: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M4 4h16v12H8l-4 4z"></path><path d="M8 9h8M8 12h5"></path></svg>,
  ops: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M4 7h16M4 12h10M4 17h7"></path><circle cx="18" cy="16" r="3"></circle></svg>,
  ngo: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 17s-4-2.6-4-5.4a2.2 2.2 0 014-1.3 2.2 2.2 0 014 1.3C16 14.4 12 17 12 17z"></path></svg>,
  teaching: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M2 9l10-4 10 4-10 4z"></path><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M22 9v6"></path></svg>,
  other: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>,
};

export function Tile({ job, big }: { job: Job; big?: boolean }) {
  const logo = logoFor(job);
  if (logo) return <div className={`tile logo${big ? ' big' : ''}`}><img src={logo} alt={`${job.company || 'Employer'} logo`} loading="lazy" referrerPolicy="no-referrer" /></div>;
  return <div className={`tile role ${job.lane || 'other'}${big ? ' big' : ''}`} aria-label={`${job.lane} role`}>{ICONS[job.lane] || ICONS.other}</div>;
}

export function JobCard({ job }: { job: Job }) {
  const dl = deadlineLabel(job.deadline);
  const sal = salaryLabel(job);
  const lvl = levelLabel(job.level);
  const mode = modeLabel(job.work_mode, job.remote_scope);
  return (
    <article className="card">
      <div className="card-top">
        <Tile job={job} />
        <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Link href={`/job/${job.slug}`} className="card-title">{job.title}</Link>
          <span className="card-meta">{locationLine(job)}</span>
        </div>
        <span className="card-when">{timeAgo(job.posted_at || job.first_seen_at)}</span>
      </div>
      <div className="tags">
        {lvl && <span className="chip">{lvl}</span>}
        {mode && job.work_mode !== 'remote' && <span className="chip">{mode}</span>}
        {sal && <span className="chip chip-mint">{sal}</span>}
        {dl && <span className="chip chip-blush"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.4" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>{dl.text}</span>}
      </div>
      <div className="card-foot">
        <span>{job.attribution || 'Via source'}</span>
        <Link href={`/job/${job.slug}`} className="btn btn-sm spacer">Learn more</Link>
        <a href={job.apply_url} target="_blank" rel="nofollow noopener" className="btn btn-sm btn-ink">Apply <ExtIcon /></a>
      </div>
    </article>
  );
}
