import type { Metadata } from 'next';
import { Header, BottomNav } from '@/components/Chrome';
import { Quiz } from './Quiz';

export const metadata: Metadata = { title: 'Find my match in 30 seconds', description: 'Four quick taps, no CV, no account. We hand you a list of jobs that fit.' };

export default function MatchPage() {
  return (
    <div className="quiz">
      <Header />
      <main>
        <Quiz />
      </main>
      <BottomNav active="match" />
    </div>
  );
}
