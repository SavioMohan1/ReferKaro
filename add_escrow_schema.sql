-- Escrow Database Schema Updates
-- Run this script in your Supabase SQL Editor

-- 1. Update the 'applications' table to allow 'payment_pending' status.
-- We drop the existing check constraint and add a new one.
-- Note: Supabase typically names this constraint 'applications_status_check' based on the column name.
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'payment_pending'));

-- 2. Update the 'transactions' table to support Success Fees linked to specific applications.
-- Add an application_id to track which referral this payment unlocks.
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS application_id uuid REFERENCES applications(id) ON DELETE SET NULL;

-- Add a type column to differentiate between buying tokens and paying success fees.
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'token' CHECK (type IN ('token', 'success_fee'));
