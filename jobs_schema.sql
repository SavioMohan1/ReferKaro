-- Jobs Table Schema
-- Add this to your existing schema

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references profiles(id) on delete cascade not null,
  company text not null,
  role_title text not null,
  department text,
  location text,
  job_type text check (job_type in ('full_time', 'part_time', 'contract', 'internship')) default 'full_time',
  experience_level text check (experience_level in ('entry', 'mid', 'senior', 'lead')) default 'mid',
  description text,
  requirements text,
  salary_min int,
  salary_max int,
  referral_fee int default 500,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table jobs enable row level security;

-- Policy: Anyone can view active jobs
create policy "Anyone can view active jobs"
  on jobs for select
  using (is_active = true);

-- Policy: Employees can insert their own jobs
create policy "Employees can insert own jobs"
  on jobs for insert
  with check (auth.uid() = employee_id);

-- Policy: Employees can update their own jobs
create policy "Employees can update own jobs"
  on jobs for update
  using (auth.uid() = employee_id);

-- Policy: Employees can delete their own jobs
create policy "Employees can delete own jobs"
  on jobs for delete
  using (auth.uid() = employee_id);

-- Add updated_at trigger
create trigger set_jobs_updated_at
  before update on jobs
  for each row
  execute procedure handle_updated_at();
