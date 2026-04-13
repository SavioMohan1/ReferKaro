'use client'

import { useState } from 'react'
import { User, Briefcase, Calendar, ExternalLink, Check, X, Copy, Mail, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ApplicationCardProps { application: any }

const statusMap: Record<string, { label: string; cls: string }> = {
    pending:         { label: 'Pending',         cls: 'status-pending' },
    selected:        { label: 'Selected',        cls: 'status-selected' },
    payment_pending: { label: 'Pmt. Pending',    cls: 'status-selected' },
    accepted:        { label: 'Accepted',        cls: 'status-accepted' },
    rejected:        { label: 'Rejected',        cls: 'status-rejected' },
    expired:         { label: 'Expired',         cls: 'status-expired' },
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(application.status)
    const [proxyEmail, setProxyEmail] = useState<string | null>(application.proxy_emails?.[0]?.proxy_address || null)
    const [analyzing, setAnalyzing] = useState(false)
    const [aiResult, setAiResult] = useState<any>(null)
    const router = useRouter()

    const handleAnalyze = async () => {
        setAnalyzing(true)
        try {
            const response = await fetch('/api/ai/analyze-resume', {
                method: 'POST', body: JSON.stringify({ applicationId: application.id }),
            })
            const data = await response.json()
            if (data.error) throw new Error(data.error)
            setAiResult(data.analysis)
        } catch (error: any) {
            alert(error.message || 'Analysis failed')
        } finally { setAnalyzing(false) }
    }

    const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
        setLoading(true)
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
        } catch (error: any) {
            console.error('Error updating status:', error)
            alert(error.message || 'Failed to update application status')
        } finally { setLoading(false) }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    const stat = statusMap[status] || { label: status, cls: 'status-expired' }

    return (
        <div className="dk-card" style={{ padding: '24px 28px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,240,255,0.07)', border: '1px solid rgba(0,240,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={22} color="#00F0FF" />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: '#E8EDF5', marginBottom: 2 }}>
                            {application.profiles?.full_name || 'Anonymous'}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#6B7A99' }}>{application.profiles?.email}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6B7A99' }}>
                                <Briefcase size={12} /> {application.jobs?.role_title}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6B7A99' }}>
                                <Calendar size={12} /> Applied {new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
                <span className={stat.cls}>{stat.label}</span>
            </div>

            {/* Cover letter */}
            <div style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,240,255,0.07)',
                borderRadius: 10, padding: '16px 18px', marginBottom: 16,
            }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#B0BAD4', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Cover Letter
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#6B7A99', lineHeight: 1.75, whiteSpace: 'pre-line',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {application.cover_letter}
                </p>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(0,240,255,0.07)', alignItems: 'center' }}>
                    {application.resume_url && (
                        <>
                            <button onClick={async () => {
                                const supabase = createClient()
                                const { data, error } = await supabase.storage.from('resumes').createSignedUrl(application.resume_url, 60)
                                if (data) window.open(data.signedUrl, '_blank')
                                if (error) alert('Error opening resume')
                            }} style={{
                                display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,240,255,0.06)',
                                border: '1px solid rgba(0,240,255,0.18)', borderRadius: 6, padding: '5px 12px',
                                color: '#00F0FF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                            }}>
                                <ExternalLink size={12} /> View Resume
                            </button>

                            <button onClick={handleAnalyze} disabled={analyzing} style={{
                                display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(123,94,255,0.08)',
                                border: '1px solid rgba(123,94,255,0.22)', borderRadius: 6, padding: '5px 12px',
                                color: '#7B5EFF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                opacity: analyzing ? 0.6 : 1,
                            }}>
                                {analyzing ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : '⚡ Analyze Match'}
                            </button>
                        </>
                    )}
                    {application.linkedin_url && (
                        <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#00F0FF', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                            LinkedIn <ExternalLink size={12} />
                        </a>
                    )}
                    {application.portfolio_url && (
                        <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#00F0FF', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                            Portfolio <ExternalLink size={12} />
                        </a>
                    )}
                </div>
            </div>

            {/* AI Match Result */}
            {aiResult && (
                <div style={{
                    marginBottom: 20, padding: '18px 20px', borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(123,94,255,0.07) 0%, rgba(0,240,255,0.04) 100%)',
                    border: '1px solid rgba(123,94,255,0.2)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <h4 style={{ fontWeight: 700, color: '#7B5EFF', fontSize: '0.9rem' }}>⚡ AI Match Score</h4>
                        <span style={{
                            fontFamily: 'var(--font-head)', fontSize: '1.2rem', fontWeight: 800, padding: '2px 12px', borderRadius: 8,
                            color: aiResult.score >= 80 ? '#22C55E' : aiResult.score >= 50 ? '#F59E0B' : '#EF4444',
                            background: aiResult.score >= 80 ? 'rgba(34,197,94,0.1)' : aiResult.score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${aiResult.score >= 80 ? 'rgba(34,197,94,0.25)' : aiResult.score >= 50 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        }}>{aiResult.score}/100</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7A99', fontStyle: 'italic', marginBottom: 14 }}>"{aiResult.summary}"</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22C55E', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pros</p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {aiResult.pros.map((p: string, i: number) => (
                                    <li key={i} style={{ fontSize: '0.82rem', color: '#6B7A99', display: 'flex', gap: 6 }}>
                                        <span style={{ color: '#22C55E', flexShrink: 0 }}>+</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#EF4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cons</p>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {aiResult.cons.map((c: string, i: number) => (
                                    <li key={i} style={{ fontSize: '0.82rem', color: '#6B7A99', display: 'flex', gap: 6 }}>
                                        <span style={{ color: '#EF4444', flexShrink: 0 }}>−</span> {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending actions */}
            {status === 'pending' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button onClick={() => handleStatusUpdate('accepted')} disabled={loading} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '11px 20px', borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)',
                        fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-body)', opacity: loading ? 0.6 : 1,
                    }}>
                        {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                        {application.referral_type === 'pooling' ? 'Select as Pool Winner' : 'Select for Referral (9 Tokens)'}
                    </button>
                    <button onClick={() => handleStatusUpdate('rejected')} disabled={loading} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '11px 20px', borderRadius: 8, cursor: 'pointer',
                        background: 'rgba(239,68,68,0.06)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.22)',
                        fontWeight: 600, fontSize: '0.875rem', fontFamily: 'var(--font-body)', opacity: loading ? 0.6 : 1,
                    }}>
                        <X size={14} /> Reject
                    </button>
                </div>
            )}

            {/* Status banners */}
            {status === 'selected' && (
                <div style={{
                    marginTop: 16, padding: '16px 18px', borderRadius: 10,
                    background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F59E0B', fontWeight: 700, marginBottom: 4 }}>
                        <AlertTriangle size={16} /> Awaiting Seeker's Final Tokens
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#6B7A99' }}>
                        You selected this candidate. They have 24 hours to provide the remaining 9 tokens.
                    </p>
                    {application.selected_at && (
                        <p style={{ fontSize: '0.75rem', color: '#6B7A99', marginTop: 6 }}>
                            Offer expires: {new Date(new Date(application.selected_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}
                        </p>
                    )}
                </div>
            )}

            {status === 'payment_pending' && (
                <div style={{
                    marginTop: 16, padding: '16px 18px', borderRadius: 10,
                    background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.18)',
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00F0FF', fontWeight: 700, marginBottom: 4 }}>
                        <AlertTriangle size={16} /> Awaiting Candidate Payment
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#6B7A99' }}>
                        Secondary payment required by candidate. Once paid, the proxy email will appear below.
                    </p>
                </div>
            )}

            {status === 'expired' && (
                <div style={{
                    marginTop: 16, padding: '14px 18px', borderRadius: 10, opacity: 0.7,
                    background: 'rgba(107,114,153,0.06)', border: '1px solid rgba(107,114,153,0.15)',
                }}>
                    <p style={{ fontSize: '0.875rem', color: '#6B7A99', fontStyle: 'italic' }}>
                        ⚠️ Selection expired. The seeker failed to provide tokens within the 24h window.
                    </p>
                </div>
            )}

            {/* Accepted + proxy email */}
            {status === 'accepted' && (
                <div style={{
                    marginTop: 16, padding: '18px 20px', borderRadius: 12,
                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E', fontWeight: 700, marginBottom: 12 }}>
                        <Check size={16} /> Candidate Accepted!
                    </h4>
                    {proxyEmail ? (
                        <>
                            <p style={{ fontSize: '0.85rem', color: '#6B7A99', marginBottom: 12 }}>
                                Use this <strong style={{ color: '#E8EDF5' }}>Secure Proxy Email</strong> to refer the candidate in your company portal:
                            </p>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(34,197,94,0.25)',
                                borderRadius: 8, padding: '10px 14px',
                            }}>
                                <Mail size={15} color="#6B7A99" />
                                <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.875rem', color: '#E8EDF5' }}>{proxyEmail}</code>
                                <button onClick={() => copyToClipboard(proxyEmail)} style={{
                                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                                    borderRadius: 6, padding: '5px 8px', cursor: 'pointer', color: '#22C55E', display: 'flex', alignItems: 'center',
                                }}>
                                    <Copy size={14} />
                                </button>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12,
                                padding: '10px 14px', borderRadius: 8,
                                background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
                            }}>
                                <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                                <p style={{ fontSize: '0.78rem', color: '#6B7A99', lineHeight: 1.6 }}>
                                    <strong style={{ color: '#F59E0B' }}>Important:</strong> Do NOT use their personal email. Updates sent to this proxy email are automatically tracked by ReferKaro.
                                </p>
                            </div>
                        </>
                    ) : (
                        <p style={{ fontSize: '0.875rem', color: '#6B7A99' }}>
                            Refresh the page to see the unique referral email for this candidate.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
