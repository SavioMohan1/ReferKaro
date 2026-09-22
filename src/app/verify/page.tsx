'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, FileText, Loader2, MailCheck, RotateCcw, ShieldCheck, Upload, UserRoundCheck, XCircle } from 'lucide-react'

type VerificationResult = { success?: boolean; status?: string; message?: string; feedback?: string; score?: number; error?: string }

export default function VerifyPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [verifying, setVerifying] = useState(false)
    const [result, setResult] = useState<VerificationResult | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [workEmail, setWorkEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [otpSent, setOtpSent] = useState(false)
    const [emailVerified, setEmailVerified] = useState(false)
    const [emailBusy, setEmailBusy] = useState(false)
    const [manualBusy, setManualBusy] = useState(false)
    const [formData, setFormData] = useState({ fullName: '', company: '', role: '' })

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.replace('/login'); return }
            const { data: profile } = await supabase.from('profiles').select('full_name, company, designation, work_email, work_email_verified_at').eq('id', user.id).single()
            if (profile) {
                setFormData({ fullName: profile.full_name || '', company: profile.company || '', role: profile.designation || '' })
                setWorkEmail(profile.work_email || '')
                setEmailVerified(Boolean(profile.work_email_verified_at))
            }
            setLoading(false)
        }
        void fetchProfile()
    }, [router])

    const sendOtp = async () => {
        setEmailBusy(true); setError('')
        try {
            const response = await fetch('/api/verify-employment/work-email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: workEmail }) })
            const data = await response.json()
            if (!response.ok) { setError(data.error || 'The code could not be sent.'); return }
            setWorkEmail(data.email); setOtpSent(true)
        } catch { setError('The code could not be sent. Check your connection and try again.') }
        finally { setEmailBusy(false) }
    }

    const confirmOtp = async () => {
        setEmailBusy(true); setError('')
        try {
            const response = await fetch('/api/verify-employment/work-email/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: workEmail, code: otp }) })
            const data = await response.json()
            if (!response.ok) { setError(data.error || 'The code could not be verified.'); return }
            setEmailVerified(true); setOtpSent(false); setOtp('')
        } catch { setError('The code could not be verified. Check your connection and try again.') }
        finally { setEmailBusy(false) }
    }

    const handleVerify = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!file || !emailVerified) return
        setVerifying(true); setResult(null); setError('')
        const payload = new FormData()
        payload.append('file', file); payload.append('fullName', formData.fullName); payload.append('company', formData.company); payload.append('role', formData.role)
        try {
            const response = await fetch('/api/verify-employment', { method: 'POST', body: payload })
            const data = await response.json()
            if (!response.ok) { setError(data.error || 'Verification could not be completed.'); return }
            setResult(data)
        } catch { setError('Verification could not be completed. Please try again.') }
        finally { setVerifying(false) }
    }

    const requestManualReview = async () => {
        setManualBusy(true); setError('')
        try {
            const response = await fetch('/api/verify-employment/manual-review', { method: 'POST' })
            const data = await response.json()
            if (!response.ok) { setError(data.error || 'Manual review could not be requested.'); return }
            setResult(data)
        } catch { setError('Manual review could not be requested. Please try again.') }
        finally { setManualBusy(false) }
    }

    const resubmit = () => { setResult(null); setFile(null); setError('') }

    if (loading) return <main className="rk-product-page"><div className="rk-shell rk-role-loading"><span /><span /><span /></div></main>

    return <main className="rk-product-page"><div className="rk-shell rk-verify-layout">
        <section className="rk-verify-story"><span className="rk-kicker">Employee verification</span><h1>Trust starts<br />with evidence.</h1><p>Verify your organisation-issued email and current employment before creating referral listings.</p><div><MailCheck size={22} /><span><strong>Work email ownership</strong>A six-digit code confirms that you can access the organisation mailbox.</span></div><div><ShieldCheck size={22} /><span><strong>Two-stage review</strong>Passing the AI check unlocks referrals immediately; an admin still makes the official employment decision.</span></div></section>
        <form onSubmit={handleVerify} className="rk-verify-form">
            <div><span className="rk-kicker">Verification form</span><h2>Confirm your employment.</h2></div>
            {error && <div className="rk-form-error" role="alert">{error}</div>}
            <section className="rk-email-verification" data-verified={emailVerified}>
                <label className="rk-field"><span>Work email <b>Required</b></span><input type="email" required readOnly={emailVerified} value={workEmail} onChange={(event) => setWorkEmail(event.target.value)} placeholder="you@company.com" /></label>
                {emailVerified ? <div className="rk-inline-success"><MailCheck size={17} /> Work email verified</div> : otpSent ? <div className="rk-otp-row"><label className="rk-field"><span>Six-digit code <b>Required</b></span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="000000" /></label><button type="button" onClick={confirmOtp} disabled={emailBusy || otp.length !== 6} className="rk-button rk-button-secondary">{emailBusy ? 'Checking' : 'Submit OTP'}</button></div> : <button type="button" onClick={sendOtp} disabled={emailBusy || !workEmail} className="rk-button rk-button-secondary">{emailBusy ? 'Sending code' : 'Verify work email'}</button>}
            </section>
            <label className="rk-field"><span>Full name <b>Required</b></span><input required value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} placeholder="As shown on the document" /></label>
            <label className="rk-field"><span>Current company <b>Required</b></span><input required value={formData.company} onChange={(event) => setFormData({ ...formData, company: event.target.value })} placeholder="Company name" /></label>
            <label className="rk-field"><span>Role or designation <b>Required</b></span><input required value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} placeholder="Your current role" /></label>
            <label className="rk-upload-field" htmlFor="employment-file"><input id="employment-file" type="file" accept="image/*,application/pdf" required onChange={(event) => setFile(event.target.files?.[0] || null)} />{file ? <><FileText size={25} /><strong>{file.name}</strong><span>Ready to submit</span></> : <><Upload size={25} /><strong>Add evidence of employment</strong><span>Image or PDF, up to 5MB</span></>}</label>
            {result && <section className="rk-verification-result" data-status={result.status}>{result.status === 'ai_verified' ? <CheckCircle size={21} /> : result.status === 'manual_review' ? <UserRoundCheck size={21} /> : <XCircle size={21} />}<div><strong>{result.message}</strong>{result.feedback && <p>{result.feedback}</p>}{typeof result.score === 'number' && <small>Confidence score: {result.score}%</small>}{result.status === 'ai_verified' && <small>You can refer now. Admin employment review is still pending.</small>}</div></section>}
            {!result && <button type="submit" disabled={verifying || !file || !emailVerified} className="rk-button rk-button-primary">{verifying ? <><Loader2 size={16} className="rk-spinner" /> Verifying evidence</> : 'Verify employment'}</button>}
            {result?.status === 'rejected' && <div className="rk-verification-actions"><button type="button" onClick={resubmit} className="rk-button rk-button-primary"><RotateCcw size={15} /> Resubmit</button><button type="button" onClick={requestManualReview} disabled={manualBusy} className="rk-button rk-button-secondary"><UserRoundCheck size={15} /> {manualBusy ? 'Requesting review' : 'Request Manual Review'}</button></div>}
            {(result?.status === 'ai_verified' || result?.status === 'manual_review') && <button type="button" onClick={() => router.push('/dashboard')} className="rk-button rk-button-primary">Continue</button>}
        </form>
    </div></main>
}
