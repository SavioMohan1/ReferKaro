alter table public.transactions
    drop constraint if exists transactions_type_check;

alter table public.transactions
    add constraint transactions_type_check
    check (type in ('token', 'success_fee', 'premium_fee'));

create unique index if not exists transactions_razorpay_payment_id_key
on public.transactions(razorpay_payment_id)
where razorpay_payment_id is not null;

create or replace function public.complete_success_fee_payment(
    p_order_id text,
    p_payment_id text,
    p_proxy_address text,
    p_expected_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_transaction public.transactions%rowtype;
    v_application public.applications%rowtype;
begin
    select * into v_transaction
    from public.transactions
    where razorpay_order_id = p_order_id
    for update;

    if not found then
        raise exception 'transaction_not_found' using errcode = 'P0002';
    end if;
    if p_expected_user_id is not null and v_transaction.user_id <> p_expected_user_id then
        raise exception 'forbidden' using errcode = '42501';
    end if;
    if v_transaction.type <> 'success_fee' or v_transaction.application_id is null then
        raise exception 'invalid_transaction_type' using errcode = '22023';
    end if;
    if v_transaction.status = 'success' then
        return jsonb_build_object('success', true, 'already_processed', true);
    end if;
    if v_transaction.status <> 'pending' then
        raise exception 'transaction_not_pending' using errcode = '22023';
    end if;

    select * into v_application
    from public.applications
    where id = v_transaction.application_id
    for update;

    if not found or v_application.job_seeker_id <> v_transaction.user_id then
        raise exception 'application_not_found' using errcode = 'P0002';
    end if;
    if v_application.status <> 'payment_pending' then
        raise exception 'invalid_application_state' using errcode = '22023';
    end if;

    insert into public.proxy_emails(application_id, proxy_address, real_email, is_active)
    select v_application.id, p_proxy_address, p.email, true
    from public.profiles p
    where p.id = v_transaction.user_id
    on conflict (application_id) do update
    set proxy_address = excluded.proxy_address,
        real_email = excluded.real_email,
        is_active = true;
    if not found then
        raise exception 'profile_not_found' using errcode = 'P0002';
    end if;

    update public.applications
    set status = 'accepted'
    where id = v_application.id;

    update public.transactions
    set status = 'success', razorpay_payment_id = p_payment_id
    where id = v_transaction.id;

    return jsonb_build_object(
        'success', true,
        'already_processed', false,
        'application_id', v_application.id
    );
end;
$$;

revoke all on function public.complete_success_fee_payment(text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.complete_success_fee_payment(text, text, text, uuid) to service_role;
