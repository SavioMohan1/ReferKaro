'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, ExternalLink, Clock, RefreshCw, ShieldCheck } from 'lucide-react'

interface Job {
    id: string
    role_title: string
    company: string
    referral_type: string
    job_url: string | null
    created_at: string
    approval_status: string
    admin_feedback: string | null
    employee: { full_name: string; email: string } | null
}

export default function AdminPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<Record<string, string>>({})
    const [acting, setActing] = useState<string | null>(null)

    const loadJobs = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('jobs')
            .select('*, employee:profiles!employee_id(full_name, email)')
            .order('created_at', { ascending: false })
        setJobs((data as any) || [])
        setLoading(false)
    }

    useEffect(() => { loadJobs() }, [])

    const handleAction = async (jobId: string, action: 'approved' | 'rejected') => {
        setActing(jobId + action)
        const res = await fetch('/api/admin/jobs/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, action, feedback: feedback[jobId] || '' })
        })
        const data = await res.json()
        if (!res.ok) alert(`Error: ${data.error}`)
        else await loadJobs()
        setActing(null)
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; label: string }> = {
            pending:  { bg: 'rgba(255,200,0,0.15)',   color: '#FFD700', label: '⏳ Pending' },
            approved: { bg: 'rgba(0,240,100,0.15)',   color: '#00F064', label: '✅ Approved' },
            rejected: { bg: 'rgba(255,60,60,0.15)',   color: '#FF4444', label: '❌ Rejected' },
        }
        const s = styles[status] || styles.pending
        return (
            <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                {s.label}
            </span>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050A14', padding: '80px 24px 60px', fontFamily: 'var(--font-body, sans-serif)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <ShieldCheck size={28} color="#00F0FF" />
                    <h1 style={{ fontSize: '1.8rem', color: '#E8EDF5', fontWeight: 700 }}>Admin Panel</h1>
                </div>
                <p style={{ color: '#6B7A99', marginBottom: 32, fontSize: '0.9rem' }}>
                    Review and approve job postings before they go live. Jobs require a valid <code>job_url</code> to be approved.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button onClick={loadJobs} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#A0AEC0', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem' }}>
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#6B7A99', paddingTop: 80 }}>Loading jobs…</div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6B7A99', paddingTop: 80 }}>No jobs found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {jobs.map(job => (
                            <div key={job.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px' }}>
                                {/* Top row */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <span style={{ color: '#E8EDF5', fontWeight: 700, fontSize: '1rem' }}>{job.role_title}</span>
                                            <span style={{ color: '#6B7A99', fontSize: '0.85rem' }}>@ {job.company}</span>
                                            {statusBadge(job.approval_status)}
                                        </div>
                                        <div style={{ color: '#6B7A99', fontSize: '0.78rem' }}>
                                            Posted by: <span style={{ color: '#A0AEC0' }}>{job.employee?.full_name || 'Unknown'}</span>
                                            {' · '}{job.employee?.email}
                                            {' · '}<span style={{ textTransform: 'capitalize' }}>{job.referral_type}</span> referral
                                            {' · '}{new Date(job.created_at).toLocaleDateString('en-IN')}
                                        </div>
                                    </div>
                                    {job.job_url ? (
                                        <a href={job.job_url} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#00F0FF', fontSize: '0.8rem', textDecoration: 'none', border: '1px solid rgba(0,240,255,0.3)', padding: '5px 12px', borderRadius: 8 }}>
                                            <ExternalLink size={13} /> Verify Job URL
                                        </a>
                                    ) : (
                                        <span style={{ color: '#FF4444', fontSize: '0.8rem' }}>⚠️ No job_url — cannot approve</span>
                                    )}
                                </div>

                                {/* Admin feedback note (shown if already acted) */}
                                {job.admin_feedback && (
                                    <div style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.8rem', color: '#FF9999' }}>
                                        <strong>Admin note:</strong> {job.admin_feedback}
                                    </div>
                                )}

                                {/* Action row — only show for pending */}
                                {job.approval_status === 'pending' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                                        <input
                                            placeholder="Optional feedback / rejection reason…"
                                            value={feedback[job.id] || ''}
                                            onChange={e => setFeedback(f => ({ ...f, [job.id]: e.target.value }))}
                                            style={{ flex: 1, minWidth: 200, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#E8EDF5', padding: '7px 12px', fontSize: '0.82rem', outline: 'none' }}
                                        />
                                        <button
                                            onClick={() => handleAction(job.id, 'approved')}
                                            disabled={!job.job_url || acting === job.id + 'approved'}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: job.job_url ? 'rgba(0,240,100,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${job.job_url ? 'rgba(0,240,100,0.4)' : 'rgba(255,255,255,0.08)'}`, color: job.job_url ? '#00F064' : '#4A5568', padding: '7px 16px', borderRadius: 8, cursor: job.job_url ? 'pointer' : 'not-allowed', fontSize: '0.82rem', fontWeight: 600 }}>
                                            <CheckCircle size={14} /> {acting === job.id + 'approved' ? 'Approving…' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleAction(job.id, 'rejected')}
                                            disabled={acting === job.id + 'rejected'}
                                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.35)', color: '#FF6B6B', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                                            <XCircle size={14} /> {acting === job.id + 'rejected' ? 'Rejecting…' : 'Reject'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
