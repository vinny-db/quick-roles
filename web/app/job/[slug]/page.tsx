import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header, Footer, BottomNav, ExtIcon } from '@/components/Chrome';
import { Tile } from '@/components/JobCard';
import { getJob, similarJobs } from '@/lib/db';
import { timeAgo, deadlineLabel, levelLabel, laneLabel, modeLabel, salaryLabel, locationLine, plain } from '@/lib/format';

export const revalidate = 600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://quickroles.africa';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: 'This job left' };
  const where = job.work_mode === 'remote' ? modeLabel('remote', job.remote_scope) : job.city || job.location_text || 'Nigeria';
  return {
    title: `${job.title}${job.company ? ` at ${job.company}` : ''}, ${where}`,
    description: plain(job.summary) || `${job.title} at ${job.company || 'an employer'}. Found on Quick Roles, checked hourly.`,
    robots: job.expired_at ? { index: false } : undefined,
    alternates: { canonical: `${SITE}/job/${job.slug}` },
  };
}

function jsonLd(job: any) {
  const posted = job.posted_at || job.first_seen_at;
  const valid = job.deadline ? `${job.deadline}T23:59:59+01:00` : new Date(new Date(posted).getTime() + 30 * 86400e3).toISOString();
  const data: any = {
    '@context': 'https://schema.org', '@type': 'JobPosting',
    title: job.title,
    description: job.description_html || `<p>${job.summary || job.title}</p>`,
    datePosted: posted, validThrough: valid,
    hiringOrganization: { '@type': 'Organization', name: job.company || 'Employer', ...(job.employer_domain ? { sameAs: `https://${job.employer_domain}` } : {}) },
    identifier: { '@type': 'PropertyValue', name: job.source_id, value: job.slug },
    directApply: false,
    url: `${SITE}/job/${job.slug}`,
  };
  if (job.work_mode === 'remote') {
    data.jobLocationType = 'TELECOMMUTE';
    data.applicantLocationRequirements = { '@type': 'Country', name: job.remote_scope === 'nigeria' ? 'Nigeria' : 'Nigeria' };
  } else {
    data.jobLocation = { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.city || job.location_text || undefined, addressCountry: job.country || 'NG' } };
  }
  if (job.salary_min && job.currency) {
    data.baseSalary = { '@type': 'MonetaryAmount', currency: job.currency, value: { '@type': 'QuantitativeValue', minValue: job.salary_min, maxValue: job.salary_max || job.salary_min, unitText: job.currency === 'NGN' ? 'MONTH' : 'YEAR' } };
  }
  return data;
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();
  const expiredDays = job.expired_at ? Math.floor((Date.now() - new Date(job.expired_at).getTime()) / 86400e3) : -1;
  if (expiredDays > 7) notFound();
  const similar = await similarJobs(job);
  const dl = deadlineLabel(job.deadline);
  const sal = salaryLabel(job);
  const host = (() => { try { return new URL(job.apply_url).hostname.replace(/^www\./, ''); } catch { return 'the source site'; } })();
  const applyOn = job.company && job.attribution === 'Employer direct' ? job.company : host;
  const checked = timeAgo(job.last_seen_at);
  const showSchema = job.allowed_in_schema && !job.expired_at;
  return (
    <>
      {showSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(job)) }} />}
      <Header />
      <main className="wrap job-layout" style={{ paddingTop: 8 }}>
        <article className="job-main">
          <nav className="muted" style={{ fontSize: 13, fontWeight: 600, display: 'flex', gap: 6, flexWrap: 'wrap' }} aria-label="Breadcrumb">
            <Link href="/jobs">Jobs</Link><span>/</span>
            {job.city ? <><Link href={`/jobs?city=${encodeURIComponent(job.city)}`}>{job.city}</Link><span>/</span></> : job.work_mode === 'remote' ? <><Link href="/jobs/remote">Remote</Link><span>/</span></> : null}
            <span>{laneLabel(job.lane) || 'Other'}</span>
          </nav>
          {job.expired_at && <div className="notice err">This job left. Others didn&apos;t. <Link href="/jobs" style={{ textDecoration: 'underline' }}>See what&apos;s live</Link></div>}
          <div className="job-head">
            <Tile job={job} big />
            <div style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1>{job.title}</h1>
              <div className="muted" style={{ fontSize: 15.5, fontWeight: 500 }}>{locationLine(job)}</div>
              <div className="tags">
                {levelLabel(job.level) && <span className="chip">{levelLabel(job.level)}</span>}
                {laneLabel(job.lane) && <span className="chip">{laneLabel(job.lane)}</span>}
                {job.work_mode !== 'unknown' && <span className="chip">{modeLabel(job.work_mode, job.remote_scope)}</span>}
                <span className="chip chip-mint">Dropped {timeAgo(job.posted_at || job.first_seen_at)}</span>
              </div>
            </div>
            {dl && !job.expired_at && (
              <div className="deadline-sticker" aria-label={dl.text}>
                <small>{dl.text.startsWith('Closes in') ? 'CLOSES IN' : 'CLOSES'}</small>
                <b>{dl.text.startsWith('Closes in') ? dl.text.replace('Closes in ', '').replace(/ days?$/, '') : dl.text.replace('Closes ', '')}</b>
                <small>{dl.text.startsWith('Closes in') ? (dl.text.endsWith('day') ? 'DAY LEFT' : 'DAYS LEFT') : new Date(job.deadline!).getFullYear()}</small>
              </div>
            )}
          </div>

          {!job.expired_at && (
            <div className="apply-band">
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <div className="big">{dl && dl.text.startsWith('Closes in') ? `Go apply. ${dl.text.replace('Closes in ', '')} left.` : 'Go apply. It’s still open.'}</div>
                <div className="small">Seen live on {applyOn} {checked}.{job.deadline ? ` Closes ${new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.` : ''}</div>
              </div>
              <a href={job.apply_url} target="_blank" rel="nofollow noopener" className="btn btn-ink" style={{ minHeight: 48, fontSize: 15, padding: '8px 22px' }}>Apply on {applyOn} <ExtIcon /></a>
            </div>
          )}

          <dl className="facts">
            <div><dt>Salary</dt><dd>{sal || 'Not stated'}</dd></div>
            <div className={dl ? 'hot' : ''}><dt>Deadline</dt><dd>{job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not stated. Apply early.'}</dd></div>
            <div><dt>Level</dt><dd>{levelLabel(job.level) || 'Not stated'}</dd></div>
            <div><dt>Source</dt><dd>{job.attribution || 'Job board'}</dd></div>
          </dl>

          <section className="prose">
            <h2>The role</h2>
            {job.description_html ? (
              <div dangerouslySetInnerHTML={{ __html: sanitize(job.description_html) }} />
            ) : (
              <>
                <p>{plain(job.summary)}</p>
                <p className="muted" style={{ fontSize: 14 }}>The full description lives on {applyOn}&apos;s site. We show the facts and send you straight there.</p>
              </>
            )}
          </section>

          <div className="foot-note">
            <span>Nobody here charges a fee. Ever.</span>
            <Link href={`/report?job=${job.slug}`} style={{ textDecoration: 'underline' }}>Report this listing</Link>
            <a className="btn btn-sm" style={{ marginLeft: 'auto' }} href={`https://wa.me/?text=${encodeURIComponent(`${job.title}${job.company ? ' at ' + job.company : ''} ${SITE}/job/${job.slug}`)}`} target="_blank" rel="noopener">Share on WhatsApp</a>
          </div>
        </article>

        <aside className="job-side">
          <form className="side-box butter" action="/api/alerts" method="post">
            <h3>More like this, sent to you.</h3>
            <p style={{ margin: 0, fontSize: 14 }}>{laneLabel(job.lane) || 'Similar'} roles{job.city ? ` in ${job.city}` : job.work_mode === 'remote' ? ', remote' : ''}.</p>
            <input type="hidden" name="keyword" value={laneLabel(job.lane) || job.title} />
            <input type="hidden" name="location" value={job.city || (job.work_mode === 'remote' ? 'remote' : '')} />
            <input type="hidden" name="src" value="job" />
            <label htmlFor="se" className="sr-only">Email</label>
            <input id="se" name="email" type="email" placeholder="you@email.com" />
            <label htmlFor="sp" className="sr-only">Phone, optional</label>
            <input id="sp" name="phone" type="tel" placeholder="+234 phone (optional)" />
            <label className="consent"><input type="checkbox" name="consent" value="yes" required style={{ marginTop: 3 }} /> Yes, send me matching jobs. I can stop anytime.</label>
            <button type="submit" className="btn btn-ink">Send me jobs</button>
          </form>
          {similar.length > 0 && (
            <div className="side-box">
              <h3>Also dropped</h3>
              {similar.map((s) => (
                <Link key={s.id} href={`/job/${s.slug}`} className="sim"><b>{s.title}</b><span>{locationLine(s)} · {timeAgo(s.posted_at || s.first_seen_at)}</span></Link>
              ))}
            </div>
          )}
        </aside>
      </main>
      <Footer />
      <BottomNav active="jobs" />
    </>
  );
}

// Keep employer descriptions readable but safe: strip scripts, styles, event handlers, iframes.
function sanitize(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|form|input|button)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|input|img)[^>]*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\sstyle="[^"]*"/gi, '');
}
