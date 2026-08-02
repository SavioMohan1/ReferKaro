begin;

-- Only public listings are anonymous. Private resources require a signed-in user and RLS.
revoke all on public.applications, public.notifications, public.profiles, public.proxy_emails,
  public.resume_ranking_runs, public.resume_ranking_results, public.transactions
from anon;
grant select on public.jobs to anon;

-- Merge equivalent owner/employee read policies to avoid duplicate policy evaluation.
drop policy if exists "Job seekers can view own applications" on public.applications;
drop policy if exists "Employees can view applications for their jobs" on public.applications;
create policy "Participants view applications"
on public.applications for select to authenticated
using ((select auth.uid()) in (job_seeker_id, employee_id));

drop policy if exists "Approved active jobs are public" on public.jobs;
drop policy if exists "Employees can view own jobs" on public.jobs;
create policy "Anonymous users view approved active jobs"
on public.jobs for select to anon
using (is_active = true and approval_status = 'approved');
create policy "Signed in users view published or own jobs"
on public.jobs for select to authenticated
using ((is_active = true and approval_status = 'approved') or employee_id = (select auth.uid()));

drop policy if exists "Employees can create proxies for their apps" on public.proxy_emails;
drop policy if exists "Employees can view proxies for their apps" on public.proxy_emails;
drop policy if exists "Job Seekers can view their own proxies" on public.proxy_emails;
revoke insert, update, delete on public.proxy_emails from authenticated;
grant select on public.proxy_emails to authenticated;
create policy "Application participants view proxies"
on public.proxy_emails for select to authenticated
using (exists (
  select 1 from public.applications a
  where a.id = application_id
    and (select auth.uid()) in (a.job_seeker_id, a.employee_id)
));

alter function public.handle_updated_at() set search_path = '';

create index if not exists applications_employee_id_idx on public.applications(employee_id);
create index if not exists applications_job_seeker_id_idx on public.applications(job_seeker_id);
create index if not exists jobs_employee_id_idx on public.jobs(employee_id);
create index if not exists notifications_application_id_idx on public.notifications(application_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists transactions_application_id_idx on public.transactions(application_id);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists resume_ranking_results_application_id_idx on public.resume_ranking_results(application_id);
create index if not exists resume_ranking_runs_requested_by_idx on public.resume_ranking_runs(requested_by);
create index if not exists admin_audit_logs_admin_user_id_idx on public.admin_audit_logs(admin_user_id);

commit;
