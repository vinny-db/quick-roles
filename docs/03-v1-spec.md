# Quick Roles v1: Product Spec

Version 1.0, 8 Oct 2026. Owner: Vincent (CEO). Build: Claude (CTO/COO). Budget: approximately $89 remaining, all free tiers.

## 1. What v1 is

A job aggregator for Nigeria and for remote roles that accept Nigerian applicants. It pulls listings from employer career pages, public job feeds and public Telegram channels, refreshes hourly, and lets anyone search, filter, take a 30-second match quiz, and apply on the source site. No accounts. Alerts by email and Telegram.

v1 is done when all of the following are true on quickroles.africa:
1. At least 3,000 live jobs from at least 20 sources, refreshed hourly, with stale jobs removed within 24 hours of disappearing at the source.
2. A visitor on a phone can search, filter, open a job page and reach the employer's apply page in under 60 seconds on a 3G connection.
3. The match quiz returns a ranked list and can be saved as an alert.
4. An email alert goes out within 15 minutes of the hourly refresh when new jobs match.
5. Every link in the link map works, checked by Claude and then by Vincent.
6. Privacy notice, consent tick and one-click unsubscribe are live.

## 2. Scope

In v1: job search and filters, job page, match quiz, email and Telegram alerts, free employer post with moderation, "Is it real?" government page, sources page, about, privacy, admin panel (moderation, logo override, source health).

Not in v1: accounts, CV upload, AI CV or cover letter, applying through us, employer dashboards, payments, WhatsApp delivery, Jobberman content, any Red-listed source.

## 3. Pages and link map

| Route | Page | Notes |
|---|---|---|
| / | Landing | Hero, search, jump-to links, Find my match, Just dropped (newest 10), alerts band, two boxes, government strip, footer |
| /jobs | All jobs | Search, filters, sort, pagination (20 per page) |
| /jobs/remote, /jobs/fresh-grads, /jobs/lagos, /jobs/abuja, /jobs/nysc, /jobs/pays-well, /jobs/today | Pre-filtered lists | Same page, preset filters, each with its own title for search engines |
| /job/{slug} | Job page | Title, employer, location, tags, deadline, description or summary, Apply (external, new tab), similar jobs, alert box, report link |
| /match | Quiz | One screen, four multi-select questions, results, save as alert |
| /alerts | Alerts | Create an alert (keyword, location, email, optional phone, consent) |
| /alerts/confirm/{token} | Confirm | Double opt-in landing |
| /alerts/stop/{token} | Unsubscribe | One click, no login |
| /post | Post a job | Free employer form; goes to moderation queue |
| /government | Is it real? | Hand-curated list of official recruitment portals with status |
| /sources | Every source | List of sources with attribution and last-checked time |
| /about, /privacy, /report | Static | Report has a form that emails Vincent |
| /admin | Admin | Password protected. Moderation queue, logo override, source health, alert stats |
| /sitemap.xml, /robots.txt | SEO | Sitemap lists job pages that carry JSON-LD |

Nav (desktop): wordmark, Browse jobs, Remote, Fresh grads; right: Post a job, Get alerts, Find my match.
Nav (phone): wordmark and menu; bottom bar Jobs, Remote, Match, Alerts.
Apply always opens the source URL in a new tab with rel="nofollow noopener". We never host applications.

## 4. Data model (Supabase Postgres)

- sources: id, name, kind (api, rss, ats, telegram, crawl), base_url, attribution_text, allowed_in_schema (bool), cadence_minutes, last_run_at, last_ok_at, last_error, enabled
- employers: id, name, domain, logo_url, logo_source (service, favicon, og, manual), logo_checked_at, ats_kind, ats_slug
- jobs: id, source_id, employer_id, external_id, title, location_text, city, country, work_mode (remote, hybrid, onsite), remote_scope (worldwide, africa, nigeria, unknown), level (nysc, entry, mid, senior, unknown), lane (sales, support, finance, tech, design, marketing, ops, ngo, health, teaching, other), salary_text, salary_min, salary_max, currency, deadline, posted_at, first_seen_at, last_seen_at, expired_at, apply_url, source_url, description_html (only when allowed), summary (approximately 200 chars), slug, hash
- alerts: id, email, phone, telegram_chat_id, keyword, location, filters_json, consent_at, confirmed_at, unsubscribed_at, last_sent_at, token
- employer_posts: id, company, email, title, description, location, apply_url, status (pending, approved, rejected), created_at, reviewed_at
- gov_recruitments: id, agency, portal_url, status (open, shortlist, closed, rumour), opened_at, closes_at, notes, updated_at
- reports: id, job_id, reason, email, created_at

Dedupe: hash of normalised title + employer + city. Same hash from two sources keeps the employer-direct copy and records the other as a secondary source.

Expiry: a job not seen in two consecutive runs of its source is marked expired and removed from lists and sitemap; its page returns 410 after seven days.

## 5. Ingestion

Runs on GitHub Actions, one workflow per cadence, public repo (unlimited minutes). Each source is a small adapter that returns a list of normalised jobs. Adapters in v1:

| Group | Sources | Cadence |
|---|---|---|
| Remote APIs | Remotive (4/day), Himalayas, Jobicy, RemoteOK, We Work Remotely RSS | Hourly except Remotive |
| Nigerian and African RSS | Jobgurus, MyJobMag (5 feeds), Jobweb Ghana, NGO Jobs in Africa, Novojob, UN Careers, Opportunities for Africans | Hourly |
| Employer ATS | Greenhouse (Moniepoint, Jumia), Workable (Kuda, FairMoney, Reliance Health, Helium Health), BambooHR (Flutterwave, Chowdeck, Paga), Teamtailor RSS (Paystack), Ashby (M-KOPA); then SmartRecruiters (Stanbic, Deloitte), Oracle (MTN, Airtel, First Bank, UNDP), Workday (PwC, Mastercard Foundation) | Every 3 hours |
| Telegram previews | ToHire, Worka Nigeria, Jobnow Nigeria, Careerswithkemi, Legit Remote Jobs, Jobs in Nigeria Today | Hourly |
| Polite crawls | HotNigerianJobs, Jiji Jobs, Fuzu sitemap | Twice daily |

Rules: identify as QuickRolesBot with a contact email; respect robots.txt; one request every 2 seconds per host; never log in; store facts plus a 200-character summary plus link back for feed and crawl sources; store full description only for employer ATS sources; never resyndicate Remotive or Himalayas jobs into JSON-LD.

Remote eligibility: a remote job is shown only if its location restriction is worldwide, Africa, Nigeria, EMEA, or empty. US-only and EU-only remote jobs are dropped at ingestion.

Classification (level, lane, work_mode) is rule-based on title and description keywords in v1, with a confidence score. Low confidence shows "unknown" and is never asserted.

## 6. Match quiz

Four multi-select questions: work vibe (remote, hybrid, onsite), level, lanes (up to all), place. Any question may be skipped. Within a question picks are OR; across questions AND, except place is widened to include remote jobs that accept Nigeria. Results are scored by number of matched picks, then recency. Answers are stored in the URL so results can be shared and saved as an alert with one tap.

## 7. Alerts

Email via Resend (free tier 3,000/month). Double opt-in: sign-up, confirmation email, confirmed. Digest at most once a day per alert, only when there are new matches, maximum 10 jobs per email with Learn more and Apply links. One-click unsubscribe link in every email and a List-Unsubscribe header. Telegram: a public channel posts a digest of the day's new jobs; a bot allows per-alert delivery when the person taps Start. Phone numbers are stored for Telegram and future WhatsApp only, never sold or shared.

Compliance (NDPA 2023): consent tick not pre-ticked; privacy notice linked from every form; data stored is email, optional phone, preferences, timestamps; deletion on unsubscribe after 30 days; register with NDPC once past 200 subscribers.

## 8. Employer posts

Free form: company, contact email, title, description, location, apply URL or email, salary optional. Email confirmation link required. Then pending in admin. Vincent approves or rejects; approved posts appear tagged "Posted here" and are the only jobs with directApply true in JSON-LD. Posts expire after 30 days unless renewed.

## 9. SEO

JSON-LD JobPosting on job pages for sources that permit it (employer ATS, employer posts, feeds without a resyndication ban). Required fields always present; validThrough set; expired pages return 410. Sitemap regenerated hourly. Pre-filtered list pages carry unique titles and descriptions. No Indexing API.

## 10. Stack and cost

| Layer | Choice | Cost |
|---|---|---|
| Site and API | Next.js 15 on Vercel Hobby | $0 |
| Database and storage | Supabase free (500 MB, 1 GB storage) | $0 |
| Scheduled ingestion | GitHub Actions on a public repo | $0 |
| Email | Resend free (3,000/month) | $0 |
| Logos | logo.dev free tier, favicon fallback | $0 |
| Domain | quickroles.africa | Paid |
| Error tracking | Sentry free | $0 |

Free-tier watch points: Supabase pauses projects after 7 days idle (ingestion keeps it alive); Resend 3,000 emails is approximately 100 alerts a day at launch, upgrade at $20/month only when revenue or users justify it.

## 11. Build stages and checkpoints

| Stage | Delivers | Vincent checks |
|---|---|---|
| 1. Pipeline | Schema, 12 adapters, hourly workflow, dedupe, expiry, admin source health | Jobs appearing in Supabase table, counts per source |
| 2. Site | Landing, jobs list, job page, static pages, sitemap, JSON-LD | Preview link on phone; link map walk-through |
| 3. Quiz and alerts | Match page, alerts with double opt-in, Resend digest, Telegram channel | Receive a real alert email |
| 4. Employer posts and admin | Post form, moderation queue, logo override, government page | Approve a test post |
| 5. Launch | Domain connected, analytics, error tracking, final link check | Sign-off |

## 12. Acceptance checklist (run before launch)

- Every route in the link map loads and links where the map says
- 20 random Apply buttons open the correct source page
- Expired job returns 410 and is absent from lists and sitemap
- Alert sign-up, confirm, receive, unsubscribe works end to end
- Lighthouse mobile performance 80 or better on landing and job page
- JSON-LD validates in Google's Rich Results test on three job pages
- Privacy notice and consent present on every form
- No source on the Red list is referenced anywhere in code

## 13. Risks

| Risk | Handling |
|---|---|
| A source changes its format | Adapter fails loudly, source marked unhealthy in admin, others keep running |
| A source asks us to stop | Disable the adapter the same day; attribution and link-back keep goodwill |
| Free tier limits | Watch points above; nothing paid until users justify it |
| Low initial volume | Employer ATS and remote APIs alone give approximately 5,000 jobs at launch |
| Scam listings via employer posts | Moderation before publish; report link on every job |
