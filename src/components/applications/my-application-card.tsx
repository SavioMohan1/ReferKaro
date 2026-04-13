'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, Calendar, Building, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

declare global { interface Window { Razorpay: any } }

interface MyApplicationCardProps { application: any }

const statusMap: Record<string, { label: string; cls: string }> = {
    pending:         { label: 'Pending Review',     cls: 'status-pending' },
    selected:        { label: 'Selected',           cls: 'status-selected' },
    payment_pending: { label: 'Payment Pending',    cls: 'status-selected' },
    accepted:        { label: 'Accepted',           cls: 'status-accepted' },
    rejected:        { label: 'Rejected',           cls: 'status-rejected' },
    expired:         { label: 'Expired',            cls: 'status-expired' },
}

export default function MyApplicationCard({ application }: MyApplicationCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [paying, setPaying] = useState(false)
    const [userBalance, setUserBalance] = useState<number | null>(null)
    const router = useRouter()

    useState(() => {
        const fetchBalance = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('token_balance').eq('id', user.id).single()
                if (data) setUserBalance(data.token_balance)
            }
        }
        fetchBalance()
    })

    const handleTokenPayment = async () => {
        setPaying(true)
        try {
            const response = await fetch('/api/applications/complete-payment', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id }),
            })
            const data = await response.json()
            if (data.success) { alert('Success! 9 tokens deducted. Your referral is now active.'); router.refresh() }
            else alert(data.error || 'Failed to process tokens')
        } catch { alert('Something went wrong') }
        finally { setPaying(false) }
    }

    const handlePayment = async () => {
        setPaying(true)
        try {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: 'success_fee', amount: 900, tokens: 0, type: 'success_fee', applicationId: application.id }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            const options = {
                key: data.keyId, amount: data.amount, currency: 'INR',
                name: 'ReferKaro', description: `Success Fee for ${application.jobs?.company}`,
                order_id: data.orderId,
                handler: async (response: any) => {
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }),
                    })
                    const verifyData = await verifyRes.json()
                    if (verifyData.success) { alert('Payment Successful! Your Proxy Email is unlocked.'); router.refresh() }
                    else alert('Payment Verification Failed')
                },
                theme: { color: '#00F0FF' },
            }
            const rzp1 = new window.Razorpay(options)
            rzp1.open()
        } catch (error) {
            console.error('Payment failed:', error)
            alert('Something went wrong. Please try again.')
        } finally { setPaying(false) }
    }

    const stat = statusMap[application.status] || { label: application.status, cls: 'status-expired' }

    return (
        <div className="dk-card" style={{ padding: '24px 28px' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', color: '#E8EDF5', marginBottom: 4 }}>
                        {application.jobs?.role_title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <Building size={13} color="#6B7A99" />
                        <span style={{ fontSize: '0.9rem', color: '#00F0FF', fontWeight: 600 }}>{application.jobs?.company}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6B7A99' }}>
                            <Calendar size={12} color="#6B7A99" />
                            Applied {new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {application.reviewed_at && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#6B7A99' }}>
                                · Reviewed {new Date(application.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span className={stat.cls}>{stat.label}</span>
                    <Link href={`/jobs/${application.job_id}`} className="dk-btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                        View Job
                    </Link>
                </div>
            </div>

            {/* Expand toggle */}
            <div style={{ borderTop: '1px solid rgba(0,240,255,0.07)', paddingTop: 14 }}>
                <button onClick={() => setExpanded(!expanded)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6B7A99', fontSize: '0.82rem', fontWeight: 500,
                    transition: 'color 0.2s',
                }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#00F0FF')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
                >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Hide Details' : 'View Application Details'}
                </button>

                {/* Expanded body */}
                <div style={{
                    display: 'grid',
                    gridTemplateRows: expanded ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.3s ease',
                    marginTop: expanded ? 16 : 0,
                }}>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,240,255,0.08)',
                            borderRadius: 10, padding: '18px 20px',
                        }}>
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#B0BAD4', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Cover Letter
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#6B7A99', whiteSpace: 'pre-line', lineHeight: 1.75, marginBottom: 16 }}>
                                {application.cover_letter}
                            </p>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', borderTop: '1px solid rgba(0,240,255,0.07)', paddingTop: 14 }}>
                                {application.resume_url && (
                                    <button onClick={async () => {
                                        const supabase = createClient()
                                        const { data, error } = await supabase.storage.from('resumes').createSignedUrl(application.resume_url, 60)
                                        if (data) window.open(data.signedUrl, '_blank')
                                        if (error) alert('Error opening resume')
                                    }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#00F0FF', fontSize: '0.82rem', fontWeight: 600 }}>
                                        <ExternalLink size={12} /> View Resume
                                    </button>
                                )}
                                {application.linkedin_url && (
                                    <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#00F0FF', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                                        <ExternalLink size={12} /> LinkedIn
                                    </a>
                                )}
                                {application.portfolio_url && (
                                    <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#00F0FF', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                                        <ExternalLink size={12} /> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected action banner */}
            {application.status === 'selected' && (
                <div style={{
                    marginTop: 20, padding: '18px 20px', borderRadius: 12,
                    background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                }}>
                    <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#F59E0B', marginBottom: 4 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', animation: 'pulse-orb 1.5s ease-in-out infinite', display: 'inline-block' }} />
                            🎯 You've Been Selected!
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#6B7A99' }}>
                            The employee wants to refer you. Pay <strong style={{ color: '#F59E0B' }}>9 Tokens</strong> to secure your spot.
                        </p>
                        {application.selected_at && (
                            <p style={{ fontSize: '0.75rem', color: '#6B7A99', marginTop: 4 }}>
                                Expires: {new Date(new Date(application.selected_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}
                            </p>
                        )}
                    </div>
                    {userBalance !== null && userBalance >= 9 ? (
                        <button onClick={handleTokenPayment} disabled={paying} style={{
                            background: 'rgba(251,191,36,0.15)', color: '#F59E0B', border: '1px solid rgba(251,191,36,0.35)',
                            borderRadius: 8, padding: '10px 20px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, opacity: paying ? 0.65 : 1,
                        }}>
                            {paying ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Pay 9 Tokens'}
                        </button>
                    ) : (
                        <Link href="/buy-tokens" className="dk-btn-primary" style={{ padding: '10px 20px' }}>
                            Buy Tokens to Finalize →
                        </Link>
                    )}
                </div>
            )}

            {/* Payment pending banner */}
            {application.status === 'payment_pending' && (
                <div style={{
                    marginTop: 20, padding: '18px 20px', borderRadius: 12,
                    background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                }}>
                    <div>
                        <h4 style={{ fontWeight: 700, color: '#00F0FF', marginBottom: 4 }}>🎉 Application Accepted!</h4>
                        <p style={{ fontSize: '0.85rem', color: '#6B7A99' }}>Pay the final fee to unlock your secure referral email.</p>
                    </div>
                    <button onClick={handlePayment} disabled={paying} className="dk-btn-primary" style={{ padding: '10px 20px', opacity: paying ? 0.65 : 1 }}>
                        {paying ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Pay ₹900 Now'}
                    </button>
                </div>
            )}

            {/* Accepted */}
            {application.status === 'accepted' && (
                <div style={{
                    marginTop: 20, padding: '14px 18px', borderRadius: 10,
                    background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#22C55E', fontSize: '1rem' }}>✓</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6B7A99' }}>
                        <strong style={{ color: '#22C55E' }}>Referral Secured!</strong> Your proxy email is active. Check your inbox.
                    </p>
                </div>
            )}

            {/* Expired */}
            {application.status === 'expired' && (
                <div style={{
                    marginTop: 20, padding: '14px 18px', borderRadius: 10, opacity: 0.7,
                    background: 'rgba(107,114,153,0.06)', border: '1px solid rgba(107,114,153,0.15)',
                }}>
                    <p style={{ fontSize: '0.875rem', color: '#6B7A99' }}>
                        ⚠️ <strong style={{ color: '#E8EDF5' }}>Expired.</strong> This selection offer expired after 24 hours of inactivity.
                    </p>
                </div>
            )}
        </div>
    )
}
