update public.jobs
set pool_size = null
where referral_type = 'single'
  and pool_size is not null;

update public.jobs
set pool_size = 10
where referral_type = 'pooling'
  and pool_size is distinct from 10;

alter table public.jobs
    drop constraint if exists jobs_fixed_candidate_pool_size_check;

alter table public.jobs
    add constraint jobs_fixed_candidate_pool_size_check
    check (
        (referral_type = 'single' and pool_size is null)
        or (referral_type = 'pooling' and pool_size = 10)
    );
