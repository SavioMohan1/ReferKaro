-- Allow Admin to UPDATE any profile
-- Replace 'saviomohan2002@gmail.com' with your actual admin email if different.

create policy "Admin can update any profile"
  on profiles
  for update
  using (
    auth.jwt() ->> 'email' = 'saviomohan2002@gmail.com'
  );

-- Also ensure Admin can SELECT all profiles (likely already working if you can see them)
create policy "Admin can view all profiles"
  on profiles
  for select
  using (
    auth.jwt() ->> 'email' = 'saviomohan2002@gmail.com'
  );
