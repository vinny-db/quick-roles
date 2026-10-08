import type { Metadata } from 'next';
import Link from 'next/link';
import { Page } from '@/components/Page';
export const metadata: Metadata = { title: 'Terms', description: 'How Quick Roles works, what we promise, and what we do not.' };
export default function Terms() {
  return (
    <Page title="Terms, in plain English.">
      <p>Last updated 8 October 2026. Using Quick Roles means you accept these terms. They are governed by the laws of the Federal Republic of Nigeria.</p>
      <h2>What Quick Roles is</h2>
      <ul>
        <li>A job finder. We collect open roles from public sources, check them every hour, and link you to the original listing.</li>
        <li>We are not the employer and not a recruiter. We do not take applications, interview anyone or decide who gets hired.</li>
        <li>Every listing names its source. You apply on the source&apos;s own site, under that site&apos;s terms.</li>
      </ul>
      <h2>Never pay to apply</h2>
      <p>Searching, applying and alerts are free. No real employer charges a fee to apply, train or &ldquo;process&rdquo; you. If a listing asks for money, do not pay and <Link href="/report">report it</Link>. We remove reported listings while we check them.</p>
      <h2>Accuracy</h2>
      <ul>
        <li>We show listings as the source published them. Details can be wrong, out of date or withdrawn before we notice. Always confirm on the source site before you act on a listing.</li>
        <li>Deadlines, pay and level are taken or inferred from the listing and can be off. Treat them as a guide.</li>
        <li>We are not responsible for the content of other websites or for what happens after you leave ours.</li>
      </ul>
      <h2>Employer posts</h2>
      <ul>
        <li>Posting is free in v1. Every post is checked before it goes live, and we can edit or remove any post at any time without notice.</li>
        <li>By posting you confirm the vacancy is real, you are allowed to advertise it, and applicants will never be charged a fee.</li>
        <li>Posts that mislead, discriminate unlawfully or ask applicants for money are removed and the poster is blocked.</li>
      </ul>
      <h2>Alerts</h2>
      <p>You only get alerts you asked for and confirmed. Every email has an unsubscribe link, and unsubscribing stops them at once. How we handle your details is in our <Link href="/privacy">privacy page</Link>.</p>
      <h2>Listings, names and logos</h2>
      <ul>
        <li>For each job we show the facts (title, employer, location, pay if stated, deadline), a short summary and a link to the original. Full descriptions appear only where the source permits it.</li>
        <li>Employer names and logos appear only to identify who is hiring. They belong to their owners and do not mean the employer endorses Quick Roles.</li>
        <li>Own a listing, name or logo and want it changed or removed? Email <a href="mailto:hello@quickroles.africa">hello@quickroles.africa</a>. We act within two working days.</li>
      </ul>
      <h2>Using the site</h2>
      <ul>
        <li>You must be of legal working age in your country to use alerts or post a job.</li>
        <li>Do not use the site to send spam, scrape it at a rate that harms it, or post anything unlawful. We may block anyone who does.</li>
      </ul>
      <h2>Liability</h2>
      <p>Quick Roles is provided as is and free of charge. To the extent the law allows, we are not liable for any loss arising from a listing, a source site, an employer, or a decision you make based on what you read here.</p>
      <h2>Changes and contact</h2>
      <p>We may update these terms; the date at the top tells you when. Questions: <a href="mailto:hello@quickroles.africa">hello@quickroles.africa</a>.</p>
    </Page>
  );
}
