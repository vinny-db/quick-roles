-- Quick Roles v1 schema. Run once in the Supabase SQL editor.
-- Postgres 15. All times UTC.

create extension if not exists pgcrypto;

-- ---------- sources ----------
create table if not exists sources (
  id            text primary key,                 -- e.g. 'remotive', 'greenhouse:moniepoint'
  name          text not null,
  kind          text not null check (kind in ('api','rss','ats','telegram','crawl','post')),
  base_url      text,
  attribution   text,                              -- shown on cards and job pages
  allowed_in_schema boolean not null default false, -- may we emit JobPosting JSON-LD for its jobs
  full_description_allowed boolean not null default false,
  cadence_minutes int not null default 60,
  enabled       boolean not null default true,
  last_run_at   timestamptz,
  last_ok_at    timestamptz,
  last_count    int,
  last_error    text
);

-- ---------- employers ----------
create table if not exists employers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  domain        text,
  logo_url      text,
  logo_source   text check (logo_source in ('service','favicon','og','manual','source')),
  logo_checked_at timestamptz,
  ats_kind      text,
  ats_slug      text,
  created_at    timestamptz not null default now()
);
create index if not exists employers_domain_idx on employers (domain);

-- ---------- jobs ----------
create table if not exists jobs (
  id            uuid primary key default gen_random_uuid(),
  source_id     text not null references sources(id),
  employer_id   uuid references employers(id),
  external_id   text not null,
  slug          text not null unique,
  hash          text not null,                     -- normalised title + employer + city
  title         text not null,
  company       text,
  location_text text,
  city          text,
  country       text,
  work_mode     text check (work_mode in ('remote','hybrid','onsite','unknown')) default 'unknown',
  remote_scope  text check (remote_scope in ('worldwide','africa','nigeria','emea','unknown')) default 'unknown',
  level         text check (level in ('nysc','entry','mid','senior','unknown')) default 'unknown',
  lane          text check (lane in ('sales','support','finance','tech','design','marketing','ops','ngo','health','teaching','other')) default 'other',
  level_confidence numeric(3,2) default 0,
  lane_confidence  numeric(3,2) default 0,
  salary_text   text,
  salary_min    numeric,
  salary_max    numeric,
  currency      text,
  deadline      date,
  posted_at     timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  miss_count    int not null default 0,
  expired_at    timestamptz,
  apply_url     text not null,
  source_url    text,
  description_html text,                            -- only when the source allows it
  summary       text,                               -- approximately 200 chars
  tags          text[] default '{}',
  secondary_sources text[] default '{}',            -- other source ids that also carry this job
  unique (source_id, external_id)
);
create index if not exists jobs_live_idx on jobs (expired_at, posted_at desc);
create index if not exists jobs_hash_idx on jobs (hash);
create index if not exists jobs_lane_idx on jobs (lane);
create index if not exists jobs_level_idx on jobs (level);
create index if not exists jobs_city_idx on jobs (city);
create index if not exists jobs_work_mode_idx on jobs (work_mode);
create index if not exists jobs_search_idx on jobs using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(company,'') || ' ' || coalesce(summary,'')));

-- ---------- alerts ----------
create table if not exists alerts (
  id            uuid primary key default gen_random_uuid(),
  email         text,
  phone         text,
  telegram_chat_id text,
  keyword       text,
  location      text,
  filters       jsonb not null default '{}'::jsonb,
  consent_at    timestamptz not null default now(),
  confirmed_at  timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at  timestamptz,
  token         text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at    timestamptz not null default now(),
  check (email is not null or phone is not null)
);
create index if not exists alerts_email_idx on alerts (email);

-- ---------- employer posts ----------
create table if not exists employer_posts (
  id            uuid primary key default gen_random_uuid(),
  company       text not null,
  contact_email text not null,
  email_verified_at timestamptz,
  title         text not null,
  description   text not null,
  location      text,
  apply_url     text,
  apply_email   text,
  salary_text   text,
  status        text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  token         text not null unique default encode(gen_random_bytes(24), 'hex'),
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  expires_at    timestamptz
);

-- ---------- government recruitment ----------
create table if not exists gov_recruitments (
  id            uuid primary key default gen_random_uuid(),
  agency        text not null,
  portal_url    text not null,
  status        text not null check (status in ('open','shortlist','closed','rumour')),
  opened_at     date,
  closes_at     date,
  notes         text,
  updated_at    timestamptz not null default now()
);

-- ---------- reports ----------
create table if not exists reports (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid references jobs(id),
  reason        text not null,
  email         text,
  created_at    timestamptz not null default now()
);

-- ---------- views ----------
create or replace view live_jobs as
  select j.*, e.logo_url, e.domain as employer_domain, s.attribution, s.allowed_in_schema
  from jobs j
  left join employers e on e.id = j.employer_id
  join sources s on s.id = j.source_id
  where j.expired_at is null;

-- ---------- row level security ----------
-- The site reads live jobs with the anon key; everything else goes through the service role on the server.
alter table sources enable row level security;
alter table employers enable row level security;
alter table jobs enable row level security;
alter table alerts enable row level security;
alter table employer_posts enable row level security;
alter table gov_recruitments enable row level security;
alter table reports enable row level security;

create policy "public read live jobs" on jobs for select using (expired_at is null);
create policy "public read employers" on employers for select using (true);
create policy "public read sources" on sources for select using (enabled);
create policy "public read gov" on gov_recruitments for select using (true);

-- ---------- pipeline helper ----------
-- Called after each source run: jobs of that source not seen in this run get a miss; two misses expire them.
create or replace function mark_missing(p_source_id text, p_seen_at timestamptz)
returns void language sql security definer as $$
  update jobs
     set miss_count = miss_count + 1,
         expired_at = case when miss_count + 1 >= 2 and expired_at is null then now() else expired_at end
   where source_id = p_source_id
     and last_seen_at < p_seen_at
     and expired_at is null;
$$;
