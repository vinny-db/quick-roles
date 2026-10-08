import Link from 'next/link';
import { Page } from '@/components/Page';
export default function NotFound() {
  return (
    <Page title="This job left. Others didn't.">
      <p>The page you wanted is gone or never existed. The jobs are still here.</p>
      <p><Link href="/jobs" className="btn btn-ink">Browse jobs</Link></p>
    </Page>
  );
}
