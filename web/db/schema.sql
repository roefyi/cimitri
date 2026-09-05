-- Cimitri v1 schema. Live database: mute-term-96326603 (cimitri).
-- Job types keep the original ids. Job state follows the revised PRD
-- (not_started / complete / canceled + independent flag). No vehicles.

create extension if not exists pgcrypto;

create type job_status as enum (
  'not_started',
  'complete',
  'canceled'
);

create type job_type as enum (
  'vault_wholesale',
  'vault_direct',
  'tank_sale_no_install',
  'oss_install_new',
  'oss_repair',
  'oss_install_or_repair_fl_ga',
  'pumping',
  'grease_trap',
  'car_wash_pit',
  'maintenance_other'
);

-- One shared login per company.
create table shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index people_shop_id_idx on people (shop_id);

-- Payer / billing only. Reused across jobs. Not a sales CRM.
create table customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create index customers_shop_id_idx on customers (shop_id);

-- Place of work. Owner/applicant and site contact live here, not on customer.
-- Shop / yard / pickup work uses a reusable site with is_yard_pickup = true.
create table sites (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete restrict,
  address_911 text not null,
  city text not null,
  state text not null,
  zip text not null,
  subdivision text,
  lot text,
  block text,
  owner_applicant_name text not null,
  site_contact_name text,
  site_contact_phone text,
  is_yard_pickup boolean not null default false,
  created_at timestamptz not null default now()
);

create index sites_shop_id_idx on sites (shop_id);
create index sites_customer_id_idx on sites (customer_id);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete restrict,
  site_id uuid not null references sites (id) on delete restrict,
  type job_type not null,
  scheduled_date date not null,
  scheduled_time time,
  status job_status not null default 'not_started',
  -- Independent of status: a job may be flagged with or without being complete.
  flagged boolean not null default false,
  flag_note text,
  -- Alabama OSS install/repair only; leave null on other types.
  permit_number text,
  tank text,
  system_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_flag_note_chk check (
    (flagged and flag_note is not null and length(btrim(flag_note)) > 0)
    or (not flagged and flag_note is null)
  )
);

create index jobs_shop_date_idx on jobs (shop_id, scheduled_date);
create index jobs_shop_status_idx on jobs (shop_id, status);
create index jobs_shop_flagged_idx on jobs (shop_id) where flagged;
create index jobs_site_id_idx on jobs (site_id);

-- ≥1 person is required in the app. Crew sees a job only if assigned.
create table job_assignees (
  job_id uuid not null references jobs (id) on delete cascade,
  person_id uuid not null references people (id) on delete restrict,
  primary key (job_id, person_id)
);

create index job_assignees_person_id_idx on job_assignees (person_id);

create table job_notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index job_notes_job_id_idx on job_notes (job_id);

-- storage_url is filled when Blob (or equivalent) is wired.
create table job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  storage_url text not null,
  created_at timestamptz not null default now()
);

create index job_photos_job_id_idx on job_photos (job_id);

-- 1:1 with a qualifying job. Snapshot copied from customer + site + job (not invented).
create table compliance_form_drafts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references jobs (id) on delete cascade,
  form_id text not null default 'cep5',
  payer_name text,
  payer_phone text,
  payer_email text,
  owner_applicant_name text,
  address_911 text,
  city text,
  state text,
  zip text,
  permit_number text,
  tank text,
  system_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep customer_id on jobs aligned with the site's customer.
create or replace function jobs_match_site_customer()
returns trigger as $$
begin
  if not exists (
    select 1 from sites
    where sites.id = new.site_id
      and sites.customer_id = new.customer_id
      and sites.shop_id = new.shop_id
  ) then
    raise exception 'job customer_id/shop_id must match the site';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger jobs_match_site_customer_trg
before insert or update of customer_id, site_id, shop_id on jobs
for each row execute function jobs_match_site_customer();

create or replace function jobs_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_touch_updated_at_trg
before update on jobs
for each row execute function jobs_touch_updated_at();

create or replace function compliance_form_drafts_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger compliance_form_drafts_touch_updated_at_trg
before update on compliance_form_drafts
for each row execute function compliance_form_drafts_touch_updated_at();
