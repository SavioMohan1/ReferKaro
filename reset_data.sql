-- OPTION 1: Reset Verified Status (Best for retrying the verification flow)
-- Use this if you want to keep the account but re-submit the verification form.
UPDATE profiles 
SET 
  is_verified = false,
  verification_status = 'unverified',
  verification_score = NULL,
  verification_feedback = NULL,
  -- Optional: Clear Name/Company if you want to re-enter them
  full_name = NULL,
  company = NULL
WHERE email = 'saviomohan2002@gmail.com'; -- Replace with specific email or remove WHERE to reset everyone.


-- OPTION 2: Clear Application Data (Fresh start)
-- Use this to delete all jobs and candidate applications.
DELETE FROM applications;
DELETE FROM jobs;


-- OPTION 3: Full User Delete (To sign up again)
-- Steps:
-- 1. Go to Supabase Dashboard -> Authentication -> Users.
-- 2. Find the user and click "Delete User".
-- This will automatically delete their profile data due to the ON DELETE CASCADE rule (if set up).
-- Alternatively, you can run this SQL (requires admin privileges):
-- DELETE FROM auth.users WHERE email = 'saviomohan2002@gmail.com';
