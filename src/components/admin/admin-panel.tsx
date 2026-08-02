'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ExternalLink, RefreshCw, ShieldCheck, XCircle } from 'lucide-react'

interface Job { id: string; role_title: string; company: string; referral_type: string; job_url: string | null; created_at: string; approval_status: string; admin_feedback: string | null; employee: { full_name: string; email: string } | null }
interface VerificationReview { id: string; full_name: string | null; email: string; company: string | null; verification_score: number | null; verification_feedback: string | null; documentUrl: string | null }

export default function AdminPanel() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [reviews, setReviews] = useState<VerificationReview[]>([])
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<Record<string, string>>({})
    const [acting, setActing] = useState<string | null>(null)
    const [error, setError] = useState('')

    const loadQueue = async () => {
        setLoading(true); setError('')
        const response = await fetch('/api/admin/jobs/review', { cache: 'no-store' })
        const data = await response.json()
        if (!response.ok) setError(data.error || 'The admin queue could not be loaded.')
        else { setJobs(data.jobs || []); setReviews(data.verificationReviews || []) }
        setLoading(false)
    }
    useEffect(() => { void loadQueue() }, [])

    const handleAction = async (resourceType: 'job' | 'employment', resourceId: string, action: 'approved' | 'rejected') => {
        setActing(resourceId + action); setError('')
        const response = await fetch('/api/admin/jobs/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resourceType, resourceId, action, feedback: feedback[resourceId] || '' }),
        })
        const data = await response.json()
        if (!response.ok) setError(data.error || 'The review action failed.')
        else await loadQueue()
        setActing(null)
    }

    return <main className="rk-product-page"><div className="rk-shell rk-admin-page">
        <header><div><span className="rk-kicker">Remote administration</span><h1>Trust review.</h1><p>Admin access comes from the Supabase profile role. Every decision is recorded in the audit log.</p></div><button type="button" onClick={loadQueue} className="rk-button rk-button-secondary"><RefreshCw size={14} /> Refresh</button></header>
        {error && <div className="rk-form-error" role="alert">{error}</div>}
        {loading ? <div className="rk-empty-state"><ShieldCheck size={28} /><p>Loading review queues...</p></div> : <>
            <section className="rk-admin-section"><h2>Employment verification <small>{reviews.length} pending</small></h2>
                {reviews.length === 0 ? <div className="rk-empty-state"><ShieldCheck size={24} /><p>No employment reviews are pending.</p></div> : <div className="rk-admin-list">{reviews.map((review) => <article key={review.id} className="rk-admin-card"><header><div><span>{review.company || 'Company not supplied'}</span><h2>{review.full_name || 'Employee'}</h2></div><span className="rk-status" data-status="pending">pending</span></header><div className="rk-admin-meta"><span>{review.email}</span><span>AI pre-check: {review.verification_score ?? 'Not scored'}</span></div>{review.verification_feedback && <div className="rk-admin-note"><strong>Pre-check context</strong>{review.verification_feedback}</div>}{review.documentUrl ? <a className="rk-official-link" href={review.documentUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} /><span><strong>Open private evidence</strong><small>Signed link expires in five minutes</small></span></a> : <div className="rk-form-error">Verification evidence is unavailable.</div>}<ReviewActions id={review.id} feedback={feedback} setFeedback={setFeedback} acting={acting} onAction={(action) => handleAction('employment', review.id, action)} canApprove={Boolean(review.documentUrl)} /></article>)}</div>}
            </section>
            <section className="rk-admin-section"><h2>Job listings <small>{jobs.filter((job) => job.approval_status === 'pending').length} pending</small></h2>
                <div className="rk-admin-list">{jobs.map((job) => <article key={job.id} className="rk-admin-card"><header><div><span>{job.company}</span><h2>{job.role_title}</h2></div><span className="rk-status" data-status={job.approval_status}>{job.approval_status}</span></header><div className="rk-admin-meta"><span>{job.employee?.full_name || 'Unknown employee'} · {job.employee?.email}</span><span>{job.referral_type} referral · {new Date(job.created_at).toLocaleDateString('en-IN')}</span></div>{job.job_url ? <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="rk-official-link"><ExternalLink size={15} /><span><strong>Verify official posting</strong><small>{job.job_url}</small></span></a> : <div className="rk-form-error">No official job URL. This listing cannot be approved.</div>}{job.admin_feedback && <div className="rk-admin-note"><strong>Admin note</strong>{job.admin_feedback}</div>}{job.approval_status === 'pending' && <ReviewActions id={job.id} feedback={feedback} setFeedback={setFeedback} acting={acting} onAction={(action) => handleAction('job', job.id, action)} canApprove={Boolean(job.job_url)} />}</article>)}</div>
            </section>
        </>}
    </div></main>
}

function ReviewActions({ id, feedback, setFeedback, acting, onAction, canApprove }: { id: string; feedback: Record<string, string>; setFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>; acting: string | null; onAction: (action: 'approved' | 'rejected') => void; canApprove: boolean }) {
    return <div className="rk-admin-actions"><input placeholder="Review note or rejection reason" value={feedback[id] || ''} onChange={(event) => setFeedback((current) => ({ ...current, [id]: event.target.value }))} /><button type="button" onClick={() => onAction('approved')} disabled={!canApprove || acting === id + 'approved'} className="rk-button rk-button-primary"><CheckCircle size={14} /> {acting === id + 'approved' ? 'Approving' : 'Approve'}</button><button type="button" onClick={() => onAction('rejected')} disabled={acting === id + 'rejected'} className="rk-button rk-button-secondary"><XCircle size={14} /> {acting === id + 'rejected' ? 'Rejecting' : 'Reject'}</button></div>
}
