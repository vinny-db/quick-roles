import type { Metadata } from 'next';
import { Page } from '@/components/Page';
export const metadata: Metadata = { title: 'Privacy', description: 'What Quick Roles stores, why, and how to delete it.' };
export default function Privacy() {
  return (
    <Page title="Privacy, in plain English.">
      <p>Last updated 8 October 2026. Quick Roles is operated from Lagos, Nigeria, and follows the Nigeria Data Protection Act 2023.</p>
      <h2>What we store</h2>
      <ul>
        <li><b>Nothing</b> when you search, browse or open a job. No account, no tracking of who you are.</li>
        <li><b>Alerts:</b> the email address and, if you give it, the phone number you type in, the keywords and location you chose, and the time you gave consent. That is all.</li>
        <li><b>Employer posts:</b> the company name, contact email and job details you submit.</li>
        <li><b>Reports:</b> the listing you reported and, if you give it, your email so we can follow up.</li>
      </ul>
      <h2>Why</h2>
      <p>To send you the alerts you asked for, to publish and moderate employer posts, and to take down bad listings. We do not sell, rent or share your details with anyone, and we do not use them for anything else.</p>
      <h2>Who we use to do it</h2>
      <p>Supabase (database, EU region), Vercel (website hosting), Resend (email delivery), Telegram (if you choose Telegram alerts). Each only sees what it needs to do its job.</p>
      <h2>Your choices</h2>
      <ul>
        <li>Every alert email has a one-click unsubscribe link. Unsubscribing deletes your alert within 30 days.</li>
        <li>Email privacy@quickroles.africa to see, correct or delete anything we hold about you. We answer within 7 days.</li>
      </ul>
      <h2>Cookies</h2>
      <p>We set no advertising or tracking cookies. The site works without any.</p>
      <h2>Job listings</h2>
      <p>Listings come from public sources. We show the facts (title, employer, location, pay if stated, deadline) plus a short summary, and link to the original. Full descriptions appear only where the source permits it. To have a listing removed, email hello@quickroles.africa.</p>
    </Page>
  );
}
