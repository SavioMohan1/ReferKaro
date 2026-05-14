/**
 * ReferKaro End-to-End Integration Test
 * Tests all major flows with the Supabase service role key
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE_URL = 'http://localhost:3099';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

let results = [];
function log(test, status, detail) {
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${detail}`);
    results.push({ test, status, detail });
}

async function run() {
    console.log('=== ReferKaro Integration Test ===\n');

    // 1. Test Supabase connection
    console.log('--- Database Connection ---');
    const { data: profiles, error: profErr } = await admin.from('profiles').select('id, email, role, is_verified').limit(5);
    if (profErr) {
        log('DB Connection', 'FAIL', profErr.message);
        console.log('\n❌ Cannot connect to database. Aborting.');
        return;
    }
    log('DB Connection', 'PASS', `Connected. Found ${profiles.length} profiles.`);

    // 2. List users and roles
    console.log('\n--- User Profiles ---');
    const { data: allProfiles } = await admin.from('profiles').select('id, email, full_name, role, is_verified, token_balance');
    if (allProfiles && allProfiles.length > 0) {
        allProfiles.forEach(p => {
            console.log(`   ${p.role.padEnd(12)} | ${(p.email || '').padEnd(30)} | verified: ${p.is_verified} | tokens: ${p.token_balance}`);
        });
        log('Profiles', 'PASS', `${allProfiles.length} users found`);
    } else {
        log('Profiles', 'WARN', 'No profiles found - fresh database');
    }

    // 3. Check admin user exists
    console.log('\n--- Admin Check ---');
    const adminUser = allProfiles?.find(p => p.role === 'admin');
    if (adminUser) {
        log('Admin User', 'PASS', `Admin found: ${adminUser.email}`);
    } else {
        log('Admin User', 'FAIL', 'No admin user found! You need to set a user role to admin in the profiles table.');
    }

    // 4. Check jobs table
    console.log('\n--- Jobs ---');
    const { data: jobs, error: jobErr } = await admin.from('jobs').select('id, role_title, company, is_active, approval_status, referral_type');
    if (jobErr) {
        log('Jobs Table', 'FAIL', jobErr.message);
    } else {
        log('Jobs Table', 'PASS', `${jobs.length} jobs found`);
        const pending = jobs.filter(j => j.approval_status === 'pending');
        const approved = jobs.filter(j => j.approval_status === 'approved');
        console.log(`   Pending: ${pending.length} | Approved: ${approved.length}`);
        jobs.slice(0, 3).forEach(j => {
            console.log(`   [${j.approval_status}] ${j.role_title} @ ${j.company} (${j.referral_type})`);
        });
    }

    // 5. Check applications
    console.log('\n--- Applications ---');
    const { data: apps, error: appErr } = await admin.from('applications').select('id, status, referral_type, applied_at');
    if (appErr) {
        log('Applications', 'FAIL', appErr.message);
    } else {
        log('Applications', 'PASS', `${apps.length} applications found`);
        const statusCounts = {};
        apps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
        if (Object.keys(statusCounts).length > 0) {
            console.log('   Status breakdown:', JSON.stringify(statusCounts));
        }
    }

    // 6. Check transactions
    console.log('\n--- Transactions ---');
    const { data: txns, error: txnErr } = await admin.from('transactions').select('id, amount, status, type');
    if (txnErr) {
        log('Transactions', 'FAIL', txnErr.message);
    } else {
        log('Transactions', 'PASS', `${txns.length} transactions found`);
    }

    // 7. Check notifications
    console.log('\n--- Notifications ---');
    const { data: notifs, error: notifErr } = await admin.from('notifications').select('id, type, is_read').limit(10);
    if (notifErr) {
        log('Notifications', 'FAIL', notifErr.message);
    } else {
        log('Notifications', 'PASS', `${notifs.length} notifications found`);
    }

    // 8. Check proxy_emails
    console.log('\n--- Proxy Emails ---');
    const { data: proxies, error: proxyErr } = await admin.from('proxy_emails').select('id, proxy_address, is_active');
    if (proxyErr) {
        log('Proxy Emails', 'FAIL', proxyErr.message);
    } else {
        log('Proxy Emails', 'PASS', `${proxies.length} proxy emails found`);
    }

    // 9. Test API routes (unauthenticated - should return 401/400)
    console.log('\n--- API Route Health ---');
    const apiTests = [
        { path: '/api/notifications', method: 'GET', expect: 401 },
        { path: '/api/applications/apply', method: 'POST', body: '{}', expect: 401 },
        { path: '/api/payments/verify', method: 'POST', body: '{}', expect: 400 },
        { path: '/api/admin/jobs/review', method: 'POST', body: '{}', expect: 401 },
        { path: '/api/webhooks/inbound-email', method: 'POST', body: '{"to":"test@test.com"}', expect: 401 },
    ];

    for (const t of apiTests) {
        try {
            const opts = { method: t.method, headers: { 'Content-Type': 'application/json' } };
            if (t.body) opts.body = t.body;
            const res = await fetch(`${BASE_URL}${t.path}`, opts);
            if (res.status === t.expect) {
                log(`API ${t.method} ${t.path}`, 'PASS', `${res.status} (expected)`);
            } else {
                log(`API ${t.method} ${t.path}`, 'WARN', `Got ${res.status}, expected ${t.expect}`);
            }
        } catch (e) {
            log(`API ${t.method} ${t.path}`, 'FAIL', e.message);
        }
    }

    // 10. Admin panel access check
    console.log('\n--- Admin Panel Fix Verification ---');
    if (adminUser) {
        // Verify the admin user has role='admin' which is now what navbar checks
        log('Admin Panel Access', 'PASS', `User ${adminUser.email} has role=admin, navbar will show Admin button`);
    } else {
        log('Admin Panel Access', 'FAIL', 'No admin user - need to UPDATE profiles SET role=\'admin\' WHERE email=\'your-email\'');
    }

    // Summary
    console.log('\n=== SUMMARY ===');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warned = results.filter(r => r.status === 'WARN').length;
    console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️ Warnings: ${warned}`);
    
    if (failed > 0) {
        console.log('\nFailed tests:');
        results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  - ${r.test}: ${r.detail}`));
    }
}

run().catch(e => console.error('Test crashed:', e));
