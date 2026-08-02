'use client'

import { useState } from 'react'
import { AlertTriangle, Check, Copy, ExternalLink, Loader2, Mail, UserRound, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ApplicationCard({ application, ranking = null }: { application: any; ranking?: any }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(application.status)
    const [proxyEmail, setProxyEmail] = useState<string | null>(application.proxy_emails?.[0]?.proxy_address || null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const router = useRouter()

    const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
        setLoading(true); setError('')
        try {
            const response = await fetch('/api/applications/review', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, status: newStatus }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to update application')
            setStatus(data.status)
            if (data.proxyEmail) setProxyEmail(data.proxyEmail)
            router.refresh()
        } catch (reviewError) { setError(reviewError instanceof Error ? reviewError.message : 'Failed to update application status.') }
        finally { setLoading(false) }
    }

    const openResume = async () => {
        const supabase = createClient()
        const { data, error: resumeError } = await supabase.storage.from('resumes').createSignedUrl(application.resume_url, 60)
        if (data) window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
        if (resumeError) setError('The resume could not be opened.')
    }

    const copyToClipboard = async () => {
        if (!proxyEmail) return
        await navigator.clipboard.writeText(proxyEmail)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1800)
    }

    return (
        <article className="rk-application-card">
            <header className="rk-candidate-head">
                <span className="rk-candidate-avatar"><UserRound size={20} /></span>
                <div><h3>{application.profiles?.full_name || 'Candidate'}</h3><p>{application.profiles?.email}</p><small>Applied {new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>
                <span className="rk-status" data-status={status}>{status.replace('_', ' ')}</span>
            </header>

            {error && <div className="rk-form-error" role="alert">{error}</div>}
            <section className="rk-candidate-letter"><span className="rk-kicker">Candidate note</span><p>{application.cover_letter}</p></section>
            <div className="rk-resource-row">
                {application.resume_url && <button type="button" onClick={openResume}><ExternalLink size={13} /> Resume</button>}
                {application.linkedin_url && <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn <ExternalLink size={12} /></a>}
                {application.portfolio_url && <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer">Portfolio <ExternalLink size={12} /></a>}
            </div>

            {ranking && <section className="rk-ai-review"><div><span>AI pool suggestion · rank {ranking.rank}</span><strong>{ranking.score}/100</strong></div><p>{ranking.summary}</p><div className="rk-ai-columns"><div><b>Role-aligned signals</b>{ranking.strengths.map((item: string, index: number) => <span key={index}>+ {item}</span>)}</div><div><b>Evidence gaps</b>{ranking.gaps.map((item: string, index: number) => <span key={index}>- {item}</span>)}</div></div><small>This suggestion does not accept or reject candidates.</small></section>}

            {status === 'pending' && <div className="rk-review-actions"><button type="button" onClick={() => handleStatusUpdate('accepted')} disabled={loading} className="rk-button rk-button-primary">{loading ? <Loader2 size={15} className="rk-spinner" /> : <Check size={15} />} {application.referral_type === 'pooling' ? 'Select pool candidate' : 'Select for referral · 9 tokens'}</button><button type="button" onClick={() => handleStatusUpdate('rejected')} disabled={loading} className="rk-button rk-button-secondary"><X size={15} /> Decline</button></div>}

            {status === 'selected' && <StatusNote title="Waiting for candidate" body={`The candidate has 24 hours to provide the remaining 9 tokens.${application.selected_at ? ` Offer expires ${new Date(new Date(application.selected_at).getTime() + 86400000).toLocaleString()}.` : ''}`} />}
            {status === 'payment_pending' && <StatusNote title="Waiting for final payment" body="The proxy address becomes available after the candidate completes and verifies payment." />}
            {status === 'expired' && <StatusNote title="Selection expired" body="The 24-hour completion window ended before the candidate completed the required step." />}
            {status === 'accepted' && <section className="rk-proxy-panel"><div><Check size={17} /><strong>Candidate accepted</strong></div>{proxyEmail ? <><p>Use this proxy address in the company referral portal. Do not substitute the candidate&apos;s personal address.</p><div className="rk-proxy-address"><Mail size={15} /><code>{proxyEmail}</code><button type="button" onClick={copyToClipboard}>{copied ? 'Copied' : <Copy size={14} />}</button></div></> : <p>Refresh the page to retrieve the generated proxy address.</p>}</section>}
        </article>
    )
}

function StatusNote({ title, body }: { title: string; body: string }) {
    return <div className="rk-status-note"><AlertTriangle size={17} /><div><strong>{title}</strong><p>{body}</p></div></div>
}
