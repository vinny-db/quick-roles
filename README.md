# Quick Roles

Job aggregation platform for Nigeria and Africa. Pulls job listings from across the internet, refreshes them daily, and helps candidates find and apply for roles fast.

Live site: https://quickroles.africa (launching)

## Status

Version 1 (MVP) in progress. See `docs/` for the product spec and decisions log.

## Stack (planned)

- Next.js on Vercel (website and API)
- Supabase (database)
- Resend (email alerts)
- GitHub Actions (scheduled job refresh)

## Layout

- `pipeline/` ingestion (zero dependencies, runs on GitHub Actions hourly)
- `supabase/schema.sql` database
- `web/` the site (Next.js 15). On Vercel set the root directory to `web`
- `docs/` source register, design decisions, v1 spec
