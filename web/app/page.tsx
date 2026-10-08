import Link from 'next/link';
import { Header, Footer, BottomNav, Sparkle } from '@/components/Chrome';
import { JobCard } from '@/components/JobCard';
import { AlertsBand } from '@/components/AlertsBand';
import { listJobs, stats, configured } from '@/lib/db';
import { timeAgo } from '@/lib/format';

export const revalidate = 300;

const JUMP = [
  ['Remote', '/jobs/remote'], ['Lagos', '/jobs/lagos'], ['Abuja', '/jobs/abuja'], ['NYSC', '/jobs/nysc'], ['Fresh grad', '/jobs/fresh-grads'], ['Pays well', '/jobs/pays-well'], ['Dropped today', '/jobs/today'],
];

export default async function Home() {
  const ready = configured();
  const [{ jobs }, s] = ready ? await Promise.all([listJobs({ limit: 10, excludeSources: ['uncareers'] }), stats()]) : [{ jobs: [] as any[] }, { live: 0, today: 0, lastRun: null }];
  const newToday = s.today;
  return (
    <>
      <Header />
      <main>
        <section className="wrap hero">
          <div className="sticker st-new" aria-label={`${newToday} new roles since yesterday`}><b>{newToday}</b><small>new roles<br />since yesterday</small></div>
          <div className="sticker st-free">no login · no fees</div>
          <h1>We&apos;re<br />hiring<span className="bang">!</span></h1>
          <p className="turn">Well, they&apos;re hiring. We just made it easier.</p>
          <p className="sub">Every open role in Nigeria plus the remote ones that take you. Checked every hour. No login, no fees, no stories.</p>
          <div className="sticker st-find">find your next job <Sparkle /></div>
          <form className="search" action="/jobs" method="get" role="search">
            <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4-4"></path></svg>
            <label htmlFor="q" className="sr-only">Search jobs</label>
            <input id="q" name="q" type="search" placeholder="accountant, sales, product designer" autoComplete="off" />
            <label htmlFor="loc" className="sr-only">Location</label>
            <input id="loc" name="loc" className="loc" type="text" placeholder="Lagos, Abuja, remote" autoComplete="off" />
            <button type="submit" className="btn btn-ink" style={{ border: 0 }}>Search</button>
          </form>
          <div className="jump">
            <span>Jump to</span>
            {JUMP.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'center', paddingTop: 22, fontSize: 14, color: 'var(--muted)' }}>
            <span>Not sure what to search?</span>
            <Link href="/match" className="btn btn-sm" style={{ minHeight: 32, padding: '4px 14px' }}>Find my match <span style={{ fontWeight: 500, color: 'var(--muted)' }}>30 sec</span></Link>
          </div>
        </section>

        <section className="wrap">
          <div className="section-head">
            <h2>Just dropped</h2>
            <span className="muted" style={{ fontSize: 14 }}>{s.lastRun ? `Checked ${timeAgo(s.lastRun)}` : 'Checked every hour'} · {newToday} new since yesterday</span>
            <Link href="/jobs" className="btn btn-sm" style={{ marginLeft: 'auto' }}>All jobs</Link>
          </div>
          {jobs.length ? (
            <div className="grid2">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
          ) : (
            <div className="empty"><h3>Finding the fresh ones.</h3><p className="muted">The first hourly check lands shortly.</p></div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}><Link href="/jobs" className="btn" style={{ borderWidth: 3 }}>More, please</Link></div>
        </section>

        <section className="wrap"><AlertsBand /></section>

        <section className="wrap boxes">
          <div className="box butter">
            <h3>Hiring? Post it free.</h3>
            <p>We put it in front of the right people. Every post is checked before it goes live.</p>
            <Link href="/post" className="btn btn-ink btn-sm" style={{ width: 'fit-content', marginTop: 'auto' }}>Post a job</Link>
          </div>
          <div className="box">
            <h3>Straight from the source.</h3>
            <p>Employer pages, public boards, NGO feeds. Checked every hour. Every listing links home.</p>
            <Link href="/sources" style={{ marginTop: 'auto', fontWeight: 700, textDecoration: 'underline', fontSize: 14 }}>See every source</Link>
          </div>
        </section>

        <section className="wrap">
          <Link href="/government" className="strip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="2.2" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"></path><path d="M9 12l2 2 4-4"></path></svg>
            <span>Is that government recruitment real?</span>
            <span className="muted" style={{ fontWeight: 500 }}>Official links only. Nobody charges a fee.</span>
            <span className="end">Check here</span>
          </Link>
        </section>
      </main>
      <Footer />
      <BottomNav active="jobs" />
    </>
  );
}
