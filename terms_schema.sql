-- Add terms acceptance tracking to profiles table
alter table profiles
add column if not exists has_accepted_terms boolean default false,
add column if not exists terms_accepted_at timestamptz;
