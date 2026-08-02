begin;

-- Profiles: users may create only normal accounts and update only non-security fields.
drop policy if exists "Admin can update any profile" on public.profiles;
drop policy if exists "Admin can view all profiles" on public.profiles;
drop policy if exists "Enable read access for all authenticated users" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;

create policy "Users can insert safe own profile"
on public.profiles for insert to authenticated
with check (
  (select auth.uid()) = id
  and role in ('job_seeker', 'employee')
  and coalesce(is_verified, false) = false
);

create policy "Users can view own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can update safe own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke insert, update on public.profiles from authenticated;
grant insert (id, email, full_name, role, company, has_accepted_terms, terms_accepted_at)
on public.profiles to authenticated;
grant update (full_name, company, has_accepted_terms, terms_accepted_at) on public.profiles to authenticated;
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Jobs: only approved active listings are public. All writes go through trusted routes.
drop policy if exists "Anyone can view active jobs" on public.jobs;
drop policy if exists "Employees can insert own jobs" on public.jobs;
drop policy if exists "Employees can update own jobs" on public.jobs;
drop policy if exists "Employees can delete own jobs" on public.jobs;

create policy "Approved active jobs are public"
on public.jobs for select to anon, authenticated
using (is_active = true and approval_status = 'approved');

create policy "Employees can view own jobs"
on public.jobs for select to authenticated
using ((select auth.uid()) = employee_id);

revoke insert, update, delete on public.jobs from anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant all on public.jobs to service_role;

-- Applications: reads remain owner-scoped; all mutations use validated functions/routes.
drop policy if exists "Job seekers can insert own applications" on public.applications;
drop policy if exists "Employees can update applications for their jobs" on public.applications;
drop policy if exists "Employees can view applications for their jobs" on public.applications;
drop policy if exists "Job seekers can view own applications" on public.applications;

create policy "Job seekers can view own applications"
on public.applications for select to authenticated
using ((select auth.uid()) = job_seeker_id);

create policy "Employees can view applications for their jobs"
on public.applications for select to authenticated
using ((select auth.uid()) = employee_id);

revoke insert, update, delete on public.applications from anon, authenticated;
grant select on public.applications to authenticated;
grant all on public.applications to service_role;

-- Notifications and transactions are server-authored only.
drop policy if exists "Service role can insert notifications" on public.notifications;
drop policy if exists "Users mark own notifications read" on public.notifications;
drop policy if exists "Users read own notifications" on public.notifications;

create policy "Users read own notifications"
on public.notifications for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users mark own notifications read"
on public.notifications for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke insert, delete on public.notifications from anon, authenticated;
grant select, update (is_read) on public.notifications to authenticated;
grant all on public.notifications to service_role;

drop policy if exists "Users can create their own transactions" on public.transactions;
drop policy if exists "Users can view their own transactions" on public.transactions;

create policy "Users can view own transactions"
on public.transactions for select to authenticated
using ((select auth.uid()) = user_id);

revoke insert, update, delete on public.transactions from anon, authenticated;
grant select on public.transactions to authenticated;
grant all on public.transactions to service_role;

-- One proxy per application makes payment/application retries idempotent.
create unique index if not exists proxy_emails_application_id_key
on public.proxy_emails(application_id);

-- Private, size-limited buckets. Resume ranking supports PDF input only.
update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['application/pdf']::text[]
where id = 'resumes';

update storage.buckets
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'verification-documents';

update public.profiles
set verification_document_url = regexp_replace(
  verification_document_url,
  '^.*/verification-documents/',
  ''
)
where verification_document_url like '%/verification-documents/%';

drop policy if exists "Authenticated users can upload resumes" on storage.objects;
drop policy if exists "Employees can view resumes of applicants" on storage.objects;
drop policy if exists "Users can view their own resumes" on storage.objects;
drop policy if exists "Authenticated users can upload verification docs" on storage.objects;
drop policy if exists "Public can view verification docs" on storage.objects;
drop policy if exists "Users can update their own verification docs" on storage.objects;

create policy "Users upload own PDF resumes"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and lower(storage.extension(name)) = 'pdf'
);

create policy "Resume owners and assigned employees can read"
on storage.objects for select to authenticated
using (
  bucket_id = 'resumes'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or exists (
      select 1 from public.applications a
      where a.resume_url = name and a.employee_id = (select auth.uid())
    )
  )
);

create policy "Users upload own verification evidence"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Users read own verification evidence"
on storage.objects for select to authenticated
using (
  bucket_id = 'verification-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Replace the unsafe caller-controlled pool function.
drop function if exists public.safe_pool_apply(uuid, uuid, uuid, text, text, text, text, integer, integer);

create or replace function public.submit_application(
  p_job_id uuid,
  p_cover_letter text,
  p_linkedin_url text default null,
  p_portfolio_url text default null,
  p_resume_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_job public.jobs%rowtype;
  v_profile public.profiles%rowtype;
  v_application_id uuid;
  v_pool_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_cover_letter, ''))) < 20 or length(p_cover_letter) > 5000 then
    raise exception 'invalid_cover_letter' using errcode = '22023';
  end if;

  select * into v_job from public.jobs where id = p_job_id for update;
  if not found or not v_job.is_active or v_job.approval_status <> 'approved' then
    raise exception 'job_unavailable' using errcode = '22023';
  end if;

  select * into v_profile from public.profiles where id = v_user_id for update;
  if not found or v_profile.role <> 'job_seeker' then
    raise exception 'job_seeker_required' using errcode = '42501';
  end if;
  if coalesce(v_profile.token_balance, 0) < 1 then
    raise exception 'insufficient_tokens' using errcode = '22023';
  end if;
  if p_resume_url is not null and p_resume_url <> '' and p_resume_url not like v_user_id::text || '/%' then
    raise exception 'invalid_resume_path' using errcode = '42501';
  end if;

  if v_job.referral_type = 'pooling' then
    select count(*) into v_pool_count
    from public.applications
    where job_id = p_job_id and status not in ('rejected', 'expired');
    if v_pool_count >= coalesce(v_job.pool_size, 10) then
      raise exception 'pool_full' using errcode = '22023';
    end if;
  end if;

  update public.profiles
  set token_balance = token_balance - 1
  where id = v_user_id and token_balance >= 1;
  if not found then
    raise exception 'insufficient_tokens' using errcode = '22023';
  end if;

  insert into public.applications (
    job_id, job_seeker_id, employee_id, cover_letter,
    linkedin_url, portfolio_url, resume_url, status, referral_type
  ) values (
    p_job_id, v_user_id, v_job.employee_id, trim(p_cover_letter),
    nullif(trim(p_linkedin_url), ''), nullif(trim(p_portfolio_url), ''),
    nullif(trim(p_resume_url), ''), 'pending', v_job.referral_type
  ) returning id into v_application_id;

  if v_job.referral_type = 'pooling' then
    v_pool_count := v_pool_count + 1;
  end if;

  return jsonb_build_object(
    'success', true,
    'application_id', v_application_id,
    'employee_id', v_job.employee_id,
    'referral_type', v_job.referral_type,
    'pool_count', v_pool_count,
    'pool_size', coalesce(v_job.pool_size, 10),
    'pool_filled', v_job.referral_type = 'pooling' and v_pool_count >= coalesce(v_job.pool_size, 10)
  );
exception
  when unique_violation then
    raise exception 'already_applied' using errcode = '23505';
end;
$$;

revoke all on function public.submit_application(uuid, text, text, text, text) from public, anon;
grant execute on function public.submit_application(uuid, text, text, text, text) to authenticated, service_role;

create or replace function public.review_application(
  p_application_id uuid,
  p_action text,
  p_proxy_address text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_app public.applications%rowtype;
  v_balance integer;
  v_new_status text;
begin
  if v_user_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  if p_action not in ('accepted', 'rejected') then
    raise exception 'invalid_action' using errcode = '22023';
  end if;

  select * into v_app from public.applications where id = p_application_id for update;
  if not found or v_app.employee_id <> v_user_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_app.status <> 'pending' then
    raise exception 'invalid_state' using errcode = '22023';
  end if;

  if p_action = 'rejected' then
    update public.applications set status = 'rejected', reviewed_at = now() where id = v_app.id;
    return jsonb_build_object('success', true, 'status', 'rejected', 'job_seeker_id', v_app.job_seeker_id);
  end if;

  if v_app.referral_type = 'pooling' then
    update public.applications
    set status = 'rejected', reviewed_at = now()
    where job_id = v_app.job_id and id <> v_app.id and status = 'pending';
    v_new_status := 'accepted';
  else
    select token_balance into v_balance from public.profiles where id = v_app.job_seeker_id for update;
    if coalesce(v_balance, 0) >= 9 then
      update public.profiles set token_balance = token_balance - 9 where id = v_app.job_seeker_id;
      insert into public.transactions (user_id, application_id, amount, tokens_added, type, status)
      values (v_app.job_seeker_id, v_app.id, 0, -9, 'premium_fee', 'success');
      v_new_status := 'accepted';
    else
      v_new_status := 'selected';
    end if;
  end if;

  update public.applications
  set status = v_new_status,
      selected_at = case when v_new_status = 'selected' then now() else selected_at end,
      reviewed_at = now()
  where id = v_app.id;

  if v_new_status = 'accepted' then
    insert into public.proxy_emails(application_id, proxy_address, real_email, is_active)
    select v_app.id, p_proxy_address, p.email, true
    from public.profiles p where p.id = v_app.job_seeker_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'job_seeker_id', v_app.job_seeker_id,
    'proxy_address', case when v_new_status = 'accepted' then p_proxy_address else null end
  );
end;
$$;

revoke all on function public.review_application(uuid, text, text) from public, anon;
grant execute on function public.review_application(uuid, text, text) to authenticated, service_role;

create or replace function public.complete_selected_application(
  p_application_id uuid,
  p_proxy_address text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_app public.applications%rowtype;
  v_balance integer;
begin
  if v_user_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select * into v_app from public.applications where id = p_application_id for update;
  if not found or v_app.job_seeker_id <> v_user_id then
    raise exception 'not_found' using errcode = '22023';
  end if;
  if v_app.status <> 'selected' or v_app.selected_at < now() - interval '24 hours' then
    raise exception 'invalid_or_expired_state' using errcode = '22023';
  end if;

  select token_balance into v_balance from public.profiles where id = v_user_id for update;
  if coalesce(v_balance, 0) < 9 then
    raise exception 'insufficient_tokens' using errcode = '22023';
  end if;

  update public.profiles set token_balance = token_balance - 9 where id = v_user_id;
  insert into public.transactions(user_id, application_id, amount, tokens_added, type, status)
  values(v_user_id, v_app.id, 0, -9, 'premium_fee', 'success');
  insert into public.proxy_emails(application_id, proxy_address, real_email, is_active)
  select v_app.id, p_proxy_address, p.email, true from public.profiles p where p.id = v_user_id;
  update public.applications set status = 'accepted' where id = v_app.id;

  return jsonb_build_object('success', true, 'status', 'accepted', 'proxy_address', p_proxy_address);
end;
$$;

revoke all on function public.complete_selected_application(uuid, text) from public, anon;
grant execute on function public.complete_selected_application(uuid, text) to authenticated, service_role;

-- Resume ranking audit trail. Results are suggestions and never update application decisions.
create table if not exists public.resume_ranking_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  trigger_kind text not null check (trigger_kind in ('automatic', 'manual')),
  run_number integer not null check (run_number between 1 and 2),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  model text not null,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  unique(job_id, run_number)
);

create table if not exists public.resume_ranking_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.resume_ranking_runs(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  rank integer not null check (rank > 0),
  score integer not null check (score between 0 and 100),
  summary text not null,
  strengths jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique(run_id, application_id),
  unique(run_id, rank)
);

alter table public.resume_ranking_runs enable row level security;
alter table public.resume_ranking_results enable row level security;

create policy "Employees view own ranking runs"
on public.resume_ranking_runs for select to authenticated
using (exists (
  select 1 from public.jobs j
  where j.id = job_id and j.employee_id = (select auth.uid())
));

create policy "Employees view own ranking results"
on public.resume_ranking_results for select to authenticated
using (exists (
  select 1 from public.resume_ranking_runs r
  join public.jobs j on j.id = r.job_id
  where r.id = run_id and j.employee_id = (select auth.uid())
));

grant select on public.resume_ranking_runs, public.resume_ranking_results to authenticated;
grant all on public.resume_ranking_runs, public.resume_ranking_results to service_role;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;
revoke all on public.admin_audit_logs from anon, authenticated;
grant all on public.admin_audit_logs to service_role;

-- Payment settlement is idempotent and credits tokens in the same transaction.
create unique index if not exists transactions_razorpay_order_id_key
on public.transactions(razorpay_order_id)
where razorpay_order_id is not null;

create or replace function public.credit_token_purchase(
  p_order_id text,
  p_payment_id text,
  p_expected_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_transaction public.transactions%rowtype;
begin
  select * into v_transaction
  from public.transactions
  where razorpay_order_id = p_order_id
  for update;

  if not found then
    raise exception 'transaction_not_found' using errcode = 'P0002';
  end if;
  if p_expected_user_id is not null and v_transaction.user_id <> p_expected_user_id then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_transaction.type <> 'token' or v_transaction.tokens_added <= 0 then
    raise exception 'invalid_transaction_type' using errcode = '22023';
  end if;
  if v_transaction.status = 'success' then
    return jsonb_build_object('success', true, 'already_processed', true);
  end if;
  if v_transaction.status <> 'pending' then
    raise exception 'transaction_not_pending' using errcode = '22023';
  end if;

  update public.profiles
  set token_balance = coalesce(token_balance, 0) + v_transaction.tokens_added
  where id = v_transaction.user_id;
  if not found then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  update public.transactions
  set status = 'success', razorpay_payment_id = p_payment_id
  where id = v_transaction.id;

  return jsonb_build_object(
    'success', true,
    'already_processed', false,
    'tokens_added', v_transaction.tokens_added
  );
end;
$$;

revoke all on function public.credit_token_purchase(text, text, uuid) from public, anon, authenticated;
grant execute on function public.credit_token_purchase(text, text, uuid) to service_role;

commit;
