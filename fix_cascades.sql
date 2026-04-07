-- Fix missing ON DELETE CASCADE for applications.employee_id
-- This allows us to delete users who have received applications.

-- 1. Drop the existing foreign key constraint
ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_employee_id_fkey;

-- 2. Add the constraint back with ON DELETE CASCADE
ALTER TABLE applications
ADD CONSTRAINT applications_employee_id_fkey
FOREIGN KEY (employee_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
