-- Applications Table Schema
-- Run this in Supabase SQL Editor

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade not null,
  job_seeker_id uuid references profiles(id) on delete cascade not null,
  employee_id uuid references profiles(id) not null,
  
  -- Application details
  cover_letter text,
  linkedin_url text,
  portfolio_url text,
  
  -- Status tracking
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  
  -- Timestamps
  applied_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone,
  
  -- Prevent duplicate applications (unique constraint)
  unique(job_id, job_seeker_id)
);

-- Enable RLS
alter table applications enable row level security;

-- Policy: Job seekers can view their own applications
create policy "Job seekers can view own applications"
  on applications for select
  using (auth.uid() = job_seeker_id);

-- Policy: Employees can view applications for their jobs
create policy "Employees can view applications for their jobs"
  on applications for select
  using (auth.uid() = employee_id);

-- Policy: Job seekers can insert their own applications
create policy "Job seekers can insert own applications"
  on applications for insert
  with check (auth.uid() = job_seeker_id);

-- Policy: Employees can update applications for their jobs (accept/reject)
create policy "Employees can update applications for their jobs"
  on applications for update
  using (auth.uid() = employee_id);

-- Add updated trigger (we'll update reviewed_at in application code)
