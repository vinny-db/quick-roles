import type { MetadataRoute } from 'next';
import { allSlugs } from '@/lib/db';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://quickroles.africa';
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ['', '/jobs', '/jobs/remote', '/jobs/fresh-grads', '/jobs/nysc', '/jobs/lagos', '/jobs/abuja', '/jobs/port-harcourt', '/jobs/pays-well', '/jobs/today', '/match', '/alerts', '/post', '/government', '/sources', '/about', '/privacy', '/terms'].map((p) => ({ url: `${SITE}${p}`, changeFrequency: 'hourly' as const, priority: p === '' ? 1 : 0.7 }));
  let jobs: MetadataRoute.Sitemap = [];
  try { jobs = (await allSlugs()).filter((j) => j.allowed_in_schema).map((j) => ({ url: `${SITE}/job/${j.slug}`, lastModified: j.last_seen_at, changeFrequency: 'daily' as const, priority: 0.5 })); } catch {}
  return [...fixed, ...jobs];
}
