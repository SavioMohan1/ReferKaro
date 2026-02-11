-- Allow authenticated users to insert their own transactions
create policy "Users can create their own transactions"
  on transactions for insert
  to authenticated
  with check (auth.uid() = user_id);
