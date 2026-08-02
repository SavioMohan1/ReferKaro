'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function GoogleMark() {
    return (
        <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async () => {
        setLoading(true)
        setError('')

        const supabase = createClient()
        const { error: signInError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        })

        if (signInError) {
            console.error('Google sign-in failed:', signInError)
            setError('Google sign-in could not be started. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="rk-auth-page">
            <section className="rk-auth-story">
                <Link href="/" className="rk-brand">
                    <span className="rk-brand-mark">RK</span>
                    <span>ReferKaro</span>
                </Link>
                <div className="rk-auth-story-copy rk-rise">
                    <div className="rk-eyebrow"><span className="rk-beta">BETA</span> One account, two paths</div>
                    <h1>A referral starts with trust.</h1>
                    <p>
                        Sign in once. Then choose whether you are requesting a referral or helping candidates reach your team.
                    </p>
                </div>
                <div className="rk-eyebrow"><ShieldCheck size={14} /> Google OAuth sign-in</div>
            </section>

            <section className="rk-auth-form-wrap">
                <div className="rk-auth-form rk-rise-delay">
                    <Link href="/" className="rk-nav-link"><ArrowLeft size={15} /> Back to home</Link>
                    <h2>Enter ReferKaro.</h2>
                    <p>Use your Google account to continue to role selection or your existing workspace.</p>

                    {error && <div className="rk-alert" role="alert">{error}</div>}

                    <button className="rk-button rk-google-button" onClick={handleLogin} disabled={loading}>
                        {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <GoogleMark />}
                        {loading ? 'Opening Google…' : 'Continue with Google'}
                    </button>

                    <p className="rk-auth-legal">
                        By continuing, you agree to the <Link href="/terms">Terms of Service</Link> and acknowledge the{' '}
                        <Link href="/privacy">Privacy Policy</Link> and <Link href="/referral-disclaimer">Referral Disclaimer</Link>.
                    </p>
                </div>
            </section>
        </div>
    )
}
