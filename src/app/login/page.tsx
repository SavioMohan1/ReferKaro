'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
    const handleLogin = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        })
        if (error) alert('Error logging in')
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#050A14', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 24,
            position: 'relative', overflow: 'hidden',
            backgroundImage: `url('/images/login_bg_abstract.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            {/* Dark overlay so the card pops */}
            <div style={{ position:'absolute', inset:0, background:'rgba(5,10,20,0.45)', zIndex:0 }} />

            {/* Glow orbs */}
            <div className="glow-orb glow-cyan"  style={{ width:400, height:400, top:-80, right:-80 }} />
            <div className="glow-orb glow-violet" style={{ width:350, height:350, bottom:-80, left:-80 }} />

            <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420 }}>
                {/* Card */}
                <div className="dk-card" style={{ padding:'48px 40px', textAlign:'center' }}>
                    {/* Logo */}
                    <div style={{ fontFamily:'var(--font-head)', fontSize:'1.6rem', fontWeight:800, marginBottom:8 }}>
                        <span style={{ color:'#00F0FF' }}>Refer</span>
                        <span style={{ color:'#E8EDF5' }}>Karo</span>
                    </div>
                    <div className="dk-chip" style={{ marginBottom:28 }}>Secure Sign In</div>

                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.5rem', fontWeight:700, color:'#E8EDF5', marginBottom:6 }}>
                        Welcome Back
                    </h1>
                    <p style={{ fontSize:'0.9rem', color:'#6B7A99', marginBottom:32, lineHeight:1.6 }}>
                        Sign in with your Google account to access ReferKaro.
                    </p>

                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            padding: '13px 24px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#E8EDF5',
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'
                            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,240,255,0.3)'
                            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 14px rgba(0,240,255,0.1)'
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'
                            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'
                            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <p style={{ fontSize:'0.78rem', color:'#6B7A99', marginTop:24, lineHeight:1.6 }}>
                        By signing in you agree to our{' '}
                        <a href="#" style={{ color:'#00F0FF' }}>Terms of Service</a> and{' '}
                        <a href="#" style={{ color:'#00F0FF' }}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
