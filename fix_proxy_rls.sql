-- Fix: Allow Employees to INSERT into proxy_emails
-- This is required because the API route runs as the authenticated user.

create policy "Employees can create proxies for their apps"
on public.proxy_emails
for insert
to authenticated
with check (
  exists (
    select 1 from applications
    where applications.id = application_id
    and applications.employee_id = auth.uid()
  )
);
