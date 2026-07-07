-- ReferKaro production launch schema alignment
-- Run in Supabase SQL Editor after rotating exposed credentials and before final launch.
-- This file is intentionally idempotent where PostgreSQL supports it.

-- Required extension for gen_random_uuid().
create extension if not exists pgcrypto;
-- Transaction status enum must exist before the transactions base table.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_status') then
    create type transaction_status as enum ('pending', 'success', 'failed');
  end if;
end $$;

-- Minimal base tables so this launch migration can run on a fresh Supabase project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  job_seeker_id uuid references public.profiles(id) on delete cascade,
  employee_id uuid references public.profiles(id),
  cover_letter text,
  linkedin_url text,
  portfolio_url text,
  status text default 'pending',
  applied_at timestamptz default now(),
  reviewed_at timestamptz
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(10, 2) not null default 0,
  tokens_added integer not null default 0,
  status transaction_status default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

-- Keep updated_at columns fresh where triggers use this helper.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles launch columns used by auth, verification, onboarding, legal gating, and admin checks.
alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists role text check (role in ('job_seeker', 'employee', 'admin')) default 'job_seeker',
  add column if not exists token_balance integer default 3,
  add column if not exists company text,
  add column if not exists is_verified boolean default false,
  add column if not exists verification_status text check (verification_status in ('pending', 'verified', 'rejected')),
  add column if not exists verification_score integer,
  add column if not exists verification_feedback text,
  add column if not exists verification_document_url text,
  add column if not exists has_accepted_terms boolean default false,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Service role can manage profiles" on public.profiles;
create policy "Service role can manage profiles"
on public.profiles for all
to service_role
using (true)
with check (true);

-- Jobs columns used by marketplace browsing, admin approval, referral formats, and employee dashboards.
alter table public.jobs
  add column if not exists employee_id uuid references public.profiles(id) on delete cascade,
  add column if not exists company text,
  add column if not exists role_title text,
  add column if not exists department text,
  add column if not exists location text,
  add column if not exists job_type text check (job_type in ('full_time', 'part_time', 'contract', 'internship')) default 'full_time',
  add column if not exists experience_level text check (experience_level in ('entry', 'mid', 'senior', 'lead')) default 'mid',
  add column if not exists description text,
  add column if not exists requirements text,
  add column if not exists salary_min integer,
  add column if not exists salary_max integer,
  add column if not exists referral_fee integer default 500,
  add column if not exists job_url text,
  add column if not exists referral_type text check (referral_type in ('single', 'pooling')) default 'single',
  add column if not exists pool_size integer default 10,
  add column if not exists is_active boolean default true,
  add column if not exists approval_status text check (approval_status in ('pending', 'approved', 'rejected')) default 'pending',
  add column if not exists admin_feedback text,
  add column if not exists approved_at timestamptz,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.jobs enable row level security;

drop policy if exists "Anyone can view approved active jobs" on public.jobs;
create policy "Anyone can view approved active jobs"
on public.jobs for select
to anon, authenticated
using (is_active = true and approval_status = 'approved');

drop policy if exists "Employees can view own jobs" on public.jobs;
create policy "Employees can view own jobs"
on public.jobs for select
to authenticated
using (auth.uid() = employee_id);

drop policy if exists "Employees can insert own jobs" on public.jobs;
create policy "Employees can insert own jobs"
on public.jobs for insert
to authenticated
with check (auth.uid() = employee_id);

drop policy if exists "Employees can update own jobs" on public.jobs;
create policy "Employees can update own jobs"
on public.jobs for update
to authenticated
using (auth.uid() = employee_id)
with check (auth.uid() = employee_id);

drop policy if exists "Service role can manage jobs" on public.jobs;
create policy "Service role can manage jobs"
on public.jobs for all
to service_role
using (true)
with check (true);

drop trigger if exists set_jobs_updated_at on public.jobs;
create trigger set_jobs_updated_at
before update on public.jobs
for each row execute procedure public.handle_updated_at();

-- Applications columns and statuses used by token apply, selected/payment flows, expiry, and referral proof.
alter table public.applications
  add column if not exists resume_url text,
  add column if not exists referral_type text check (referral_type in ('single', 'pooling')),
  add column if not exists selected_at timestamptz,
  add column if not exists updated_at timestamptz default now();

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications
  add constraint applications_status_check
  check (status in ('pending', 'payment_pending', 'selected', 'accepted', 'rejected', 'expired', 'referred'));

alter table public.applications enable row level security;

drop policy if exists "Job seekers can view own applications" on public.applications;
create policy "Job seekers can view own applications"
on public.applications for select
to authenticated
using (auth.uid() = job_seeker_id);

drop policy if exists "Employees can view applications for their jobs" on public.applications;
create policy "Employees can view applications for their jobs"
on public.applications for select
to authenticated
using (auth.uid() = employee_id);

drop policy if exists "Job seekers can insert own applications" on public.applications;
create policy "Job seekers can insert own applications"
on public.applications for insert
to authenticated
with check (auth.uid() = job_seeker_id);

drop policy if exists "Employees can update applications for their jobs" on public.applications;
create policy "Employees can update applications for their jobs"
on public.applications for update
to authenticated
using (auth.uid() = employee_id)
with check (auth.uid() = employee_id);

drop policy if exists "Service role can manage applications" on public.applications;
create policy "Service role can manage applications"
on public.applications for all
to service_role
using (true)
with check (true);

create unique index if not exists applications_job_seeker_unique
on public.applications(job_id, job_seeker_id);

create index if not exists applications_status_selected_at_idx
on public.applications(status, selected_at);

-- Transactions used by Razorpay token purchases and success-fee reconciliation.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_status') then
    create type transaction_status as enum ('pending', 'success', 'failed');
  end if;
end $$;

alter table public.transactions
  add column if not exists application_id uuid references public.applications(id) on delete set null,
  add column if not exists type text default 'token';

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.transactions'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%type%';

  if constraint_name is not null then
    execute 'alter table public.transactions drop constraint ' || quote_ident(constraint_name);
  end if;
end $$;

alter table public.transactions
  add constraint transactions_type_check
  check (type in ('token', 'success_fee', 'premium_fee'));

alter table public.transactions enable row level security;

drop policy if exists "Users can view their own transactions" on public.transactions;
create policy "Users can view their own transactions"
on public.transactions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own transactions" on public.transactions;
create policy "Users can create their own transactions"
on public.transactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Service role can manage transactions" on public.transactions;
create policy "Service role can manage transactions"
on public.transactions for all
to service_role
using (true)
with check (true);

create unique index if not exists transactions_razorpay_order_id_unique
on public.transactions(razorpay_order_id)
where razorpay_order_id is not null;

-- Proxy email relay table used by referral proof and inbound webhooks.
create table if not exists public.proxy_emails (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  proxy_address text not null unique,
  real_email text not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

alter table public.proxy_emails enable row level security;

drop policy if exists "Employees can view proxies for their apps" on public.proxy_emails;
create policy "Employees can view proxies for their apps"
on public.proxy_emails for select
to authenticated
using (
  exists (
    select 1 from public.applications
    where applications.id = proxy_emails.application_id
      and applications.employee_id = auth.uid()
  )
);

drop policy if exists "Job Seekers can view their own proxies" on public.proxy_emails;
create policy "Job Seekers can view their own proxies"
on public.proxy_emails for select
to authenticated
using (
  exists (
    select 1 from public.applications
    where applications.id = proxy_emails.application_id
      and applications.job_seeker_id = auth.uid()
  )
);

drop policy if exists "Service role can manage all proxies" on public.proxy_emails;
create policy "Service role can manage all proxies"
on public.proxy_emails for all
to service_role
using (true)
with check (true);

-- Notifications used by dashboard inbox, admin review, and referral status changes.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text,
  job_link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
on public.notifications for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Service role can manage notifications" on public.notifications;
create policy "Service role can manage notifications"
on public.notifications for all
to service_role
using (true)
with check (true);

create index if not exists notifications_user_created_at_idx
on public.notifications(user_id, created_at desc);

-- Storage buckets used by resume uploads and employment verification.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Authenticated users can upload resumes" on storage.objects;
create policy "Authenticated users can upload resumes"
on storage.objects for insert
to authenticated
with check (bucket_id = 'resumes');

drop policy if exists "Authenticated users can read resumes" on storage.objects;
create policy "Authenticated users can read resumes"
on storage.objects for select
to authenticated
using (bucket_id = 'resumes');

drop policy if exists "Authenticated users can upload verification docs" on storage.objects;
create policy "Authenticated users can upload verification docs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'verification-documents');

drop policy if exists "Public can view verification docs" on storage.objects;
create policy "Public can view verification docs"
on storage.objects for select
to public
using (bucket_id = 'verification-documents');

-- Atomic pooling apply function used by /api/applications/apply.
create or replace function public.safe_pool_apply(
  p_job_id uuid,
  p_job_seeker_id uuid,
  p_employee_id uuid,
  p_cover_letter text,
  p_linkedin_url text,
  p_portfolio_url text,
  p_resume_url text,
  p_pool_size integer,
  p_current_token_balance integer
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_app_id uuid;
begin
  select count(*) into v_count
  from public.applications
  where job_id = p_job_id;

  if v_count >= p_pool_size then
    return json_build_object('success', false, 'reason', 'pool_full');
  end if;

  update public.profiles
  set token_balance = p_current_token_balance - 1
  where id = p_job_seeker_id
    and token_balance = p_current_token_balance
    and token_balance >= 1;

  if not found then
    return json_build_object('success', false, 'reason', 'token_conflict');
  end if;

  insert into public.applications (
    job_id,
    job_seeker_id,
    employee_id,
    cover_letter,
    linkedin_url,
    portfolio_url,
    resume_url,
    status,
    referral_type
  ) values (
    p_job_id,
    p_job_seeker_id,
    p_employee_id,
    p_cover_letter,
    p_linkedin_url,
    p_portfolio_url,
    p_resume_url,
    'pending',
    'pooling'
  )
  returning id into v_app_id;

  return json_build_object('success', true, 'application_id', v_app_id::text);
exception
  when unique_violation then
    update public.profiles
    set token_balance = token_balance + 1
    where id = p_job_seeker_id;
    return json_build_object('success', false, 'reason', 'duplicate');
  when others then
    update public.profiles
    set token_balance = token_balance + 1
    where id = p_job_seeker_id;
    raise;
end;
$$;

grant execute on function public.safe_pool_apply(uuid, uuid, uuid, text, text, text, text, integer, integer) to authenticated;
