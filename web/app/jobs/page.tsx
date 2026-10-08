import type { Metadata } from 'next';
import { JobListPage, type Params } from '@/components/JobList';

export const revalidate = 300;
export const metadata: Metadata = { title: 'Browse jobs', description: 'Every open role in Nigeria plus remote roles that accept Nigerian applicants. Filter by city, level and lane. Checked hourly.' };

export default async function Jobs({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const title = sp.match === '1' ? 'Your matches. Go get them.' : sp.q ? `Jobs for "${String(sp.q).slice(0, 40)}"` : 'All jobs';
  return <JobListPage sp={sp} base="/jobs" title={title} active="jobs" />;
}
