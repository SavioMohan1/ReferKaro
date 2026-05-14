const { createClient } = require('@supabase/supabase-js');
const c = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Test signInWithOAuth to see what URL it generates
c.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: 'http://localhost:3099/auth/callback',
        skipBrowserRedirect: true,
    }
}).then(r => {
    console.log('OAuth URL:', r.data?.url || 'NO URL');
    if (r.error) console.log('Error:', r.error.message);
}).catch(e => {
    console.log('Error:', e.message);
});
