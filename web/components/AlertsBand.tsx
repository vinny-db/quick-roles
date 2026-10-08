export function AlertsBand({ keyword = '', location = '', compact = false }: { keyword?: string; location?: string; compact?: boolean }) {
  return (
    <div className="band" id="alerts">
      <span className="sticker tag">email or Telegram</span>
      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
        <h2>Don&apos;t chase.<br />Get <span className="script">chased.</span></h2>
        <p>New jobs that match you, in your inbox or on Telegram. No account. Stop anytime.</p>
      </div>
      <form className="form" action="/api/alerts" method="post">
        <div className="row">
          <label htmlFor="ak" className="sr-only">Keyword</label>
          <input id="ak" name="keyword" type="text" placeholder="e.g. accountant" defaultValue={keyword} />
          <label htmlFor="al" className="sr-only">Location</label>
          <input id="al" name="location" type="text" placeholder="e.g. Lagos or remote" defaultValue={location} />
        </div>
        <div className="row">
          <label htmlFor="ae" className="sr-only">Email</label>
          <input id="ae" name="email" type="email" placeholder="you@email.com" />
          <label htmlFor="ap" className="sr-only">Phone, optional</label>
          <input id="ap" name="phone" type="tel" placeholder="+234 phone (optional)" />
          <button type="submit" className="btn btn-ink">Send me jobs</button>
        </div>
        <span className="hint">Email, phone, or both. All optional, pick what you check.</span>
        <label className="consent"><input type="checkbox" name="consent" value="yes" required style={{ marginTop: 3 }} /> Yes, send me matching jobs. I can stop anytime. <a href="/privacy" style={{ textDecoration: 'underline' }}>How we handle your details</a>.</label>
        <input type="hidden" name="src" value={compact ? 'job' : 'home'} />
      </form>
    </div>
  );
}
