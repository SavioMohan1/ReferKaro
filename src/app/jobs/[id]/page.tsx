'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import { MapPin, Briefcase, TrendingUp, ArrowLeft, Calendar, Check, Coins, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ApplicationModal from '@/components/jobs/application-modal'

const jobTypeLabels: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time',
    contract: 'Contract',  internship: 'Internship',
}
const experienceLevelLabels: Record<string, string> = {
    entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead',
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [job, setJob] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [application, setApplication] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [id])

    const fetchData = async () => {
        const supabase = createClient()
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*, profiles:employee_id(full_name, company)')
            .eq('id', id)
            .single()

        if (jobError || !jobData) { notFound(); return }
        setJob(jobData)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles').select('token_balance, role').eq('id', user.id).single()
            setUserProfile(profile)

            const { data: appData } = await supabase
                .from('applications').select('id, status')
                .eq('job_id', id).eq('job_seeker_id', user.id).single()
            setApplication(appData)
        }
        setLoading(false)
    }

    const handleApplySuccess = () => { fetchData() }

    /* ── Loading skeleton ── */
    if (loading || !job) {
        return (
            <div className="page-wrapper" style={{ paddingTop: 80, paddingBottom: 80 }}>
                <div className="page-container" style={{ maxWidth: 860 }}>
                    <div className="dk-card" style={{ padding: '40px 36px' }}>
                        {[['70%','2rem'], ['35%','1rem'], ['50%','0.875rem']].map(([w, h], i) => (
                            <div key={i} className="animate-shimmer" style={{ width: w, height: h, borderRadius: 8, marginBottom: 16 }} />
                        ))}
                        <div style={{ display:'flex', gap:10, marginTop: 8 }}>
                            {['25%','20%','22%'].map((w, i) => (
                                <div key={i} className="animate-shimmer" style={{ width: w, height: 28, borderRadius: 999 }} />
                            ))}
                        </div>
                        <div className="animate-shimmer" style={{ height: 200, borderRadius: 12, marginTop: 32 }} />
                    </div>
                </div>
            </div>
        )
    }

    const canApply = userProfile && userProfile.role === 'job_seeker' && userProfile.token_balance > 0 && !application

    /* ── Apply button variants ── */
    const renderApplyBtn = () => {
        if (application) {
            if (application.status === 'payment_pending') {
                return (
                    <Link href="/my-applications" style={{ textDecoration:'none', display:'block' }}>
                        <button className="dk-btn-outline" style={{ width:'100%', justifyContent:'center', padding:'14px 24px', fontSize:'0.95rem' }}>
                            Awaiting Success Fee — Track Status →
                        </button>
                    </Link>
                )
            }
            return (
                <Link href="/my-applications" style={{ textDecoration:'none', display:'block' }}>
                    <button style={{
                        width:'100%', padding:'14px 24px', borderRadius:10, cursor:'pointer',
                        background:'rgba(34,197,94,0.1)', color:'#22C55E', fontWeight:600,
                        border:'1px solid rgba(34,197,94,0.3)', fontSize:'0.95rem',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        fontFamily:'var(--font-body)', transition:'box-shadow 0.2s',
                    }}>
                        <Check size={17} /> Application Submitted — Track Status
                    </button>
                </Link>
            )
        }
        if (!userProfile) {
            return (
                <Link href="/login" style={{ textDecoration:'none', display:'block' }}>
                    <button className="dk-btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px 24px', fontSize:'0.95rem' }}>
                        Login to Request Review →
                    </button>
                </Link>
            )
        }
        if (userProfile.role !== 'job_seeker') {
            return (
                <button disabled className="dk-btn-outline" style={{ width:'100%', justifyContent:'center', opacity:0.45, cursor:'not-allowed', padding:'14px 24px' }}>
                    Only Job Seekers Can Apply
                </button>
            )
        }
        if (userProfile.token_balance < 1) {
            return (
                <Link href="/buy-tokens" style={{ textDecoration:'none', display:'block' }}>
                    <button style={{
                        width:'100%', padding:'14px 24px', borderRadius:10, cursor:'pointer',
                        background:'rgba(251,146,60,0.1)', color:'#FB923C', fontWeight:600,
                        border:'1px solid rgba(251,146,60,0.3)', fontSize:'0.95rem',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        fontFamily:'var(--font-body)',
                    }}>
                        <Coins size={16} /> Buy Tokens to Apply
                    </button>
                </Link>
            )
        }
        return (
            <button
                onClick={() => setShowModal(true)}
                className="dk-btn-primary"
                style={{ width:'100%', justifyContent:'center', padding:'14px 24px', fontSize:'0.95rem' }}
            >
                Request Review &amp; Referral (1 Token) →
            </button>
        )
    }

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80, position:'relative', overflow:'hidden' }}>
            <div className="glow-orb glow-cyan"   style={{ width:350, height:350, top:-60, right:-60, opacity:0.3 }} />
            <div className="glow-orb glow-violet"  style={{ width:300, height:300, bottom:0, left:-60, opacity:0.25 }} />

            <div className="page-container" style={{ maxWidth:860, position:'relative', zIndex:1 }}>
                {/* Back link */}
                <Link href="/jobs" className="dk-btn-ghost" style={{ marginBottom:28, display:'inline-flex' }}>
                    <ArrowLeft size={14} /> Back to Jobs
                </Link>

                {/* Hero card */}
                <div className="dk-card" style={{ overflow:'hidden', marginBottom:24 }}>
                    {/* Dark gradient header — replaces the blue */}
                    <div style={{
                        padding:'36px 36px 32px',
                        background:'linear-gradient(135deg, rgba(0,240,255,0.07) 0%, rgba(123,94,255,0.07) 100%)',
                        borderBottom:'1px solid rgba(0,240,255,0.1)',
                    }}>
                        <h1 style={{
                            fontFamily:"'Syne', sans-serif",
                            fontSize:'clamp(1.5rem,3vw,2.2rem)',
                            fontWeight:700, color:'#E8EDF5', marginBottom:6,
                        }}>{job.role_title}</h1>
                        <p style={{ fontSize:'1.1rem', color:'#00F0FF', fontWeight:600, marginBottom:20 }}>{job.company}</p>

                        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                            {[
                                { icon:<MapPin size={13} />,     label: job.location },
                                { icon:<Briefcase size={13} />,  label: jobTypeLabels[job.job_type] },
                                { icon:<TrendingUp size={13} />, label: experienceLevelLabels[job.experience_level] },
                                { icon:<Calendar size={13} />,   label: `Posted ${new Date(job.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}` },
                            ].map(tag => (
                                <span key={tag.label} style={{
                                    display:'inline-flex', alignItems:'center', gap:6,
                                    fontSize:'0.8rem', color:'#6B7A99',
                                    background:'rgba(255,255,255,0.05)',
                                    border:'1px solid rgba(255,255,255,0.08)',
                                    padding:'5px 12px', borderRadius:999,
                                }}>
                                    <span style={{ color:'#00F0FF' }}>{tag.icon}</span>
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding:'36px', display:'flex', flexDirection:'column', gap:32 }}>

                        {/* Official job URL */}
                        {job.job_url && (
                            <div style={{
                                background:'rgba(0,240,255,0.04)',
                                border:'1px solid rgba(0,240,255,0.14)',
                                borderRadius:10, padding:'14px 18px',
                                display:'flex', alignItems:'flex-start', gap:12,
                            }}>
                                <ExternalLink size={16} color="#00F0FF" style={{ marginTop:2, flexShrink:0 }} />
                                <div>
                                    <p style={{ fontSize:'0.78rem', fontWeight:600, color:'#00F0FF', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                                        Official Job Posting
                                    </p>
                                    <a href={job.job_url} target="_blank" rel="noopener noreferrer"
                                        style={{ color:'#6B7A99', fontSize:'0.85rem', wordBreak:'break-all', transition:'color 0.2s' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#00F0FF')}
                                        onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
                                    >{job.job_url}</a>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h2 style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.05rem', color:'#E8EDF5', marginBottom:14 }}>
                                About the Role
                            </h2>
                            <p style={{ fontSize:'0.9rem', color:'#6B7A99', lineHeight:1.85, whiteSpace:'pre-line' }}>
                                {job.description}
                            </p>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div>
                                <h2 style={{ fontFamily:"'Syne', sans-serif", fontSize:'1.05rem', color:'#E8EDF5', marginBottom:14 }}>
                                    Requirements
                                </h2>
                                <p style={{ fontSize:'0.9rem', color:'#6B7A99', lineHeight:1.85, whiteSpace:'pre-line' }}>
                                    {job.requirements}
                                </p>
                            </div>
                        )}

                        {/* Verified referrer */}
                        <div style={{
                            background:'rgba(34,197,94,0.05)',
                            border:'1px solid rgba(34,197,94,0.15)',
                            borderRadius:12, padding:'18px 20px',
                            display:'flex', alignItems:'center', gap:14,
                        }}>
                            <ShieldCheck size={22} color="#22C55E" flexShrink={0} />
                            <div>
                                <p style={{ fontSize:'0.85rem', fontWeight:600, color:'#22C55E', marginBottom:2 }}>
                                    Verified Employee Referral
                                </p>
                                {job.profiles?.company && (
                                    <p style={{ fontSize:'0.8rem', color:'#6B7A99' }}>
                                        Works at <strong style={{ color:'#E8EDF5' }}>{job.profiles.company}</strong>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Token balance info */}
                        {userProfile?.role === 'job_seeker' && (
                            <div style={{
                                display:'flex', alignItems:'center', gap:10,
                                padding:'12px 16px', borderRadius:10,
                                background:'rgba(255,255,255,0.03)',
                                border:'1px solid rgba(255,255,255,0.07)',
                            }}>
                                <Coins size={16} color="#00F0FF" />
                                <span style={{ fontSize:'0.85rem', color:'#6B7A99' }}>
                                    Your balance: <strong style={{ color:'#E8EDF5' }}>{userProfile.token_balance} token{userProfile.token_balance !== 1 ? 's' : ''}</strong>
                                    {userProfile.token_balance < 1 && (
                                        <> — <Link href="/buy-tokens" style={{ color:'#00F0FF' }}>Buy more</Link></>
                                    )}
                                </span>
                            </div>
                        )}

                        {/* Apply CTA */}
                        <div style={{ paddingTop:8 }}>
                            {renderApplyBtn()}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <ApplicationModal
                    jobId={job.id}
                    employeeId={job.employee_id}
                    jobTitle={job.role_title}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleApplySuccess}
                />
            )}
        </div>
    )
}
