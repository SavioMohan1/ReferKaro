-- ReferKaro Database Schema
-- Run this in Supabase SQL Editor

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text check (role in ('job_seeker', 'employee')),
  company text,
  token_balance int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Policy: Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Policy: Users can insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on profiles
  for each row
  execute procedure handle_updated_at();
