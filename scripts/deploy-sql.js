const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const sql = fs.readFileSync('sql/safe_pool_apply.sql', 'utf8');

async function deploy() {
    console.log('Deploying safe_pool_apply function to Supabase...');
    
    // Supabase JS doesn't have a direct SQL executor — use the REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    
    // The right way is to use the pg client or Supabase's admin SQL endpoint
    // Let's use the supabase auth admin API to run raw SQL
    const pgUrl = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
    
    // Call via the pg endpoint
    const sqlResponse = await fetch(`${SUPABASE_URL}/pg`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
    });
    
    console.log('Response status:', sqlResponse.status);
    const body = await sqlResponse.text();
    console.log('Response body:', body);
}

deploy().catch(console.error);
