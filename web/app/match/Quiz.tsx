'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LANE_ICONS } from '@/components/JobCard';
import { ArrowIcon } from '@/components/Chrome';

type Key = 'mode' | 'level' | 'lane' | 'place';
type Opt = { v: string; l: string; s?: string; icon?: ReactNode; tint?: string };
type Step = { k: Key; title: string; sub: string; opts: Opt[]; grid: 'one' | 'two' };

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const I = {
  remote: <svg viewBox="0 0 24 24" {...S}><path d="M4 17h16M6 17V7a2 2 0 012-2h8a2 2 0 012 2v10"/><path d="M9 21h6"/></svg>,
  hybrid: <svg viewBox="0 0 24 24" {...S}><path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/></svg>,
  onsite: <svg viewBox="0 0 24 24" {...S}><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>,
  nysc: <svg viewBox="0 0 24 24" {...S}><path d="M2 9l10-4 10 4-10 4z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>,
  entry: <svg viewBox="0 0 24 24" {...S}><path d="M4 20h16M6 20V10M12 20V4M18 20v-7"/></svg>,
  mid: <svg viewBox="0 0 24 24" {...S}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  senior: <svg viewBox="0 0 24 24" {...S}><path d="M12 3l2.4 6.2H21l-5.3 3.9 2 6.4L12 15.6l-5.7 3.9 2-6.4L3 9.2h6.6z"/></svg>,
  pin: <svg viewBox="0 0 24 24" {...S}><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>,
  globe: <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>,
  flag: <svg viewBox="0 0 24 24" {...S}><path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/></svg>,
};

const STEPS: Step[] = [
  { k: 'mode', title: 'How do you want to work?', sub: 'Tap all that apply.', grid: 'one', opts: [
    { v: 'remote', l: 'Remote', s: 'Work from anywhere', icon: I.remote, tint: 'var(--sky)' },
    { v: 'hybrid', l: 'Hybrid', s: 'Some days in, some days home', icon: I.hybrid, tint: 'var(--lilac)' },
    { v: 'onsite', l: 'On site', s: 'In the office, with people', icon: I.onsite, tint: 'var(--peach)' },
  ] },
  { k: 'level', title: 'Where are you at?', sub: 'Pick as many as fit.', grid: 'one', opts: [
    { v: 'nysc', l: 'NYSC or fresh grad', s: 'Placements, internships, trainee programmes', icon: I.nysc, tint: 'var(--butter)' },
    { v: 'entry', l: 'Entry level', s: 'Up to 2 years in', icon: I.entry, tint: 'var(--mint)' },
    { v: 'mid', l: '3 to 6 years', s: 'You know what you are doing', icon: I.mid, tint: 'var(--sky)' },
    { v: 'senior', l: '6+ years', s: 'Lead, manage, own it', icon: I.senior, tint: 'var(--lilac)' },
  ] },
  { k: 'lane', title: "What's your lane?", sub: 'Tap all that apply. Skip if you are open to anything.', grid: 'two', opts: [
    { v: 'sales', l: 'Sales', icon: LANE_ICONS.sales, tint: 'var(--butter)' },
    { v: 'support', l: 'Customer support', icon: LANE_ICONS.support, tint: 'var(--mint)' },
    { v: 'finance', l: 'Finance', icon: LANE_ICONS.finance, tint: 'var(--mint)' },
    { v: 'tech', l: 'Tech', icon: LANE_ICONS.tech, tint: 'var(--sky)' },
    { v: 'design', l: 'Design', icon: LANE_ICONS.design, tint: 'var(--blush)' },
    { v: 'marketing', l: 'Marketing', icon: LANE_ICONS.marketing, tint: 'var(--peach)' },
    { v: 'ops', l: 'Operations', icon: LANE_ICONS.ops, tint: 'var(--lilac)' },
    { v: 'ngo', l: 'NGO and development', icon: LANE_ICONS.ngo, tint: 'var(--sky)' },
    { v: 'health', l: 'Health', icon: LANE_ICONS.health, tint: 'var(--blush)' },
    { v: 'teaching', l: 'Teaching', icon: LANE_ICONS.teaching, tint: 'var(--lilac)' },
  ] },
  { k: 'place', title: 'Where should it be?', sub: 'Remote roles that take Nigeria come along whatever you pick.', grid: 'two', opts: [
    { v: 'Lagos', l: 'Lagos', icon: I.pin, tint: 'var(--butter)' },
    { v: 'Abuja', l: 'Abuja', icon: I.pin, tint: 'var(--mint)' },
    { v: 'Port Harcourt', l: 'Port Harcourt', icon: I.pin, tint: 'var(--sky)' },
    { v: 'Ibadan', l: 'Ibadan', icon: I.pin, tint: 'var(--peach)' },
    { v: 'Kano', l: 'Kano', icon: I.pin, tint: 'var(--lilac)' },
    { v: 'any', l: 'Anywhere in Nigeria', icon: I.flag, tint: 'var(--mint)' },
    { v: 'remote', l: 'Remote only', icon: I.globe, tint: 'var(--sky)' },
  ] },
];

type Sel = Record<Key, string[]>;
const EMPTY: Sel = { mode: [], level: [], lane: [], place: [] };

const Check = () => <span className="ck" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg></span>;

export function Quiz() {
  const router = useRouter();
  const [i, setI] = useState(0); // 0..3 questions, 4 = summary
  const [sel, setSel] = useState<Sel>(EMPTY);
  const step = STEPS[i];
  const total = STEPS.length;
  const picks = sel.mode.length + sel.level.length + sel.lane.length + sel.place.length;

  const toggle = (k: Key, v: string) => setSel((s) => {
    let next = s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v];
    if (k === 'place' && v === 'remote' && next.includes('remote')) next = ['remote'];
    if (k === 'place' && v !== 'remote') next = next.filter((x) => x !== 'remote');
    if (k === 'place' && v === 'any' && next.includes('any')) next = ['any'];
    if (k === 'place' && v !== 'any') next = next.filter((x) => x !== 'any');
    return { ...s, [k]: next };
  });

  const href = useMemo(() => {
    const p = new URLSearchParams();
    p.set('match', '1');
    const mode = sel.place.includes('remote') ? ['remote'] : [...sel.mode];
    if (mode.length) p.set('mode', mode.join(','));
    if (sel.level.length) p.set('level', sel.level.join(','));
    if (sel.lane.length) p.set('lane', sel.lane.join(','));
    const cities = sel.place.filter((x) => x !== 'any' && x !== 'remote');
    if (cities.length) p.set('city', cities.join(','));
    return `/jobs?${p.toString()}`;
  }, [sel]);

  const go = () => router.push(href);
  const next = () => (i < total - 1 ? setI(i + 1) : setI(total));
  const back = () => setI(Math.max(0, i - 1));
  const label = (k: Key, v: string) => STEPS.find((s) => s.k === k)!.opts.find((o) => o.v === v)?.l || v;

  return (
    <div className="qwrap">
      <div className="qtop">
        <button type="button" className="icon-btn" onClick={back} disabled={i === 0} aria-label="Back" style={i === 0 ? { opacity: .35 } : undefined}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
        </button>
        <div className="qbar-prog" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(i + 1, total)}><i style={{ width: `${(Math.min(i + 1, total) / total) * 100}%` }} /></div>
        <span className="qstep">{i < total ? `${i + 1} / ${total}` : 'Done'}</span>
      </div>

      {i < total ? (
        <div className="qq" key={step.k}>
          <h1>{step.title}</h1>
          <p className="qsub">{step.sub}</p>
          <div className={`qgrid ${step.grid}`} role="group" aria-label={step.title}>
            {step.opts.map((o) => {
              const on = sel[step.k].includes(o.v);
              return (
                <button key={o.v} type="button" className={`qtile${step.grid === 'one' ? ' row' : ''}${on ? ' on' : ''}`} aria-pressed={on} onClick={() => toggle(step.k, o.v)}>
                  {o.icon && <span className="ic" style={{ background: on ? undefined : o.tint }}>{o.icon}</span>}
                  <span>{o.l}{o.s && <small>{o.s}</small>}</span>
                  <Check />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="qq" key="summary">
          <h1>Your picks.</h1>
          <p className="qsub">{picks ? 'Tap edit to change anything.' : 'Nothing picked, so you get everything, newest first.'}</p>
          {STEPS.map((s, idx) => (
            <div className="qsum" key={s.k}>
              <div style={{ minWidth: 0 }}>
                <b>{s.title}</b>
                <div className="vals">{sel[s.k].length ? sel[s.k].map((v) => <span key={v} className="chip chip-mint">{label(s.k, v)}</span>) : <span className="chip">Any</span>}</div>
              </div>
              <button type="button" className="edit" onClick={() => setI(idx)}>Edit</button>
            </div>
          ))}
        </div>
      )}

      <div className="qactions">
        <div>
          {i < total ? (
            <>
              {sel[step.k].length ? (
                <button type="button" className="btn btn-ghost" onClick={() => setSel((s) => ({ ...s, [step.k]: [] }))}>Clear</button>
              ) : (
                <button type="button" className="btn btn-ghost" onClick={next}>Skip</button>
              )}
              <button type="button" className="btn btn-ink" onClick={next}>{i === total - 1 ? 'Review' : 'Next'} <ArrowIcon size={16} /></button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => { setSel(EMPTY); setI(0); }}>Start over</button>
              <button type="button" className="btn btn-ink" onClick={go}>Show my matches <ArrowIcon size={16} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
