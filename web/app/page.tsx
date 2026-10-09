import Link from 'next/link';
import { Header, Footer, BottomNav, ArrowIcon, SearchIcon } from '@/components/Chrome';
import { JobCard } from '@/components/JobCard';
import { AlertsBand } from '@/components/AlertsBand';
import { listJobs, stats, configured } from '@/lib/db';
import { timeAgo } from '@/lib/format';

export const revalidate = 300;

const JUMP = [
  ['Remote', '/jobs/remote'], ['Lagos', '/jobs/lagos'], ['Abuja', '/jobs/abuja'], ['NYSC', '/jobs/nysc'], ['Fresh grads', '/jobs/fresh-grads'], ['Pays well', '/jobs/pays-well'], ['Dropped today', '/jobs/today'],
];

export default async function Home() {
  const ready = configured();
  const [{ jobs }, s] = ready ? await Promise.all([listJobs({ limit: 12, excludeSources: ['uncareers'] }), stats()]) : [{ jobs: [] as any[] }, { live: 0, today: 0, lastRun: null }];
  const newToday = s.today;
  return (
    <>
      <Header />
      <main>
        <section className="wrap hero">
          <div className="hero-grid">
            <div>
              <span className="pill-live"><i aria-hidden="true" />{newToday.toLocaleString()} new roles since yesterday</span>
              <h1>We&apos;re hiring<span className="bang">!</span></h1>
              <p className="turn hide-m">Well, they&apos;re hiring. We just made it easier.</p>
              <p className="sub hide-m">Every open role in Nigeria plus the remote ones that take you. Checked every hour. No login, no fees, no stories.</p>
              <form className="search" action="/jobs" method="get" role="search">
                <SearchIcon size={20} />
                <label htmlFor="q" className="sr-only">Search jobs</label>
                <input id="q" name="q" type="search" placeholder="Try “accountant, Lagos” or “remote design”" autoComplete="off" />
                <button type="submit" className="btn btn-ink">Search</button>
              </form>
              <div className="jump">
                {JUMP.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
              </div>
            </div>
            <aside className="hero-side hide-m">
              <Link href="/match" className="matchcard tall">
                <span className="chip chip-mint" style={{ width: 'fit-content' }}>30 seconds</span>
                <b>Not sure what to search?</b>
                <small>Four taps: how you work, your level, your lane, where. We hand you the jobs that fit.</small>
                <span className="btn btn-ink btn-sm" style={{ width: 'fit-content', marginTop: 6 }}>Find my match <ArrowIcon size={15} /></span>
              </Link>
              <div className="hero-stats">
                <span><b>{s.live.toLocaleString()}</b> live jobs</span>
                <span><b>29</b> sources</span>
                <span>{s.lastRun ? `Checked ${timeAgo(s.lastRun)}` : 'Checked hourly'}</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="wrap">
          <div className="section-head">
            <h2>Just dropped</h2>
            <span className="muted hide-m" style={{ fontSize: 13 }}>{s.lastRun ? `Checked ${timeAgo(s.lastRun)}` : 'Checked every hour'}</span>
            <Link href="/jobs" className="more">All jobs →</Link>
          </div>
          {jobs.length ? (
            <div className="grid2 home-grid">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
          ) : (
            <div className="empty"><h3>Finding the fresh ones.</h3><p className="muted">The first hourly check lands shortly.</p></div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}><Link href="/jobs" className="btn">See all {s.live ? s.live.toLocaleString() : ''} jobs</Link></div>
        </section>

        <section className="wrap hide-m"><AlertsBand /></section>
        <section className="wrap show-m">
          <Link href="/alerts" className="cta-card">
            <div><b>Don&apos;t chase. Get chased.</b><small>New jobs that match you, by email or Telegram.</small></div>
            <i><ArrowIcon /></i>
          </Link>
        </section>

        <section className="wrap boxes hide-m">
          <div className="box butter">
            <h3>Hiring? Post it free.</h3>
            <p>We put it in front of the right people. Every post is checked before it goes live.</p>
            <Link href="/post" className="btn btn-ink btn-sm" style={{ width: 'fit-content', marginTop: 'auto' }}>Post a job</Link>
          </div>
          <div className="box">
            <h3>Straight from the source.</h3>
            <p>Employer pages, public boards, NGO feeds. Checked every hour. Every listing links home.</p>
            <Link href="/sources" className="btn btn-soft btn-sm" style={{ width: 'fit-content', marginTop: 'auto' }}>See every source</Link>
          </div>
        </section>

        <section className="wrap">
          <Link href="/government" className="strip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"></path><path d="M9 12l2 2 4-4"></path></svg>
            <span>Is that government recruitment real?</span>
            <span className="muted hide-m" style={{ fontWeight: 500 }}>Official links only. Nobody charges a fee.</span>
            <span className="end">Check →</span>
          </Link>
        </section>
      </main>
      <Footer />
      <BottomNav active="jobs" />
    </>
  );
}
