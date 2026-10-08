import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Archivo_Black, Instrument_Serif, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const display = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-display', display: 'swap' });
const script = Instrument_Serif({ weight: '400', style: 'italic', subsets: ['latin'], variable: '--font-script', display: 'swap' });
const body = Bricolage_Grotesque({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-body', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://quickroles.africa';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Quick Roles: every job in Nigeria, checked hourly', template: '%s · Quick Roles' },
  description: 'Every open role in Nigeria plus the remote ones that take you. Checked every hour. No login, no fees, no stories.',
  openGraph: { siteName: 'Quick Roles', type: 'website', locale: 'en_NG' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#FFFCF5', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
