-- Create transactions table to track payments
create type transaction_status as enum ('pending', 'success', 'failed');

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  tokens_added int not null,
  status transaction_status default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table transactions enable row level security;

-- Policies
create policy "Users can view their own transactions"
  on transactions for select
  to authenticated
  using (auth.uid() = user_id);
