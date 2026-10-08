import type { Metadata } from 'next';
import { Page } from '@/components/Page';
import { listGov } from '@/lib/db';
export const revalidate = 600;
export const metadata: Metadata = { title: 'Is that government recruitment real?', description: 'Official Nigerian government recruitment portals, their current status, and the one rule: nobody charges a fee.' };
const LABEL: Record<string, string> = { open: 'Open now', shortlist: 'Shortlist stage', closed: 'Closed', rumour: 'Rumour, not real' };
export default async function Gov() {
  const rows = await listGov();
  return (
    <Page title="Is that government recruitment real?" wide>
      <p style={{ maxWidth: 680 }}>Fake recruitment portals appear every time an agency hires. This page lists only the official portals, with the status we last confirmed. One rule never changes: <b>government recruitment never charges a fee</b>. Anyone asking for money is a scam.</p>
      {rows.length ? (
        <table className="table" style={{ marginTop: 16 }}>
          <thead><tr><th>Agency</th><th>Status</th><th>Dates</th><th>Official portal</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700 }}>{r.agency}</td>
                <td><span className={`status ${r.status}`}>{LABEL[r.status] || r.status}</span></td>
                <td className="muted">{r.opened_at ? new Date(r.opened_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}{r.closes_at ? ` to ${new Date(r.closes_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</td>
                <td><a href={r.portal_url} rel="noopener" target="_blank" style={{ textDecoration: 'underline', fontWeight: 700 }}>{new URL(r.portal_url).hostname}</a></td>
                <td className="muted">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty" style={{ marginTop: 20 }}><h3>Nothing open right now.</h3><p className="muted">We update this page the day an agency announces. Get an alert for "government" and we will tell you.</p></div>
      )}
      <h2>How to check any recruitment yourself</h2>
      <ul>
        <li>The address must end in <b>.gov.ng</b>. Anything else is not the government.</li>
        <li>No fee, no "processing charge", no "form" to buy. Ever.</li>
        <li>Announcements come from the agency's own site or verified social accounts, not WhatsApp broadcasts.</li>
      </ul>
    </Page>
  );
}
