const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE_URL = 'http://localhost:3000/api';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

function getAuthHeaders(session) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
    };
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const pass = (msg) => console.log(`  ✅ PASS: ${msg}`);
const fail = (msg) => console.error(`  ❌ FAIL: ${msg}`);
const info = (msg) => console.log(`  ℹ️  ${msg}`);

let allCreatedUserIds = [];

async function createEmployee(label) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: `emp_${label}_${Date.now()}@referkaro.test`,
        password: 'password123',
        email_confirm: true
    });
    if (error) throw new Error(`Employee creation failed: ${error.message}`);
    allCreatedUserIds.push(data.user.id);
    await delay(500);
    await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role: 'employee',
        full_name: `Test Employee (${label})`,
        has_accepted_terms: true
    });
    const { data: session } = await supabaseAuth.auth.signInWithPassword({
        email: data.user.email,
        password: 'password123'
    });
    return { user: data.user, session: session.session };
}

async function createSeeker(label, tokenBalance) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: `seeker_${label}_${Date.now()}@referkaro.test`,
        password: 'password123',
        email_confirm: true
    });
    if (error) throw new Error(`Seeker creation failed: ${error.message}`);
    allCreatedUserIds.push(data.user.id);
    await delay(500);
    await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role: 'job_seeker',
        full_name: `Test Seeker (${label})`,
        token_balance: tokenBalance,
        has_accepted_terms: true
    });
    const { data: session } = await supabaseAuth.auth.signInWithPassword({
        email: data.user.email,
        password: 'password123'
    });
    return { user: data.user, session: session.session };
}

async function createJob(employeeId, referralType, poolSize = null) {
    const { data, error } = await supabaseAdmin.from('jobs').insert({
        employee_id: employeeId,
        role_title: `Test Role (${referralType})`,
        company: 'TestCorp',
        referral_type: referralType,
        pool_size: poolSize,
        description: 'Smoke test job.',
        requirements: 'Node.js',
        is_active: true
    }).select().single();
    if (error) throw new Error(`Job creation failed: ${error.message}`);
    return data;
}

// ============================================================
// PHASE 1+2: Pooling Tests (previously validated — quick re-confirm)
// ============================================================
async function testPooling() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌊 SUITE 1: POOLING FLOW');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const employee = await createEmployee('pool');
    const job = await createJob(employee.user.id, 'pooling', 10);
    info(`Job created: pool_size=10`);

    // Create 15 seekers (each with 5 tokens)
    const seekers = [];
    for (let i = 0; i < 15; i++) {
        seekers.push(await createSeeker(`pool_${i}`, 5));
    }
    info('15 seekers ready. Firing concurrent apply requests...');

    // Fire all 15 concurrently
    const results = await Promise.all(seekers.map(async (s, i) => {
        const res = await fetch(`${API_BASE_URL}/applications/apply`, {
            method: 'POST',
            headers: getAuthHeaders(s.session),
            body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: `Applicant ${i}` })
        });
        return { i, status: res.status, data: await res.json().catch(() => ({})) };
    }));

    const successes = results.filter(r => r.status === 200).length;
    const poolFullRejections = results.filter(r => r.status === 400 && JSON.stringify(r.data).includes('full')).length;
    info(`Results: ${successes} accepted | ${poolFullRejections} blocked (pool full) | ${results.filter(r => r.status !== 200 && r.status !== 400).length} errors`);

    if (successes === 10 && poolFullRejections === 5) {
        pass('Pool enforces limit of 10 under concurrent load (5 correctly blocked)');
    } else {
        fail(`Expected 10 accepted + 5 blocked. Got: ${successes} accepted + ${poolFullRejections} blocked`);
    }

    // Employee picks winner
    const { data: apps } = await supabaseAdmin.from('applications').select('*').eq('job_id', job.id);
    const winner = apps[0];

    const { data: empLogin } = await supabaseAuth.auth.signInWithPassword({ email: employee.user.email, password: 'password123' });
    const reviewRes = await fetch(`${API_BASE_URL}/applications/review`, {
        method: 'POST',
        headers: getAuthHeaders(empLogin.session),
        body: JSON.stringify({ applicationId: winner.id, status: 'accepted' })
    });
    const reviewData = await reviewRes.json();

    if (reviewRes.status === 200 && reviewData.status === 'accepted' && reviewData.proxyEmail) {
        pass(`Winner selected. Proxy email: ${reviewData.proxyEmail}`);
    } else {
        fail(`Review failed: ${JSON.stringify(reviewData)}`);
    }

    // Verify DB state
    const { data: finalApps } = await supabaseAdmin.from('applications').select('status').eq('job_id', job.id);
    const accepted = finalApps.filter(a => a.status === 'accepted').length;
    const rejected = finalApps.filter(a => a.status === 'rejected').length;
    if (accepted === 1 && rejected === 9) {
        pass(`DB state correct: 1 accepted, 9 rejected`);
    } else {
        fail(`DB state wrong: ${accepted} accepted, ${rejected} rejected (expected 1 + 9)`);
    }
}

// ============================================================
// SUITE 2A: Single Referral — Seeker HAS enough tokens (≥9)
// ============================================================
async function testSingleReferralWithTokens() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💎 SUITE 2A: SINGLE REFERRAL — Seeker Has Tokens');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const employee = await createEmployee('single_rich');
    const seeker = await createSeeker('rich', 15); // 15 tokens — enough for the 9-token fee
    const job = await createJob(employee.user.id, 'single');
    info(`Job: single referral | Seeker starts with 15 tokens`);

    // Step 1: Seeker applies (costs 1 token → should have 14 left)
    const applyRes = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: getAuthHeaders(seeker.session),
        body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: 'I have enough tokens!' })
    });
    const applyData = await applyRes.json();
    if (applyRes.status === 200) {
        pass('Application submitted (1 token deducted)');
    } else {
        fail(`Apply failed: ${JSON.stringify(applyData)}`); return;
    }

    // Verify token deducted
    const { data: profileAfterApply } = await supabaseAdmin.from('profiles').select('token_balance').eq('id', seeker.user.id).single();
    if (profileAfterApply.token_balance === 14) {
        pass(`Token balance after apply: 14 (was 15) ✓`);
    } else {
        fail(`Expected 14 tokens after apply, got: ${profileAfterApply.token_balance}`);
    }

    // Step 2: Employee accepts → seeker has ≥9 tokens → should go straight to 'accepted'
    const { data: apps } = await supabaseAdmin.from('applications').select('*').eq('job_id', job.id);
    const app = apps[0];

    const { data: empLogin } = await supabaseAuth.auth.signInWithPassword({ email: employee.user.email, password: 'password123' });
    const reviewRes = await fetch(`${API_BASE_URL}/applications/review`, {
        method: 'POST',
        headers: getAuthHeaders(empLogin.session),
        body: JSON.stringify({ applicationId: app.id, status: 'accepted' })
    });
    const reviewData = await reviewRes.json();

    if (reviewRes.status === 200 && reviewData.status === 'accepted') {
        pass(`Direct acceptance succeeded — no payment wall (seeker had ≥9 tokens)`);
    } else {
        fail(`Expected direct acceptance, got: ${JSON.stringify(reviewData)}`); return;
    }

    if (reviewData.proxyEmail) {
        pass(`Proxy email generated immediately: ${reviewData.proxyEmail}`);
    } else {
        fail(`No proxy email returned for rich-token scenario`);
    }

    // Verify 9 tokens deducted (14 - 9 = 5)
    const { data: profileAfterAccept } = await supabaseAdmin.from('profiles').select('token_balance').eq('id', seeker.user.id).single();
    if (profileAfterAccept.token_balance === 5) {
        pass(`Token balance after acceptance: 5 (was 14, deducted 9) ✓`);
    } else {
        fail(`Expected 5 tokens after acceptance, got: ${profileAfterAccept.token_balance}`);
    }

    // Verify proxy email row in DB
    const { data: proxyRow } = await supabaseAdmin.from('proxy_emails').select('*').eq('application_id', app.id).single();
    if (proxyRow && proxyRow.is_active) {
        pass(`proxy_emails row created in DB and is_active=true ✓`);
    } else {
        fail(`proxy_emails row missing or inactive`);
    }
}

// ============================================================
// SUITE 2B: Single Referral — Seeker does NOT have tokens → Selected → Top Up → Complete
// ============================================================
async function testSingleReferralWithoutTokens() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💎 SUITE 2B: SINGLE REFERRAL — Seeker Needs Top-Up');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const employee = await createEmployee('single_poor');
    const seeker = await createSeeker('poor', 3); // Only 3 tokens — not enough
    const job = await createJob(employee.user.id, 'single');
    info(`Job: single referral | Seeker starts with only 3 tokens (needs 9 for acceptance fee)`);

    // Step 1: Seeker applies (costs 1 token → 2 left)
    const applyRes = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: getAuthHeaders(seeker.session),
        body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: 'Please pick me!' })
    });
    if (applyRes.status === 200) {
        pass(`Application submitted (1 token deducted, seeker now has 2 tokens)`);
    } else {
        fail(`Apply failed: ${JSON.stringify(await applyRes.json())}`); return;
    }

    // Step 2: Employee accepts → seeker only has 2 tokens → should go to 'selected'
    const { data: apps } = await supabaseAdmin.from('applications').select('*').eq('job_id', job.id);
    const app = apps[0];

    const { data: empLogin } = await supabaseAuth.auth.signInWithPassword({ email: employee.user.email, password: 'password123' });
    const reviewRes = await fetch(`${API_BASE_URL}/applications/review`, {
        method: 'POST',
        headers: getAuthHeaders(empLogin.session),
        body: JSON.stringify({ applicationId: app.id, status: 'accepted' })
    });
    const reviewData = await reviewRes.json();

    if (reviewRes.status === 200 && reviewData.status === 'selected') {
        pass(`Correctly moved to 'selected' — employee chose seeker but seeker lacks tokens`);
    } else {
        fail(`Expected status='selected', got: ${JSON.stringify(reviewData)}`); return;
    }

    if (!reviewData.proxyEmail) {
        pass(`No proxy email yet (correct — payment pending)`);
    } else {
        fail(`Proxy email should NOT be generated before payment`);
    }

    // Step 3: Simulate seeker buying tokens (direct DB update — payment is mocked)
    info(`Simulating token purchase: adding 10 tokens to seeker's wallet...`);
    await supabaseAdmin.from('profiles').update({ token_balance: 12 }).eq('id', seeker.user.id);
    pass(`Tokens topped up to 12`);

    // Step 4: Seeker calls complete-payment to finalize the referral
    const completeRes = await fetch(`${API_BASE_URL}/applications/complete-payment`, {
        method: 'POST',
        headers: getAuthHeaders(seeker.session),
        body: JSON.stringify({ applicationId: app.id })
    });
    const completeData = await completeRes.json();

    if (completeRes.status === 200 && completeData.success) {
        pass(`complete-payment succeeded — referral finalized`);
    } else {
        fail(`complete-payment failed: ${JSON.stringify(completeData)}`); return;
    }

    // Verify application is now 'accepted' in DB
    const { data: finalApp } = await supabaseAdmin.from('applications').select('status').eq('id', app.id).single();
    if (finalApp.status === 'accepted') {
        pass(`Application status is now 'accepted' in DB ✓`);
    } else {
        fail(`Application status should be 'accepted', got: ${finalApp.status}`);
    }

    // Verify 9 tokens were deducted (12 - 9 = 3)
    const { data: finalProfile } = await supabaseAdmin.from('profiles').select('token_balance').eq('id', seeker.user.id).single();
    if (finalProfile.token_balance === 3) {
        pass(`Token balance after payment: 3 (was 12, deducted 9) ✓`);
    } else {
        fail(`Expected 3 tokens remaining, got: ${finalProfile.token_balance}`);
    }

    // Verify proxy email was generated
    const { data: proxyRow } = await supabaseAdmin.from('proxy_emails').select('*').eq('application_id', app.id).single();
    if (proxyRow && proxyRow.is_active) {
        pass(`Proxy email created in DB: ${proxyRow.proxy_address} ✓`);
    } else {
        fail(`proxy_emails row missing or inactive after complete-payment`);
    }
}

// ============================================================
// SUITE 2C: Single Referral — Rejection Flow
// ============================================================
async function testSingleReferralRejection() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚫 SUITE 2C: SINGLE REFERRAL — Rejection Flow');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const employee = await createEmployee('reject');
    const seeker = await createSeeker('rejected', 5);
    const job = await createJob(employee.user.id, 'single');

    // Seeker applies
    const applyRes = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: getAuthHeaders(seeker.session),
        body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: 'Please reject me!' })
    });
    if (applyRes.status === 200) {
        pass(`Application submitted`);
    } else {
        fail(`Apply failed: ${JSON.stringify(await applyRes.json())}`); return;
    }

    // Verify 1 token deducted
    const { data: p1 } = await supabaseAdmin.from('profiles').select('token_balance').eq('id', seeker.user.id).single();
    if (p1.token_balance === 4) {
        pass(`Token correctly deducted on apply: 4 remaining`);
    } else {
        fail(`Token balance wrong: ${p1.token_balance}`);
    }

    // Employee rejects
    const { data: apps } = await supabaseAdmin.from('applications').select('*').eq('job_id', job.id);
    const app = apps[0];

    const { data: empLogin } = await supabaseAuth.auth.signInWithPassword({ email: employee.user.email, password: 'password123' });
    const reviewRes = await fetch(`${API_BASE_URL}/applications/review`, {
        method: 'POST',
        headers: getAuthHeaders(empLogin.session),
        body: JSON.stringify({ applicationId: app.id, status: 'rejected' })
    });
    const reviewData = await reviewRes.json();

    if (reviewRes.status === 200 && reviewData.status === 'rejected') {
        pass(`Application correctly rejected`);
    } else {
        fail(`Rejection failed: ${JSON.stringify(reviewData)}`); return;
    }

    // Verify DB status
    const { data: finalApp } = await supabaseAdmin.from('applications').select('status').eq('id', app.id).single();
    if (finalApp.status === 'rejected') {
        pass(`DB status = 'rejected' ✓`);
    } else {
        fail(`DB status should be 'rejected', got: ${finalApp.status}`);
    }

    // Verify NO proxy email was created
    const { data: proxyRow } = await supabaseAdmin.from('proxy_emails').select('*').eq('application_id', app.id);
    if (!proxyRow || proxyRow.length === 0) {
        pass(`No proxy email created for rejected application ✓`);
    } else {
        fail(`proxy_emails row should NOT exist for rejected application`);
    }

    // Verify token was NOT refunded (token loss on apply is sunk cost)
    const { data: p2 } = await supabaseAdmin.from('profiles').select('token_balance').eq('id', seeker.user.id).single();
    if (p2.token_balance === 4) {
        pass(`Token NOT refunded after rejection (correct policy — 4 tokens remain) ✓`);
    } else {
        fail(`Token balance unexpected after rejection: ${p2.token_balance}`);
    }
}

// ============================================================
// SUITE 2D: Edge Case — Duplicate Application Blocked
// ============================================================
async function testDuplicateApplicationBlocked() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 SUITE 2D: EDGE CASE — Duplicate Application Blocked');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const employee = await createEmployee('duptest');
    const seeker = await createSeeker('dup', 10);
    const job = await createJob(employee.user.id, 'single');

    // First application — should succeed
    const res1 = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: getAuthHeaders(seeker.session),
        body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: 'First attempt' })
    });
    if (res1.status === 200) {
        pass(`First application accepted`);
    } else {
        fail(`First apply failed: ${JSON.stringify(await res1.json())}`); return;
    }

    // Second application to same job — must be blocked
    const res2 = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: getAuthHeaders(seeker.session),
        body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: 'Second attempt' })
    });
    const d2 = await res2.json();
    if (res2.status === 400 && d2.error.includes('already applied')) {
        pass(`Duplicate blocked correctly: "${d2.error}"`);
    } else {
        fail(`Duplicate should have been blocked, got HTTP ${res2.status}: ${JSON.stringify(d2)}`);
    }

    // Token should only have been deducted once (10 → 9)
    const { data: p } = await supabaseAdmin.from('profiles').select('token_balance').eq('id', seeker.user.id).single();
    if (p.token_balance === 9) {
        pass(`Token deducted only once (10 → 9). Duplicate did not cost tokens ✓`);
    } else {
        fail(`Token balance should be 9, got: ${p.token_balance}`);
    }
}

// ============================================================
// SUITE 2E: Edge Case — Employee cannot apply to own job
// ============================================================
async function testEmployeeCannotApply() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 SUITE 2E: EDGE CASE — Employee Cannot Apply to Own Job');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const employee = await createEmployee('self_apply');
    const job = await createJob(employee.user.id, 'single');

    const res = await fetch(`${API_BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: getAuthHeaders(employee.session),
        body: JSON.stringify({ job_id: job.id, employee_id: employee.user.id, cover_letter: 'I am applying to my own job!' })
    });
    const d = await res.json();

    if (res.status === 403 && d.error.includes('job seekers')) {
        pass(`Employee correctly blocked from applying: "${d.error}"`);
    } else {
        fail(`Employee should be blocked (HTTP 403). Got HTTP ${res.status}: ${JSON.stringify(d)}`);
    }
}

// ============================================================
// CLEANUP
// ============================================================
async function cleanup() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧹 CLEANUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const unique = [...new Set(allCreatedUserIds)];
    console.log(`  Removing ${unique.length} test users...`);
    for (const id of unique) {
        await supabaseAdmin.auth.admin.deleteUser(id);
    }
    pass(`Cleanup complete. DB is clean.`);
}

// ============================================================
// MAIN
// ============================================================
async function main() {
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║   REFERKARO FULL END-TO-END SMOKE TEST SUITE  ║');
    console.log('╚═══════════════════════════════════════════════╝');

    const start = Date.now();

    try {
        await testPooling();
        await testSingleReferralWithTokens();
        await testSingleReferralWithoutTokens();
        await testSingleReferralRejection();
        await testDuplicateApplicationBlocked();
        await testEmployeeCannotApply();
    } catch (e) {
        console.error('\n❌ SCRIPT CRASHED:', e.message);
        console.error(e.stack);
    } finally {
        await cleanup();
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`\n⏱  Total run time: ${elapsed}s`);
        console.log('════════════════════════════════════════════════\n');
    }
}

main();
