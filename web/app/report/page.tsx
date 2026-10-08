import type { Metadata } from 'next';
import { Page } from '@/components/Page';
export const metadata: Metadata = { title: 'Report a listing', description: 'Report a scam, a fee request, or a listing that should not be here.' };
export default async function Report({ searchParams }: { searchParams: Promise<{ job?: string; sent?: string }> }) {
  const sp = await searchParams;
  return (
    <Page title="Report a listing.">
      {sp.sent ? <p><b>Thank you.</b> We look at every report and remove bad listings the same day.</p> : (
        <form className="form" action="/api/report" method="post" style={{ paddingTop: 12 }}>
          <p className="muted" style={{ margin: 0 }}>Asked for money? Looks fake? Already closed? Tell us.</p>
          <label htmlFor="job">Job link or title</label>
          <input id="job" name="job" type="text" defaultValue={sp.job ? `https://quickroles.africa/job/${sp.job}` : ''} required />
          <label htmlFor="reason">What is wrong</label>
          <select id="reason" name="reason" required>
            <option value="fee">They asked for money</option><option value="fake">Looks fake</option><option value="closed">Already closed</option><option value="wrong">Wrong details</option><option value="other">Something else</option>
          </select>
          <label htmlFor="details">Details (optional)</label>
          <textarea id="details" name="details" />
          <label htmlFor="email">Your email (optional, if you want a reply)</label>
          <input id="email" name="email" type="email" />
          <button type="submit" className="btn btn-ink" style={{ width: 'fit-content' }}>Send report</button>
        </form>
      )}
    </Page>
  );
}
