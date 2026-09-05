-- Incremental migration for the live Neon database.
-- Safe to re-run.

drop table if exists job_vehicles;
drop table if exists vehicles;

do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'job_status'
      and e.enumlabel = 'scheduled'
  ) then
    create type job_status_v2 as enum ('not_started', 'complete', 'canceled');

    alter table jobs alter column status drop default;

    alter table jobs
      alter column status type job_status_v2
      using (
        case status::text
          when 'complete' then 'complete'
          when 'canceled' then 'canceled'
          else 'not_started'
        end
      )::job_status_v2;

    alter table jobs alter column status set default 'not_started';

    drop type job_status;
    alter type job_status_v2 rename to job_status;
  end if;
end $$;

alter table jobs add column if not exists flagged boolean not null default false;
alter table jobs add column if not exists flag_note text;

alter table jobs drop constraint if exists jobs_flag_note_chk;
alter table jobs add constraint jobs_flag_note_chk check (
  (flagged and flag_note is not null and length(btrim(flag_note)) > 0)
  or (not flagged and flag_note is null)
);

create index if not exists jobs_shop_flagged_idx on jobs (shop_id) where flagged;

create table if not exists job_notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists job_notes_job_id_idx on job_notes (job_id);

create table if not exists job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  storage_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists job_photos_job_id_idx on job_photos (job_id);

create table if not exists compliance_form_drafts (
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

create or replace function compliance_form_drafts_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists compliance_form_drafts_touch_updated_at_trg on compliance_form_drafts;
create trigger compliance_form_drafts_touch_updated_at_trg
before update on compliance_form_drafts
for each row execute function compliance_form_drafts_touch_updated_at();
