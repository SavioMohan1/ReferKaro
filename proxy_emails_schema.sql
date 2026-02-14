-- Create the proxy_emails table
create table if not exists public.proxy_emails (
  id uuid not null default gen_random_uuid (),
  application_id uuid not null,
  proxy_address text not null unique,
  real_email text not null,
  is_active boolean default true,
  created_at timestamp with time zone not null default now(),
  constraint proxy_emails_pkey primary key (id),
  constraint proxy_emails_application_id_fkey foreign key (application_id) references applications (id) on delete cascade
);

-- Enable RLS
alter table public.proxy_emails enable row level security;

-- Policy: Employees can view proxies for applications they received
create policy "Employees can view proxies for their apps"
on public.proxy_emails
for select
to authenticated
using (
  exists (
    select 1 from applications
    where applications.id = proxy_emails.application_id
    and applications.employee_id = auth.uid()
  )
);

-- Policy: Job Seekers can view their own proxies (for transparency)
create policy "Job Seekers can view their own proxies"
on public.proxy_emails
for select
to authenticated
using (
  exists (
    select 1 from applications
    where applications.id = proxy_emails.application_id
    and applications.job_seeker_id = auth.uid()
  )
);

-- Service Role policy for backend functions (insert/update)
create policy "Service role can manage all proxies"
on public.proxy_emails
for all
to service_role
using (true)
with check (true);
