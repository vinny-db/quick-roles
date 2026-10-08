import type { Metadata } from 'next';
import { Page } from '@/components/Page';
export const metadata: Metadata = { title: 'Post a job, free', description: 'Reach job seekers across Nigeria. Free. Every post is checked before it goes live.' };
export default async function Post({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  return (
    <Page title="Hiring? Post it free.">
      {sp.ok ? <p><b>Got it.</b> We check every post before it goes live, usually within a day. You will get an email when it is up.</p> : (
        <form className="form" action="/api/post" method="post" style={{ paddingTop: 12 }}>
          {sp.err && <p style={{ color: '#B00020', margin: 0 }}>{sp.err}</p>}
          <p className="muted" style={{ margin: 0 }}>Free in v1. We put it in front of the right people and check it first, so no scams get through.</p>
          <label htmlFor="company">Company</label><input id="company" name="company" required maxLength={80} />
          <label htmlFor="contact_email">Your work email</label><input id="contact_email" name="contact_email" type="email" required />
          <label htmlFor="title">Job title</label><input id="title" name="title" required maxLength={120} />
          <label htmlFor="location">Location (city, or Remote)</label><input id="location" name="location" required maxLength={80} />
          <label htmlFor="salary_text">Salary (optional, shown as typed)</label><input id="salary_text" name="salary_text" maxLength={60} />
          <label htmlFor="apply_url">Where to apply (link or email)</label><input id="apply_url" name="apply_url" required maxLength={300} />
          <label htmlFor="description">Description</label><textarea id="description" name="description" required maxLength={6000} />
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 500 }}><input type="checkbox" name="agree" value="yes" required style={{ marginTop: 3 }} /> This is a real vacancy, we never charge applicants a fee, and we accept the <a href="/terms" style={{ textDecoration: 'underline' }}>terms</a>.</label>
          <button type="submit" className="btn btn-ink" style={{ width: 'fit-content' }}>Submit for review</button>
        </form>
      )}
    </Page>
  );
}
