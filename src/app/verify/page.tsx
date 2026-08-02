'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, FileText, Loader2, ShieldCheck, Upload, XCircle } from 'lucide-react'

export default function VerifyPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [verifying, setVerifying] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({ fullName: '', company: '', role: '' })

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('full_name, company').eq('id', user.id).single()
                if (profile) setFormData((current) => ({ ...current, fullName: profile.full_name || '', company: profile.company || '' }))
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    const handleVerify = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!file) return
        setVerifying(true); setResult(null); setError('')
        const payload = new FormData()
        payload.append('file', file); payload.append('fullName', formData.fullName); payload.append('company', formData.company); payload.append('role', formData.role)
        try {
            const response = await fetch('/api/verify-employment', { method: 'POST', body: payload })
            const data = await response.json()
            setResult(data)
            if (data.success && data.status === 'verified') window.setTimeout(() => router.push('/dashboard'), 3000)
        } catch (verificationError) { console.error('Verification failed', verificationError); setError('Verification could not be completed. Please try again.') }
        finally { setVerifying(false) }
    }

    if (loading) return <main className="rk-product-page"><div className="rk-shell rk-role-loading"><span /><span /><span /></div></main>

    return <main className="rk-product-page"><div className="rk-shell rk-verify-layout">
        <section className="rk-verify-story"><span className="rk-kicker">Employee verification</span><h1>Trust starts<br />with evidence.</h1><p>Employee accounts must verify their current employment before creating referral listings.</p><div><ShieldCheck size={22} /><span><strong>What to provide</strong>A current employee ID or offer letter, plus matching identity and role details.</span></div><div><FileText size={22} /><span><strong>What happens next</strong>The existing verification service returns a verified, pending, or unsuccessful result.</span></div></section>
        <form onSubmit={handleVerify} className="rk-verify-form">
            <div><span className="rk-kicker">Verification form</span><h2>Confirm your employment.</h2></div>
            {error && <div className="rk-form-error" role="alert">{error}</div>}
            <label className="rk-field"><span>Full name <b>Required</b></span><input required value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} placeholder="As shown on the document" /></label>
            <label className="rk-field"><span>Current company <b>Required</b></span><input required value={formData.company} onChange={(event) => setFormData({ ...formData, company: event.target.value })} placeholder="Company name" /></label>
            <label className="rk-field"><span>Role or designation <b>Required</b></span><input required value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} placeholder="Your current role" /></label>
            <label className="rk-upload-field" htmlFor="employment-file"><input id="employment-file" type="file" accept="image/*,application/pdf" required onChange={(event) => setFile(event.target.files?.[0] || null)} />{file ? <><FileText size={25} /><strong>{file.name}</strong><span>Ready to submit</span></> : <><Upload size={25} /><strong>Add evidence of employment</strong><span>Image or PDF, up to 5MB</span></>}</label>
            {result && <section className="rk-verification-result" data-status={result.status}>{result.status === 'verified' ? <CheckCircle size={21} /> : result.status === 'pending' ? <Loader2 size={21} /> : <XCircle size={21} />}<div><strong>{result.message}</strong>{result.feedback && <p>{result.feedback}</p>}{result.score && <small>Confidence score: {result.score}%</small>}{result.status === 'verified' && <small>Returning to your workspace...</small>}</div></section>}
            <button type="submit" disabled={verifying || !file} className="rk-button rk-button-primary">{verifying ? <><Loader2 size={16} className="rk-spinner" /> Verifying</> : 'Submit verification'}</button>
            {result?.status === 'pending' && <button type="button" onClick={() => router.push('/dashboard')} className="rk-button rk-button-secondary">Return to workspace</button>}
        </form>
    </div></main>
}
