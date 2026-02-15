-- Trust & Safety Schema Updates

-- Add verification and ban fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_status text CHECK (verification_status IN ('pending', 'verified', 'rejected', 'unverified')) DEFAULT 'unverified',
ADD COLUMN IF NOT EXISTS verification_document_url text,
ADD COLUMN IF NOT EXISTS verification_score int,
ADD COLUMN IF NOT EXISTS verification_feedback text,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text;

-- Create policies for verification document storage
-- (Assuming a 'verifications' bucket will be created)
-- For now, we reuse the existing storage logic or create a new policy if needed.
