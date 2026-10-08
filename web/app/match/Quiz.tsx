'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const VIBE = [['remote', 'Remote, anywhere'], ['hybrid', 'Hybrid in my city'], ['onsite', 'On site, I like people']];
const LEVEL = [['nysc', 'NYSC or fresh grad'], ['entry', 'Entry level'], ['mid', '3 to 6 years'], ['senior', '6+ years']];
const LANE = [['sales', 'Sales'], ['support', 'Customer support'], ['finance', 'Finance'], ['tech', 'Tech'], ['design', 'Design'], ['marketing', 'Marketing'], ['ops', 'Operations'], ['ngo', 'NGO and development'], ['health', 'Health'], ['teaching', 'Teaching']];
const PLACE = [['Lagos', 'Lagos'], ['Abuja', 'Abuja'], ['Port Harcourt', 'Port Harcourt'], ['Ibadan', 'Ibadan'], ['Kano', 'Kano'], ['any', 'Anywhere in Nigeria'], ['remote', 'Remote only']];

type Sel = { mode: string[]; level: string[]; lane: string[]; place: string[] };

export function Quiz() {
  const router = useRouter();
  const [sel, setSel] = useState<Sel>({ mode: [], level: [], lane: [], place: [] });
  const toggle = (k: keyof Sel, v: string) => setSel((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const total = sel.mode.length + sel.level.length + sel.lane.length + sel.place.length;
  const answered = (['mode', 'level', 'lane', 'place'] as const).filter((k) => sel[k].length).length;
  const href = useMemo(() => {
    const p = new URLSearchParams();
    p.set('match', '1');
    const mode = [...sel.mode];
    if (sel.place.includes('remote') && !mode.includes('remote')) mode.push('remote');
    if (mode.length) p.set('mode', mode.join(','));
    if (sel.level.length) p.set('level', sel.level.join(','));
    if (sel.lane.length) p.set('lane', sel.lane.join(','));
    const cities = sel.place.filter((x) => x !== 'any' && x !== 'remote');
    if (cities.length) p.set('city', cities.join(','));
    return `/jobs?${p.toString()}`;
  }, [sel]);

  const Q = ({ title, k, opts, shadow, note }: { title: string; k: keyof Sel; opts: string[][]; shadow: string; note?: string }) => (
    <div className="qcard" style={{ boxShadow: `5px 5px 0 ${shadow}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <h2>{title}</h2>
        <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>{sel[k].length ? `${sel[k].length} picked` : 'pick any'}</span>
      </div>
      <div className="qopts" role="group" aria-label={title}>
        {opts.map(([v, l]) => <button key={v} type="button" className={`qopt${sel[k].includes(v) ? ' on' : ''}`} aria-pressed={sel[k].includes(v)} onClick={() => toggle(k, v)}>{l}</button>)}
      </div>
      {note && <p className="muted" style={{ margin: 0, fontSize: 12 }}>{note}</p>}
    </div>
  );

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
      <div style={{ position: 'relative', paddingTop: 14 }}>
        <span className="sticker" style={{ position: 'absolute', right: 0, top: -4, transform: 'rotate(7deg)', background: 'var(--mint)', borderRadius: 999, padding: '7px 14px', fontSize: 13 }}>30 seconds, tops</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-2px', lineHeight: 0.95 }}>Tap what fits.<br />Pick as many as you <span className="script" style={{ color: 'var(--butter)', textShadow: '3px 3px 0 var(--ink)', fontSize: '1.15em' }}>like.</span></h1>
        <p className="muted" style={{ margin: 0, paddingTop: 8, fontSize: 16 }}>No CV, no account. Change anything later.</p>
      </div>
      <div className="qgrid">
        <Q title="Work vibe" k="mode" opts={VIBE} shadow="var(--butter)" />
        <Q title="Where you're at" k="level" opts={LEVEL} shadow="var(--blush)" />
        <Q title="Your lanes" k="lane" opts={LANE} shadow="var(--mint)" />
        <Q title="Where it should be" k="place" opts={PLACE} shadow="var(--butter)" note="Remote roles that accept Nigeria come along whatever you pick." />
      </div>
      <div className="qbar">
        <span style={{ flex: '1 1 auto', fontSize: 14, fontWeight: 600 }}>{total === 0 ? 'Tap anything to start. Skip what you don’t care about.' : `${answered} of 4 answered · ${total} pick${total === 1 ? '' : 's'}`}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSel({ mode: [], level: [], lane: [], place: [] })}>Clear</button>
        <button type="button" className="btn btn-ink" disabled={total === 0} style={total === 0 ? { background: '#EDEAE3', color: '#8A8A82', borderColor: '#EDEAE3', cursor: 'default' } : undefined} onClick={() => router.push(href)}>Show my matches</button>
      </div>
    </section>
  );
}
