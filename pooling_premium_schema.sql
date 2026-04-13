-- Phase A: Pooling & Premium System Database Schema Updates

-- 1. Modify jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS referral_type text CHECK (referral_type IN ('single', 'pooling')) DEFAULT 'single',
ADD COLUMN IF NOT EXISTS pool_size int DEFAULT 10;

-- 2. Modify applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS referral_type text CHECK (referral_type IN ('single', 'pooling')),
ADD COLUMN IF NOT EXISTS selected_at timestamp with time zone;

-- Update the check constraint on applications.status
-- We need to drop the old constraint and add a new one.
-- First, find the name of the existing constraint (e.g., applications_status_check)
-- Since we may not know the exact system-generated name, it's safer to explicitly replace the constraint if we had named it, but if not, we can alter the column or add a new constraint.

DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'applications'::regclass AND contype = 'c' AND conname LIKE '%status%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE applications DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('pending', 'payment_pending', 'selected', 'accepted', 'rejected', 'expired'));
