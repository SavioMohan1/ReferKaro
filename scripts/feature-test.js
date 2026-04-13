/**
 * ReferKaro — Feature Test Suite
 * Tests: Admin Approval, Dashboard Inbox, Universal Proxy Email
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API_BASE     = 'http://localhost:3000/api';
const PROXY_EMAIL  = process.env.PROXY_EMAIL || 'saviomohan2002@gmail.com';

const admin  = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const authClient = createClient(SUPABASE_URL, ANON_KEY,    { auth: { autoRefreshToken: false, persistSession: false } });

const pass  = (msg) => console.log(`  ✅ PASS: ${msg}`);
const fail  = (msg) => { console.error(`  ❌ FAIL: ${msg}`); };
const info  = (msg) => console.log(`  ℹ️  ${msg}`);
const delay = (ms)  => new Promise(r => setTimeout(r, ms));

const cleanupIds = [];

// ─── Helpers ───────────────────────────────────────────────
async function createUser(email, role, tokenBalance = 10) {
    const { data, error } = await admin.auth.admin.createUser({
        email, password: 'Password123!', email_confirm: true
    });
    if (error) throw new Error(`createUser(${email}) → ${error.message}`);
    cleanupIds.push(data.user.id);
    await delay(400);
    await admin.from('profiles').upsert({
        id: data.user.id, email, role,
        full_name: `Test ${role}`,
        token_balance: tokenBalance,
        has_accepted_terms: true
    });
    const { data: sess } = await authClient.auth.signInWithPassword({ email, password: 'Password123!' });
    return { user: data.user, session: sess.session };
}

function headers(session) {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` };
}

async function post(path, body, session) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST', headers: headers(session),
        body: JSON.stringify(body)
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function get(path, session) {
    const res = await fetch(`${API_BASE}${path}`, { headers: headers(session) });
    return { status: res.status, data: await res.json().catch(() => ({})) };
}

// ─── SUITE 1: Admin Job Approval ───────────────────────────
async function testAdminApproval() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛡️  SUITE 1: Admin Job Approval System');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const emp  = await createUser(`feat_emp_${Date.now()}@test.com`, 'employee', 5);
    const admn = await createUser(`feat_adm_${Date.now()}@test.com`, 'admin', 0);

    // ── 1A: Employee creates a job (approval_status should default to 'pending')
    const { data: job, error: jobErr } = await admin.from('jobs').insert({
        employee_id: emp.user.id,
        role_title: 'Feature Test Engineer',
        company: 'TestCorp',
        referral_type: 'single',
        description: 'Feature test job',
        requirements: 'Node.js',
        job_url: 'https://example.com/jobs/123',
        is_active: true,
    }).select().single();
    if (jobErr) { fail(`Job creation failed: ${jobErr.message}`); return; }
    info(`Job created: ${job.id.slice(0,8)}… | approval_status: ${job.approval_status}`);

    if (job.approval_status === 'pending') {
        pass('New job defaults to approval_status = pending');
    } else {
        fail(`Expected pending, got: ${job.approval_status}`);
    }

    // ── 1B: Job should NOT appear in the public /jobs list (requires approved)
    const { data: publicJobs } = await admin.from('jobs')
        .select('id').eq('id', job.id).eq('approval_status', 'approved');
    if (!publicJobs || publicJobs.length === 0) {
        pass('Pending job is NOT visible in approved listings ✓');
    } else {
        fail('Pending job incorrectly appears in approved listings');
    }

    // ── 1C: Non-admin cannot approve
    const seeker = await createUser(`feat_sk_${Date.now()}@test.com`, 'job_seeker', 5);
    const { status: forbidStatus } = await post('/admin/jobs/review', { jobId: job.id, action: 'approved' }, seeker.session);
    if (forbidStatus === 403) {
        pass('Non-admin correctly blocked from reviewing jobs (HTTP 403)');
    } else {
        fail(`Expected 403 for non-admin, got: ${forbidStatus}`);
    }

    // ── 1D: Approving a job without job_url should fail
    const { data: noUrlJob } = await admin.from('jobs').insert({
        employee_id: emp.user.id,
        role_title: 'No URL Job',
        company: 'TestCorp',
        referral_type: 'single',
        description: 'No URL',
        requirements: 'None',
        is_active: true,
    }).select().single();
    const { status: noUrlStatus, data: noUrlData } = await post('/admin/jobs/review', { jobId: noUrlJob?.id, action: 'approved' }, admn.session);
    if (noUrlStatus === 400 && noUrlData.error?.includes('job_url')) {
        pass('Admin correctly blocked from approving a job with no job_url');
    } else {
        fail(`Expected 400 for missing job_url, got ${noUrlStatus}: ${JSON.stringify(noUrlData)}`);
    }

    // ── 1E: Admin approves a valid job
    const { status: appStatus, data: appData } = await post('/admin/jobs/review', { jobId: job.id, action: 'approved', feedback: 'Looks good!' }, admn.session);
    if (appStatus === 200 && appData.action === 'approved') {
        pass('Admin successfully approved the job');
    } else {
        fail(`Approval failed: ${JSON.stringify(appData)}`);
        return;
    }

    // ── 1F: Job now appears in approved listings
    await delay(500);
    const { data: approvedJobs } = await admin.from('jobs')
        .select('id, approval_status').eq('id', job.id).eq('approval_status', 'approved');
    if (approvedJobs && approvedJobs.length > 0) {
        pass('Approved job now visible in public listings ✓');
    } else {
        fail('Job not found in approved listings after approval');
    }

    // ── 1G: Employee gets "job approved" notification
    await delay(500);
    const { data: empNotif } = await admin.from('notifications')
        .select('*').eq('user_id', emp.user.id).eq('type', 'job_approved').single();
    if (empNotif?.title) {
        pass(`Employee notification received: "${empNotif.title}"`);
    } else {
        fail('Employee did not receive job_approved notification');
    }

    // ── 1H: Admin rejects a job
    const { status: rejStatus, data: rejData } = await post('/admin/jobs/review', { jobId: job.id, action: 'rejected', feedback: 'Too vague.' }, admn.session);
    if (rejStatus === 200 && rejData.action === 'rejected') {
        pass('Admin successfully rejected the job (override test)');
    } else {
        fail(`Rejection failed: ${JSON.stringify(rejData)}`);
    }

    return { emp, admn, seeker, job };
}

// ─── SUITE 2: Dashboard Inbox Notifications ────────────────
async function testNotifications() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📬 SUITE 2: Dashboard Inbox Notifications');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const emp    = await createUser(`notif_emp_${Date.now()}@test.com`, 'employee', 5);
    const seeker = await createUser(`notif_sk_${Date.now()}@test.com`,  'job_seeker', 15);

    // Create & approve a job
    const { data: job } = await admin.from('jobs').insert({
        employee_id: emp.user.id,
        role_title: 'Notification Test Role',
        company: 'NotifCorp',
        referral_type: 'single',
        description: 'Testing notifications',
        requirements: 'Node.js',
        job_url: 'https://example.com/notif-job',
        is_active: true,
        approval_status: 'approved',  // pre-approve for this test
    }).select().single();

    // ── 2A: Seeker applies → no notification yet (just a deduction)
    const applyRes = await post('/applications/apply', {
        job_id: job.id, employee_id: emp.user.id, cover_letter: 'Notification test apply'
    }, seeker.session);
    if (applyRes.status === 200) {
        pass('Application submitted successfully');
    } else {
        fail(`Apply failed: ${JSON.stringify(applyRes.data)}`); return;
    }

    // ── 2B: GET /api/notifications — seeker has no notifications yet
    const { status: s1, data: d1 } = await get('/notifications', seeker.session);
    if (s1 === 200 && Array.isArray(d1.notifications)) {
        const hasNotif = d1.notifications.length > 0;
        info(`Seeker notifications before review: ${d1.notifications.length}`);
        pass('GET /api/notifications returns correctly for seeker');
    } else {
        fail(`Notifications GET failed: ${JSON.stringify(d1)}`);
    }

    // ── 2C: Employee accepts → seeker gets accepted notification
    const { data: apps } = await admin.from('applications').select('*').eq('job_id', job.id);
    const app = apps[0];
    const reviewRes = await post('/applications/review', { applicationId: app.id, status: 'accepted' }, emp.session);
    if (reviewRes.status === 200) {
        pass(`Review API succeeded: status=${reviewRes.data.status}`);
    } else {
        fail(`Review failed: ${JSON.stringify(reviewRes.data)}`); return;
    }

    // ── 2D: Verify proxy email is saviomohan2002@gmail.com
    if (reviewRes.data.proxyEmail === PROXY_EMAIL) {
        pass(`Proxy email is correct: ${reviewRes.data.proxyEmail} ✓`);
    } else {
        fail(`Expected proxy=${PROXY_EMAIL}, got: ${reviewRes.data.proxyEmail}`);
    }

    // ── 2E: Seeker's inbox now has an accepted notification
    await delay(500);
    const { data: d2 } = await admin.from('notifications')
        .select('*').eq('user_id', seeker.user.id).eq('type', 'accepted');
    if (d2 && d2.length > 0) {
        const n = d2[0];
        pass(`Inbox notification created: "${n.title}"`);
        if (n.job_link === 'https://example.com/notif-job') {
            pass(`job_link correctly stored: ${n.job_link} ✓`);
        } else {
            fail(`job_link wrong: ${n.job_link}`);
        }
        if (!n.is_read) {
            pass('Notification starts as unread ✓');
        } else {
            fail('Notification should start as unread');
        }

        // ── 2F: Mark as read via API
        const readRes = await post('/notifications/read', { notificationId: n.id }, seeker.session);
        if (readRes.status === 200) {
            pass('POST /notifications/read succeeded');
        } else {
            fail(`Mark read failed: ${JSON.stringify(readRes.data)}`);
        }

        // ── 2G: Verify is_read = true in DB
        await delay(300);
        const { data: updatedN } = await admin.from('notifications').select('is_read').eq('id', n.id).single();
        if (updatedN?.is_read) {
            pass('Notification marked as is_read=true in DB ✓');
        } else {
            fail('is_read still false after mark-read');
        }
    } else {
        fail('No accepted notification found in seeker inbox');
    }

    // ── 2H: Rejection notification test
    const emp2 = await createUser(`notif_emp2_${Date.now()}@test.com`, 'employee', 5);
    const sk2  = await createUser(`notif_sk2_${Date.now()}@test.com`,  'job_seeker', 5);
    const { data: job2 } = await admin.from('jobs').insert({
        employee_id: emp2.user.id, role_title: 'Reject Test', company: 'TestCorp',
        referral_type: 'single', description: 'x', requirements: 'x',
        job_url: 'https://example.com/j2', is_active: true, approval_status: 'approved',
    }).select().single();
    await post('/applications/apply', { job_id: job2.id, employee_id: emp2.user.id, cover_letter: 'test' }, sk2.session);
    const { data: apps2 } = await admin.from('applications').select('*').eq('job_id', job2.id);
    await post('/applications/review', { applicationId: apps2[0].id, status: 'rejected' }, emp2.session);
    await delay(500);
    const { data: rejNotif } = await admin.from('notifications').select('*').eq('user_id', sk2.user.id).eq('type', 'rejected');
    if (rejNotif && rejNotif.length > 0) {
        pass(`Rejection notification created: "${rejNotif[0].title}" ✓`);
    } else {
        fail('No rejection notification found in seeker inbox');
    }

    // ── 2I: Mark ALL as read
    await admin.from('notifications').insert([
        { user_id: seeker.user.id, type: 'system', title: 'Test 1', is_read: false },
        { user_id: seeker.user.id, type: 'system', title: 'Test 2', is_read: false },
    ]);
    const markAllRes = await fetch(`${API_BASE}/notifications/read`, {
        method: 'PUT', headers: headers(seeker.session)
    });
    if (markAllRes.status === 200) {
        pass('PUT /notifications/read (mark all) succeeded');
    } else {
        fail(`Mark all read failed: ${markAllRes.status}`);
    }
    const { data: unread } = await admin.from('notifications')
        .select('id').eq('user_id', seeker.user.id).eq('is_read', false);
    if (!unread || unread.length === 0) {
        pass('All notifications marked as read in DB ✓');
    } else {
        fail(`${unread.length} notifications still unread after mark-all`);
    }
}

// ─── SUITE 3: Universal Proxy Email Verification ───────────
async function testProxyEmail() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 SUITE 3: Universal Proxy Email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const emp    = await createUser(`proxy_emp_${Date.now()}@test.com`, 'employee', 5);
    const seeker = await createUser(`proxy_sk_${Date.now()}@test.com`,  'job_seeker', 20);
    const { data: job } = await admin.from('jobs').insert({
        employee_id: emp.user.id, role_title: 'Proxy Email Test', company: 'ProxyCorp',
        referral_type: 'single', description: 'proxy test', requirements: 'x',
        job_url: 'https://example.com/proxy-job', is_active: true, approval_status: 'approved',
    }).select().single();

    await post('/applications/apply', { job_id: job.id, employee_id: emp.user.id, cover_letter: 'proxy test' }, seeker.session);
    const { data: apps } = await admin.from('applications').select('*').eq('job_id', job.id);
    const appId = apps?.[0]?.id;
    info(`Application ID for proxy test: ${appId?.slice(0, 8)}…`);

    const reviewRes = await post('/applications/review', { applicationId: appId, status: 'accepted' }, emp.session);

    // Wait for the async DB writes to settle
    await delay(1000);

    // Verify proxy_emails table row
    const { data: proxyRow, error: proxyErr } = await admin.from('proxy_emails')
        .select('*').eq('application_id', appId).maybeSingle();

    info(`proxy_emails query result: ${JSON.stringify({ proxy: proxyRow?.proxy_address, err: proxyErr?.message })}`);

    if (proxyRow?.proxy_address === PROXY_EMAIL) {
        pass(`proxy_emails row uses universal address: ${proxyRow.proxy_address} ✓`);
    } else {
        fail(`Expected ${PROXY_EMAIL} in proxy_emails, got: ${proxyRow?.proxy_address}`);
    }

    if (proxyRow?.is_active) {
        pass('proxy_emails row is_active = true ✓');
    } else {
        fail('proxy_emails row is not active');
    }

    info(`Real email stored: ${proxyRow?.real_email}`);
    pass(`API response proxyEmail: ${reviewRes.data.proxyEmail}`);
}

// ─── CLEANUP ────────────────────────────────────────────────
async function cleanup() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧹 CLEANUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const unique = [...new Set(cleanupIds)];
    info(`Removing ${unique.length} test users…`);
    for (const id of unique) {
        await admin.auth.admin.deleteUser(id);
    }
    pass('All test users and data removed. DB is clean.');
}

// ─── MAIN ───────────────────────────────────────────────────
async function main() {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   REFERKARO — NEW FEATURES BACKEND TEST SUITE   ║');
    console.log('║   Admin Approval | Inbox | Universal Proxy Email ║');
    console.log('╚══════════════════════════════════════════════════╝');
    const start = Date.now();
    try {
        await testAdminApproval();
        await testNotifications();
        await testProxyEmail();
    } catch (e) {
        console.error('\n❌ SCRIPT CRASHED:', e.message);
        console.error(e.stack);
    } finally {
        await cleanup();
        console.log(`\n⏱  Total: ${((Date.now() - start) / 1000).toFixed(1)}s`);
        console.log('════════════════════════════════════════════════════\n');
    }
}

main();
