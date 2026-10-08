import type { Metadata } from 'next';
import Link from 'next/link';
import { Page } from '@/components/Page';
export const metadata: Metadata = { title: 'About', description: 'What Quick Roles is, where the jobs come from, and what we never do.' };
export default function About() {
  return (
    <Page title="Well, they're hiring. We just made it easier.">
      <p>Quick Roles pulls every open role we can find in Nigeria, plus remote jobs that accept applicants from Nigeria, into one place. We check our sources every hour, drop anything that has closed, and send you straight to the employer or source site to apply.</p>
      <h2>What we never do</h2>
      <ul>
        <li>Charge you. Not to search, not to apply, not for alerts.</li>
        <li>Ask you to create an account.</li>
        <li>Host applications. You always apply on the original site, so your details go to the employer, not to us.</li>
        <li>Show you remote jobs that would reject you for being in Nigeria.</li>
      </ul>
      <h2>Where the jobs come from</h2>
      <p>Employer career pages, public job feeds, NGO and UN feeds, and public Telegram channels. Every listing names its source and links home. The full list is on the <Link href="/sources" style={{ textDecoration: 'underline' }}>sources page</Link>.</p>
      <h2>Spotted a scam?</h2>
      <p>Nobody legitimate charges a fee to apply. If a listing asks for money, <Link href="/report" style={{ textDecoration: 'underline' }}>report it</Link> and we take it down.</p>
      <h2>Contact</h2>
      <p>hello@quickroles.africa</p>
    </Page>
  );
}
