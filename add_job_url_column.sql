-- Add job_url column to jobs table
-- Run this in Supabase SQL Editor

alter table jobs 
add column if not exists job_url text;

-- Optional: Make salary and referral_fee fields nullable if they aren't already
-- (They should already be nullable based on the original schema)
