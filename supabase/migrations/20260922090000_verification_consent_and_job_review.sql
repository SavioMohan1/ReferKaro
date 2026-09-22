alter table public.profiles
  add column if not exists designation text,
  add column if not exists work_email text,
  add column if not exists work_email_verified_at timestamptz,
  add column if not exists ai_verification_status text not null default 'unverified',
  add column if not exists admin_verification_status text not null default 'unverified',
  add column if not exists manual_review_requested_at timestamptz,
  add column if not exists legal_policy_version text,
  add column if not exists privacy_accepted_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_ai_verification_status_check,
  add constraint profiles_ai_verification_status_check
    check (ai_verification_status in ('unverified', 'verified', 'rejected', 'manual_review')),
  drop constraint if exists profiles_admin_verification_status_check,
  add constraint profiles_admin_verification_status_check
    check (admin_verification_status in ('unverified', 'pending', 'verified', 'rejected'));

update public.profiles
set ai_verification_status = case when is_verified then 'verified' else 'unverified' end,
    admin_verification_status = case
      when verification_status = 'verified' then 'verified'
      when verification_status = 'rejected' then 'rejected'
      when verification_status = 'pending' then 'pending'
      else 'unverified'
    end;

alter table public.jobs
  add column if not exists url_verification_status text not null default 'pending',
  add column if not exists url_verification_feedback text,
  add column if not exists url_verified_at timestamptz;

alter table public.jobs
  drop constraint if exists jobs_url_verification_status_check,
  add constraint jobs_url_verification_status_check
    check (url_verification_status in ('pending', 'matched', 'mismatch', 'unreachable'));

create table if not exists public.work_email_verification_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code_digest text not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists work_email_challenges_user_created_idx
  on public.work_email_verification_challenges (user_id, created_at desc);

alter table public.work_email_verification_challenges enable row level security;
revoke all on public.work_email_verification_challenges from anon, authenticated;
grant all on public.work_email_verification_challenges to service_role;

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_version text not null,
  terms_accepted boolean not null,
  privacy_notice_acknowledged boolean not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, policy_version)
);

create index if not exists legal_consents_user_idx on public.legal_consents (user_id, accepted_at desc);
alter table public.legal_consents enable row level security;
revoke all on public.legal_consents from anon, authenticated;
grant all on public.legal_consents to service_role;
