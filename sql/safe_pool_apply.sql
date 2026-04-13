-- ============================================================
-- safe_pool_apply: Atomic Pool Application Function
-- 
-- This function runs entirely inside a single DB transaction.
-- It prevents the race condition where concurrent requests
-- can all pass the pool_size check before any insert completes.
--
-- Returns: JSON object { success: boolean, reason?: string }
-- ============================================================

CREATE OR REPLACE FUNCTION safe_pool_apply(
    p_job_id          UUID,
    p_job_seeker_id   UUID,
    p_employee_id     UUID,
    p_cover_letter    TEXT,
    p_linkedin_url    TEXT,
    p_portfolio_url   TEXT,
    p_resume_url      TEXT,
    p_pool_size       INTEGER,
    p_current_token_balance INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with owner permissions, bypasses RLS for atomic ops
AS $$
DECLARE
    v_current_count INTEGER;
    v_app_id        UUID;
BEGIN
    -- 1. Lock the job row to prevent concurrent inserts from racing
    PERFORM 1 FROM jobs WHERE id = p_job_id FOR UPDATE;

    -- 2. Count current active applications for this pool
    SELECT COUNT(*) INTO v_current_count
    FROM applications
    WHERE job_id = p_job_id
      AND status NOT IN ('rejected', 'expired');

    -- 3. If pool is full, abort and return error
    IF v_current_count >= p_pool_size THEN
        RETURN json_build_object('success', false, 'reason', 'pool_full');
    END IF;

    -- 4. Deduct 1 token from the seeker's profile atomically
    UPDATE profiles
    SET token_balance = p_current_token_balance - 1
    WHERE id = p_job_seeker_id
      AND token_balance = p_current_token_balance;  -- Optimistic lock: only update if balance unchanged

    IF NOT FOUND THEN
        -- Token balance changed between check and update — concurrent deduction detected
        RETURN json_build_object('success', false, 'reason', 'token_balance_changed');
    END IF;

    -- 5. Insert the application (we're safe now — count was verified under lock)
    INSERT INTO applications (
        job_id, job_seeker_id, employee_id,
        cover_letter, linkedin_url, portfolio_url, resume_url,
        status, referral_type
    )
    VALUES (
        p_job_id, p_job_seeker_id, p_employee_id,
        p_cover_letter, p_linkedin_url, p_portfolio_url, p_resume_url,
        'pending', 'pooling'
    )
    RETURNING id INTO v_app_id;

    -- 6. Return success
    RETURN json_build_object('success', true, 'application_id', v_app_id::TEXT);

EXCEPTION
    WHEN unique_violation THEN
        -- Already applied (duplicate key on job_id + job_seeker_id if constraint exists)
        RETURN json_build_object('success', false, 'reason', 'already_applied');
    WHEN OTHERS THEN
        RAISE; -- Re-raise unexpected errors
END;
$$;

-- Grant execute permission to the anon role (used by supabase-js client)
GRANT EXECUTE ON FUNCTION safe_pool_apply(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION safe_pool_apply(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION safe_pool_apply(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER) TO service_role;
