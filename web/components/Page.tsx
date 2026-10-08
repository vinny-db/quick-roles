import type { ReactNode } from 'react';
import { Header, Footer, BottomNav } from '@/components/Chrome';

export function Page({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <>
      <Header />
      <main className={`wrap page`} style={wide ? { maxWidth: 1160 } : undefined}>
        <h1>{title}</h1>
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
