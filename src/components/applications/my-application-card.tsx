'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, Building2, Check, ChevronDown, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

declare global { interface Window { Razorpay: any } }

export default function MyApplicationCard({ application }: { application: any }) {
    const [expanded, setExpanded] = useState(false)
    const [paying, setPaying] = useState(false)
    const [userBalance, setUserBalance] = useState<number | null>(null)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const fetchBalance = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('profiles').select('token_balance').eq('id', user.id).single()
            if (data) setUserBalance(data.token_balance)
        }
        fetchBalance()
    }, [])

    const handleTokenPayment = async () => {
        setPaying(true); setError('')
        try {
            const response = await fetch('/api/applications/complete-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId: application.id }) })
            const data = await response.json()
            if (!data.success) throw new Error(data.error || 'Failed to process tokens')
            router.refresh()
        } catch (paymentError) { setError(paymentError instanceof Error ? paymentError.message : 'Token payment failed.') }
        finally { setPaying(false) }
    }

    const handlePayment = async () => {
        setPaying(true); setError('')
        try {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: 'success_fee', amount: 900, tokens: 0, type: 'success_fee', applicationId: application.id }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            const razorpay = new window.Razorpay({
                key: data.keyId, amount: data.amount, currency: 'INR', name: 'ReferKaro',
                description: `Success Fee for ${application.jobs?.company}`, order_id: data.orderId,
                handler: async (result: any) => {
                    const verifyResponse = await fetch('/api/payments/verify', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ razorpay_order_id: result.razorpay_order_id, razorpay_payment_id: result.razorpay_payment_id, razorpay_signature: result.razorpay_signature }),
                    })
                    const verifyData = await verifyResponse.json()
                    if (!verifyData.success) { setError('Payment verification failed.'); return }
                    router.refresh()
                },
                modal: { ondismiss: () => setPaying(false) },
                theme: { color: '#1f6655' },
            })
            razorpay.on('payment.failed', () => { setError('The payment failed. No status was changed.'); setPaying(false) })
            razorpay.open()
        } catch (paymentError) { setError(paymentError instanceof Error ? paymentError.message : 'Payment could not be started.'); setPaying(false) }
    }

    const openResume = async () => {
        const supabase = createClient()
        const { data, error: resumeError } = await supabase.storage.from('resumes').createSignedUrl(application.resume_url, 60)
        if (data) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
        if (resumeError) setError('The resume could not be opened.')
    }

    return (
        <article className="rk-tracker-card">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <header><div><span><Building2 size={14} /> {application.jobs?.company}</span><h2>{application.jobs?.role_title}</h2><small>Requested {new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div><span className="rk-status" data-status={application.status}>{application.status.replace('_', ' ')}</span></header>
            {error && <div className="rk-form-error" role="alert">{error}</div>}
            <div className="rk-tracker-links"><Link href={`/jobs/${application.job_id}`}>View role <ArrowUpRight size={13} /></Link><button type="button" onClick={() => setExpanded(!expanded)}>Application details <ChevronDown size={14} data-open={expanded} /></button></div>
            {expanded && <section className="rk-tracker-details"><span className="rk-kicker">Your note</span><p>{application.cover_letter}</p><div>{application.resume_url && <button type="button" onClick={openResume}><ExternalLink size={12} /> Resume</button>}{application.linkedin_url && <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn <ExternalLink size={12} /></a>}{application.portfolio_url && <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer">Portfolio <ExternalLink size={12} /></a>}</div></section>}
            {application.status === 'selected' && <section className="rk-tracker-action"><div><strong>You were selected</strong><p>Complete the remaining 9-token step within 24 hours to continue.</p>{application.selected_at && <small>Expires {new Date(new Date(application.selected_at).getTime() + 86400000).toLocaleString()}</small>}</div>{userBalance !== null && userBalance >= 9 ? <button type="button" onClick={handleTokenPayment} disabled={paying} className="rk-button rk-button-primary">{paying ? <Loader2 size={15} className="rk-spinner" /> : 'Use 9 tokens'}</button> : <Link href="/buy-tokens" className="rk-button rk-button-primary">Get tokens</Link>}</section>}
            {application.status === 'payment_pending' && <section className="rk-tracker-action"><div><strong>Final payment required</strong><p>Pay the ₹900 success fee to unlock the proxy referral address.</p></div><button type="button" onClick={handlePayment} disabled={paying} className="rk-button rk-button-primary">{paying ? <Loader2 size={15} className="rk-spinner" /> : 'Pay ₹900 securely'}</button></section>}
            {application.status === 'accepted' && <section className="rk-tracker-success"><Check size={18} /><div><strong>Referral route unlocked</strong><p>Your proxy address is active. Check your inbox for the next update.</p></div></section>}
            {application.status === 'expired' && <section className="rk-status-note"><div><strong>Selection expired</strong><p>The 24-hour completion window ended before the required step was completed.</p></div></section>}
        </article>
    )
}
