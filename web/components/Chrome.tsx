import Link from 'next/link';

export function Wordmark({ className = 'wordmark' }: { className?: string }) {
  return <Link href="/" className={className} aria-label="Quick Roles home"><span className="dot" aria-hidden="true" />Quick Roles</Link>;
}

export function Header({ active }: { active?: 'jobs' | 'remote' | 'fresh' }) {
  return (
    <header className="hdr">
      <div className="wrap hdr-in">
        <Wordmark />
        <nav className="nav" aria-label="Main">
          <Link href="/jobs" className={active === 'jobs' ? 'active' : ''}>Browse jobs</Link>
          <Link href="/jobs/remote" className={active === 'remote' ? 'active' : ''}>Remote</Link>
          <Link href="/jobs/fresh-grads" className={active === 'fresh' ? 'active' : ''}>Fresh grads</Link>
        </nav>
        <div className="hdr-right">
          <Link href="/post" className="btn btn-ghost btn-sm hide-m">Post a job</Link>
          <Link href="/alerts" className="btn btn-sm hide-m">Get alerts</Link>
          <Link href="/match" className="btn btn-ink btn-sm hide-m">Find my match</Link>
          <Link href="/alerts" className="icon-btn show-m" aria-label="Get job alerts"><BellIcon /></Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <Wordmark className="wm" />
        <Link href="/about">About</Link>
        <Link href="/sources">Every source</Link>
        <a href="https://t.me/quickroles" rel="noopener">Telegram</a>
        <Link href="/post">Post a job</Link>
        <Link href="/report">Report a scam</Link>
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="3"></rect><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18"></path></svg>
        <span>Jobs</span>
      </Link>
      <Link href="/jobs/remote" className={active === 'remote' ? 'active' : ''}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"></path></svg>
        <span>Remote</span>
      </Link>
      <Link href="/match" className={active === 'match' ? 'active' : ''}>
        <span className="match-dot"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden="true"><path d="M12 3l2.4 6.2H21l-5.3 3.9 2 6.4L12 15.6l-5.7 3.9 2-6.4L3 9.2h6.6z"></path></svg></span>
        <span>Match</span>
      </Link>
      <Link href="/alerts" className={active === 'alerts' ? 'active' : ''}>
        <BellIcon size={22} />
        <span>Alerts</span>
      </Link>
    </nav>
  );
}

export function BellIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"></path></svg>;
}

export function ArrowIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>;
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>;
}

export function Sparkle({ size = 15 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z"></path></svg>;
}

export function ExtIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"></path></svg>;
}
