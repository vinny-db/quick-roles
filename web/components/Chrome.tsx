import Link from 'next/link';

export function Header({ active }: { active?: 'jobs' | 'remote' | 'fresh' }) {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Link href="/" className="wordmark" aria-label="Quick Roles home">QUICK<span className="marker">ROLES</span></Link>
        <nav className="nav" aria-label="Main">
          <Link href="/jobs" className={active === 'jobs' ? 'active' : ''}><span>Browse jobs</span></Link>
          <Link href="/jobs/remote" className={active === 'remote' ? 'active' : ''}><span>Remote</span></Link>
          <Link href="/jobs/fresh-grads" className={active === 'fresh' ? 'active' : ''}><span>Fresh grads</span></Link>
        </nav>
        <div className="hdr-right">
          <Link href="/post" className="btn btn-ghost hide-m">Post a job</Link>
          <Link href="/alerts" className="btn hide-m">Get alerts</Link>
          <Link href="/match" className="btn btn-ink" style={{ boxShadow: '3px 3px 0 var(--butter)' }}>Find my match</Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <span className="wm">QUICKROLES</span>
        <Link href="/about">About</Link>
        <Link href="/sources">Every source</Link>
        <a href="https://t.me/quickroles" rel="noopener">Telegram channel</a>
        <Link href="/report">Report a scam listing</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <span className="end">quickroles.africa</span>
      </div>
    </footer>
  );
}

export function BottomNav({ active }: { active?: 'jobs' | 'remote' | 'match' | 'alerts' }) {
  return (
    <nav className="bnav" aria-label="Main">
      <Link href="/jobs" className={active === 'jobs' ? 'active' : ''}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18"></path></svg>
        <span>Jobs</span>
      </Link>
      <Link href="/jobs/remote" className={active === 'remote' ? 'active' : ''}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"></path></svg>
        <span>Remote</span>
      </Link>
      <Link href="/match" className={active === 'match' ? 'active' : ''}>
        <span className="match-dot"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" aria-hidden="true"><path d="M12 3l2.4 6.2H21l-5.3 3.9 2 6.4L12 15.6l-5.7 3.9 2-6.4L3 9.2h6.6z"></path></svg></span>
        <span>Match</span>
      </Link>
      <Link href="/alerts" className={active === 'alerts' ? 'active' : ''}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"></path><path d="M10 20a2 2 0 004 0"></path></svg>
        <span>Alerts</span>
      </Link>
    </nav>
  );
}

export function Sparkle({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z"></path></svg>;
}

export function ExtIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"></path></svg>;
}
