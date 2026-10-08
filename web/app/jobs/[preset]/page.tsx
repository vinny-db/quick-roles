import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JobListPage, type Params } from '@/components/JobList';

export const revalidate = 300;

const PRESETS: Record<string, { title: string; intro: string; preset: any; active?: 'remote' | 'fresh' | 'jobs'; locked: string[]; meta: string }> = {
  remote: { title: 'Remote, open to you', intro: 'Remote roles that accept applicants from Nigeria: worldwide, Africa, Nigeria or EMEA. Region-locked jobs never make it here.', preset: { mode: ['remote'] }, active: 'remote', locked: ['mode'], meta: 'Remote jobs open to Nigerian applicants, refreshed every hour.' },
  'fresh-grads': { title: 'Fresh grads, start here', intro: 'NYSC placements, internships, graduate trainee programmes and entry-level roles.', preset: { level: ['nysc', 'entry'] }, active: 'fresh', locked: ['level'], meta: 'Entry-level, NYSC and graduate trainee jobs in Nigeria, refreshed every hour.' },
  nysc: { title: 'NYSC and internships', intro: 'Placements, internships and trainee programmes that take corps members and students.', preset: { level: ['nysc'] }, active: 'fresh', locked: ['level'], meta: 'NYSC placements and internships in Nigeria, refreshed every hour.' },
  lagos: { title: 'Jobs in Lagos', intro: 'On-site and hybrid roles in Lagos, plus remote jobs that take you.', preset: { city: ['Lagos'] }, locked: ['city'], meta: 'Jobs in Lagos, refreshed every hour.' },
  abuja: { title: 'Jobs in Abuja', intro: 'On-site and hybrid roles in Abuja, plus remote jobs that take you.', preset: { city: ['Abuja'] }, locked: ['city'], meta: 'Jobs in Abuja, refreshed every hour.' },
  'port-harcourt': { title: 'Jobs in Port Harcourt', intro: 'On-site and hybrid roles in Port Harcourt, plus remote jobs that take you.', preset: { city: ['Port Harcourt'] }, locked: ['city'], meta: 'Jobs in Port Harcourt, refreshed every hour.' },
  'pays-well': { title: 'Pays well (salary shown)', intro: 'Only roles where the employer states the pay. No guessing.', preset: { salary: true, sort: 'salary' }, locked: ['salary'], meta: 'Jobs in Nigeria with salary shown, refreshed every hour.' },
  today: { title: 'Dropped today', intro: 'Everything we found in the last 24 hours.', preset: { posted: 'today' }, locked: ['posted'], meta: 'Jobs posted today in Nigeria and remote, refreshed every hour.' },
};

export function generateStaticParams() { return Object.keys(PRESETS).map((preset) => ({ preset })); }

export async function generateMetadata({ params }: { params: Promise<{ preset: string }> }): Promise<Metadata> {
  const { preset } = await params;
  const p = PRESETS[preset];
  return p ? { title: p.title, description: p.meta } : {};
}

export default async function PresetPage({ params, searchParams }: { params: Promise<{ preset: string }>; searchParams: Promise<Params> }) {
  const { preset } = await params;
  const p = PRESETS[preset];
  if (!p) notFound();
  const sp = await searchParams;
  return <JobListPage sp={sp} base={`/jobs/${preset}`} title={p.title} intro={p.intro} preset={p.preset} active={p.active || 'jobs'} lockedKeys={p.locked} />;
}
