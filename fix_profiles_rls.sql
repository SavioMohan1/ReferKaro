-- Fix: Allow Authenticated Users (Employees) to view Profiles (Job Seekers)
-- Currently, RLS likely blocks reading other users' profiles.

create policy "Enable read access for all authenticated users"
on public.profiles
for select
to authenticated
using (true);
