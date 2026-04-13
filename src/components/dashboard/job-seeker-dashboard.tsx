'use client'

import Link from 'next/link'
import { Coins, ArrowRight, FileText, Briefcase, Plus, Clock } from 'lucide-react'
import InboxPanel from '@/components/dashboard/inbox-panel'

interface JobSeekerDashboardProps {
    profile: any
    user: any
    recentActivity: any[]
}

const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending:         { label: 'Pending',      color: '#FB923C', bg: 'rgba(251,146,60,0.08)',   border: 'rgba(251,146,60,0.2)' },
    selected:        { label: 'Selected',     color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)' },
    payment_pending: { label: 'Pay Required', color: '#00F0FF', bg: 'rgba(0,240,255,0.06)',   border: 'rgba(0,240,255,0.18)' },
    accepted:        { label: 'Accepted',     color: '#22C55E', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.2)' },
    rejected:        { label: 'Rejected',     color: '#EF4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)' },
    expired:         { label: 'Expired',      color: '#6B7A99', bg: 'rgba(107,122,153,0.06)', border: 'rgba(107,122,153,0.15)' },
}

export default function JobSeekerDashboard({ profile, user, recentActivity }: JobSeekerDashboardProps) {
    const balance = profile.token_balance || 0

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80, position:'relative', overflow:'hidden' }}>
            <div className="glow-orb glow-cyan"   style={{ width:400, height:400, top:-80, right:-80, opacity:0.35 }} />
            <div className="glow-orb glow-violet"  style={{ width:340, height:340, bottom:0, left:-80, opacity:0.28 }} />

            <div className="page-container" style={{ position:'relative', zIndex:1 }}>
                {/* Welcome */}
                <div style={{ marginBottom:36 }}>
                    <span className="dk-chip" style={{ marginBottom:12, display:'inline-block' }}>Job Seeker</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'#E8EDF5', marginBottom:4 }}>
                        Welcome back, {profile.full_name?.split(' ')[0] || 'there'} 👋
                    </h1>
                    <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>Your referral dashboard — track applications and manage tokens.</p>
                </div>

                {/* Token balance card */}
                <div className="dk-card" style={{
                    padding:'32px 36px', marginBottom:28,
                    background: 'linear-gradient(135deg, rgba(0,240,255,0.07) 0%, rgba(123,94,255,0.07) 100%)',
                    border:'1px solid rgba(0,240,255,0.2)',
                }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                        <div>
                            <p style={{ fontSize:'0.85rem', color:'#6B7A99', marginBottom:8 }}>Token Balance</p>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                <Coins size={32} color="#00F0FF" />
                                <span style={{ fontFamily:'var(--font-head)', fontSize:'3.5rem', fontWeight:800, color:'#00F0FF', lineHeight:1 }}>
                                    {balance}
                                </span>
                            </div>
                            <p style={{ fontSize:'0.8rem', color:'#6B7A99', marginTop:6 }}>1 token = 1 referral application</p>
                        </div>
                        <Link href="/buy-tokens" className="dk-btn-primary" style={{ padding:'12px 24px' }}>
                            <Plus size={16} /> Buy Tokens
                        </Link>
                    </div>
                </div>

                {/* Quick actions */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, marginBottom:28 }}>
                    <div className="dk-card dk-card-inner">
                        <div style={{ width:40,height:40,borderRadius:10,background:'rgba(0,240,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                            <Briefcase size={20} color="#00F0FF" />
                        </div>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5', marginBottom:8 }}>Browse Referrals</h3>
                        <p style={{ fontSize:'0.875rem', color:'#6B7A99', marginBottom:20, lineHeight:1.6 }}>
                            Find companies hiring and connect with employees who can refer you.
                        </p>
                        <Link href="/jobs" className="dk-btn-primary" style={{ width:'100%', justifyContent:'center' }}>
                            Explore Jobs <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="dk-card dk-card-inner">
                        <div style={{ width:40,height:40,borderRadius:10,background:'rgba(123,94,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                            <FileText size={20} color="#7B5EFF" />
                        </div>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5', marginBottom:8 }}>My Applications</h3>
                        <p style={{ fontSize:'0.875rem', color:'#6B7A99', marginBottom:20, lineHeight:1.6 }}>
                            Track the status of all your referral requests in one place.
                        </p>
                        <Link href="/my-applications" className="dk-btn-outline" style={{ width:'100%', justifyContent:'center' }}>
                            View Applications <FileText size={14} />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity — live data */}
                <div className="dk-card dk-card-inner">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5' }}>Recent Activity</h3>
                        {recentActivity.length > 0 && (
                            <Link href="/my-applications" style={{ fontSize:'0.8rem', color:'#00F0FF', textDecoration:'none', fontWeight:600 }}>
                                View all →
                            </Link>
                        )}
                    </div>

                    {recentActivity.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'40px 0', color:'#6B7A99' }}>
                            <FileText size={40} strokeWidth={1.5} style={{ margin:'0 auto 12px', opacity:0.4 }} />
                            <p style={{ fontSize:'0.875rem' }}>No activity yet. Buy tokens and start applying!</p>
                        </div>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                            {recentActivity.map((item, i) => {
                                const s = statusMap[item.status] || statusMap.expired
                                return (
                                    <div key={item.id} style={{
                                        display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                                        padding:'14px 0',
                                        borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(0,240,255,0.06)' : 'none',
                                    }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(0,240,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <Briefcase size={16} color="#6B7A99" />
                                            </div>
                                            <div>
                                                <p style={{ fontSize:'0.875rem', color:'#E8EDF5', fontWeight:500, marginBottom:2 }}>
                                                    {item.jobs?.role_title}
                                                </p>
                                                <p style={{ fontSize:'0.78rem', color:'#6B7A99', display:'flex', alignItems:'center', gap:5 }}>
                                                    <Clock size={11} /> {new Date(item.applied_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                                    &nbsp;·&nbsp;{item.jobs?.company}
                                                </p>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize:'0.72rem', fontWeight:700, whiteSpace:'nowrap',
                                            padding:'4px 10px', borderRadius:999,
                                            color:s.color, background:s.bg, border:`1px solid ${s.border}`,
                                        }}>{s.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                {/* Inbox */}
                <div className="dk-card dk-card-inner" style={{ marginTop: 28 }}>
                    <InboxPanel />
                </div>
            </div>
        </div>
    )
}
