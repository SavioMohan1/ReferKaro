'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Loader2, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function CreateJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState<{ urlStatus: string; feedback: string } | null>(null)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({ company: '', role_title: '', department: '', location: '', job_type: 'full_time', experience_level: 'mid', description: '', requirements: '', job_url: '', referral_type: 'single', pool_size: 10 })

    useEffect(() => {
        const checkVerification = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }
            const { data: profile } = await supabase.from('profiles').select('is_verified, company, designation').eq('id', user.id).single()
            if (!profile?.is_verified) { router.push('/verify'); return }
            if (!profile.company || !profile.designation) { router.push('/verify'); return }
            setFormData((current) => ({ ...current, company: profile.company, role_title: profile.designation }))
            setLoading(false)
        }
        checkVerification()
    }, [router])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); setSubmitting(true); setError('')
        try {
            const response = await fetch('/api/jobs/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const result = await response.json()
            if (!response.ok) { setError(result.error || 'The listing could not be submitted.'); return }
            setSubmitted({ urlStatus: result.urlReview?.status || 'pending', feedback: result.urlReview?.feedback || 'Admin review is pending.' })
        } catch {
            setError('The listing could not be submitted. Check your connection and try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <main className="rk-product-page"><div className="rk-shell rk-role-loading"><span /><span /><span /></div></main>

    return <main className="rk-product-page"><div className="rk-shell rk-create-layout">
        <Link href="/dashboard" className="rk-back-link"><ArrowLeft size={14} /> Workspace</Link>
        <header><span className="rk-kicker">New listing</span><h1>Describe the role<br />without the sales pitch.</h1><p>Accurate listings help candidates decide whether to spend a token. Submitted listings are not public until approved.</p></header>
        {submitted ? <section className="rk-product-panel rk-submission-success"><ShieldCheck size={30} /><span className="rk-kicker">Submitted for review</span><h2>Your listing is in verifying mode.</h2><p>{submitted.feedback}</p><p>An admin will make the final publishing decision. The listing is not visible to job seekers yet.</p><button type="button" onClick={() => router.push('/dashboard')} className="rk-button rk-button-primary">Continue</button></section> : <form onSubmit={handleSubmit} className="rk-create-form">
            {error && <div className="rk-form-error" role="alert">{error}</div>}
            <FormSection number="01" title="The opening" description="Start with details a candidate can verify.">
                <div className="rk-form-pair"><Field label="Verified company" required><input required readOnly value={formData.company} aria-readonly="true" /></Field><Field label="Verified role" required><input required readOnly value={formData.role_title} aria-readonly="true" /></Field></div>
                <div className="rk-form-pair"><Field label="Department"><input value={formData.department} onChange={(event) => setFormData({ ...formData, department: event.target.value })} placeholder="Engineering" /></Field><Field label="Location" required><input required value={formData.location} onChange={(event) => setFormData({ ...formData, location: event.target.value })} placeholder="Bengaluru or Remote" /></Field></div>
                <div className="rk-form-pair"><Field label="Job type" required><select value={formData.job_type} onChange={(event) => setFormData({ ...formData, job_type: event.target.value })}><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></Field><Field label="Experience level" required><select value={formData.experience_level} onChange={(event) => setFormData({ ...formData, experience_level: event.target.value })}><option value="entry">Entry level</option><option value="mid">Mid level</option><option value="senior">Senior</option><option value="lead">Lead / principal</option></select></Field></div>
            </FormSection>
            <FormSection number="02" title="Referral route" description="Choose how candidate review should be organised.">
                <div className="rk-choice-grid"><button type="button" data-selected={formData.referral_type === 'single'} onClick={() => setFormData({ ...formData, referral_type: 'single' })}><Check size={18} /><strong>Single referral</strong><span>Review requests as they arrive.</span><small>Lower chances of getting the right candidate referred.</small></button><button type="button" data-selected={formData.referral_type === 'pooling'} onClick={() => setFormData({ ...formData, referral_type: 'pooling' })}><Check size={18} /><strong>Candidate pool</strong><span>Collect a set before choosing.</span><small>Higher chances of getting the right candidate referred.</small></button></div>
                {formData.referral_type === 'pooling' && <Field label="Pool size" required><input type="number" min="2" max="10" value={formData.pool_size} onChange={(event) => setFormData({ ...formData, pool_size: Number.parseInt(event.target.value) })} /></Field>}
            </FormSection>
            <FormSection number="03" title="The brief" description="Give candidates enough context to make a reasoned decision.">
                <Field label="Role description" required><textarea rows={7} required value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Responsibilities, team context, and what success looks like..." /></Field>
                <Field label="Requirements"><textarea rows={5} value={formData.requirements} onChange={(event) => setFormData({ ...formData, requirements: event.target.value })} placeholder="Required skills and experience..." /></Field>
                <Field label="Official job posting URL"><input type="url" value={formData.job_url} onChange={(event) => setFormData({ ...formData, job_url: event.target.value })} placeholder="https://company.com/careers/..." /></Field>
            </FormSection>
            <div className="rk-create-actions"><p>Submitting cross-checks the official URL, then sends the listing to the admin queue.</p><button type="submit" disabled={submitting} className="rk-button rk-button-primary">{submitting ? <><Loader2 size={16} className="rk-spinner" /> Verifying job URL</> : 'Submit for review'}</button><button type="button" disabled={submitting} onClick={() => router.back()} className="rk-button rk-button-secondary">Cancel</button></div>
        </form>}
    </div></main>
}

function FormSection({ number, title, description, children }: { number: string; title: string; description: string; children: React.ReactNode }) {
    return <section className="rk-form-section"><header><span>{number}</span><div><h2>{title}</h2><p>{description}</p></div></header><div>{children}</div></section>
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return <label className="rk-field"><span>{label}{required && <b>Required</b>}</span>{children}</label>
}
