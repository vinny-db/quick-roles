import type { Metadata } from 'next';
import { Header, Footer, BottomNav } from '@/components/Chrome';
import { AlertsBand } from '@/components/AlertsBand';
export const metadata: Metadata = { title: 'Get job alerts', description: 'New jobs that match you, by email or Telegram. No account, stop anytime.' };
export default async function Alerts({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; keyword?: string; location?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <Header />
      <main className="wrap" style={{ paddingTop: 10 }}>
        {sp.ok && <div className="sticker" style={{ background: 'var(--mint)', borderRadius: 16, padding: '14px 18px', marginTop: 10, display: 'flex' }}>Saved. Check your inbox for a confirmation link; alerts start once you tap it.</div>}
        {sp.err && <div className="sticker" style={{ background: 'var(--blush)', borderRadius: 16, padding: '14px 18px', marginTop: 10, display: 'flex' }}>Something was missing: {sp.err}. Try again below.</div>}
        <AlertsBand keyword={sp.keyword || ''} location={sp.location || ''} />
        <p className="muted" style={{ maxWidth: 640, paddingTop: 18 }}>Prefer Telegram? Join the channel at <a href="https://t.me/quickroles" style={{ textDecoration: 'underline' }}>t.me/quickroles</a> for the daily drop of new jobs.</p>
      </main>
      <Footer />
      <BottomNav active="alerts" />
    </>
  );
}
