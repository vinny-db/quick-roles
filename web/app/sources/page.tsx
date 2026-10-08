import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { listSources } from '@/lib/db';
import { timeAgo } from '@/lib/format';
export const revalidate = 600;
export const metadata: Metadata = { title: 'Every source', description: 'Where Quick Roles jobs come from, with attribution and the time each was last checked.' };
const KIND: Record<string, string> = { api: 'Public API', rss: 'Public feed', ats: 'Employer career page', telegram: 'Public Telegram channel', crawl: 'Public page', post: 'Posted here' };
export default async function Sources() {
  const sources = await listSources();
  return (
    <Page title="Straight from the source." wide>
      <p className="muted" style={{ maxWidth: 640 }}>Every listing names its source and links home. We identify ourselves to every site we visit, respect their rules, and never log in to collect. Want your listings here, or want them gone? hello@quickroles.africa.</p>
      <table className="table" style={{ marginTop: 16 }}>
        <thead><tr><th>Source</th><th>Type</th><th>Live jobs</th><th>Last checked</th></tr></thead>
        <tbody>
          {sources.map((s: any) => (
            <tr key={s.id}>
              <td><a href={s.base_url || '#'} rel="noopener nofollow" target="_blank" style={{ fontWeight: 700 }}>{s.name}</a></td>
              <td>{KIND[s.kind] || s.kind}</td>
              <td>{s.last_count ?? '-'}</td>
              <td>{s.last_ok_at ? timeAgo(s.last_ok_at) : 'pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}
