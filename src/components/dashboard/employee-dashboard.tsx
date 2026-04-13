'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IndianRupee, ArrowRight, UserPlus, Clock, BarChart2, CheckCircle, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const statusMap: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending:         { label: 'Pending',      color: '#FB923C', bg: 'rgba(251,146,60,0.08)',   border: 'rgba(251,146,60,0.2)' },
    selected:        { label: 'Selected',     color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.22)' },
    payment_pending: { label: 'Pay Pending',  color: '#00F0FF', bg: 'rgba(0,240,255,0.06)',   border: 'rgba(0,240,255,0.18)' },
    accepted:        { label: 'Accepted',     color: '#22C55E', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.2)' },
    rejected:        { label: 'Rejected',     color: '#EF4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)' },
    expired:         { label: 'Expired',      color: '#6B7A99', bg: 'rgba(107,122,153,0.06)', border: 'rgba(107,122,153,0.15)' },
}

interface EmployeeDashboardProps { profile: any; user: any; recentActivity: any[] }

export default function EmployeeDashboard({ profile, user, recentActivity }: EmployeeDashboardProps) {
    const supabase = createClient()
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => { fetchPendingCount() }, [])

    const fetchPendingCount = async () => {
        const { count, error } = await supabase
            .from('applications').select('id', { count:'exact', head:true })
            .eq('employee_id', user.id).eq('status', 'pending')
        if (!error && count !== null) setPendingCount(count)
    }

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80, position:'relative', overflow:'hidden' }}>
            <div className="glow-orb glow-violet" style={{ width:400, height:400, top:-80, right:-80, opacity:0.32 }} />
            <div className="glow-orb glow-cyan"   style={{ width:320, height:320, bottom:0, left:-80, opacity:0.28 }} />

            <div className="page-container" style={{ position:'relative', zIndex:1 }}>
                {/* Welcome */}
                <div style={{ marginBottom:36 }}>
                    <span className="dk-chip" style={{ marginBottom:12, display:'inline-block' }}>Employee</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'#E8EDF5', marginBottom:4 }}>
                        Welcome back, {profile.full_name?.split(' ')[0] || 'there'} 👋
                    </h1>
                    <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>Review referral applications and manage your listings.</p>
                </div>

                {/* Earnings card */}
                <div className="dk-card" style={{
                    padding:'32px 36px', marginBottom:28,
                    background:'linear-gradient(135deg, rgba(123,94,255,0.1) 0%, rgba(0,240,255,0.06) 100%)',
                    border:'1px solid rgba(123,94,255,0.3)',
                }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
                        <div>
                            <p style={{ fontSize:'0.85rem', color:'#6B7A99', marginBottom:8 }}>Total Earnings</p>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <IndianRupee size={28} color="#7B5EFF" />
                                <span style={{ fontFamily:'var(--font-head)', fontSize:'3.2rem', fontWeight:800, color:'#7B5EFF', lineHeight:1 }}>0</span>
                            </div>
                            <p style={{ fontSize:'0.8rem', color:'#6B7A99', marginTop:6 }}>Earn ₹500 per successful referral</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                            <p style={{ fontSize:'0.8rem', color:'#6B7A99', marginBottom:4 }}>Your Company</p>
                            <p style={{ fontFamily:'var(--font-head)', fontSize:'1.3rem', color:'#E8EDF5' }}>
                                {profile.company || 'Not set'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick actions */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, marginBottom:28 }}>
                    <div className="dk-card dk-card-inner">
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                            <div style={{ width:40,height:40,borderRadius:10,background:'rgba(251,146,60,0.1)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                                <Clock size={20} color="#FB923C" />
                            </div>
                            <span style={{ fontFamily:'var(--font-head)', fontSize:'2rem', fontWeight:800, color:'#FB923C' }}>
                                {pendingCount}
                            </span>
                        </div>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5', marginBottom:6 }}>Pending Requests</h3>
                        <p style={{ fontSize:'0.875rem', color:'#6B7A99', marginBottom:20, lineHeight:1.6 }}>
                            Review and respond to referral applications awaiting your decision.
                        </p>
                        <Link href="/applications" className="dk-btn-primary" style={{ width:'100%', justifyContent:'center' }}>
                            View Requests <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="dk-card dk-card-inner">
                        <div style={{ width:40,height:40,borderRadius:10,background:'rgba(0,240,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                            <UserPlus size={20} color="#00F0FF" />
                        </div>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5', marginBottom:6 }}>Create Listing</h3>
                        <p style={{ fontSize:'0.875rem', color:'#6B7A99', marginBottom:20, lineHeight:1.6 }}>
                            Post a new referral job opening and start receiving applications.
                        </p>
                        <Link href="/jobs/create" className="dk-btn-outline" style={{ width:'100%', justifyContent:'center' }}>
                            <UserPlus size={14} /> New Listing
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dk-card dk-card-inner">
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5' }}>Recent Applications</h3>
                        {recentActivity.length > 0 && (
                            <Link href="/applications" style={{ fontSize:'0.8rem', color:'#00F0FF', textDecoration:'none', fontWeight:600 }}>
                                View all →
                            </Link>
                        )}
                    </div>

                    {recentActivity.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'40px 0', color:'#6B7A99' }}>
                            <User size={40} strokeWidth={1.5} style={{ margin:'0 auto 12px', opacity:0.4 }} />
                            <p style={{ fontSize:'0.875rem' }}>No applications received yet. Create a listing to get started!</p>
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
                                                <User size={16} color="#6B7A99" />
                                            </div>
                                            <div>
                                                <p style={{ fontSize:'0.875rem', color:'#E8EDF5', fontWeight:500, marginBottom:2 }}>
                                                    {item.profiles?.full_name || 'Unknown'}
                                                </p>
                                                <p style={{ fontSize:'0.78rem', color:'#6B7A99', display:'flex', alignItems:'center', gap:5 }}>
                                                    <Clock size={11} /> {new Date(item.applied_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                                                    &nbsp;·&nbsp;{item.jobs?.role_title}
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
            </div>
        </div>
    )
}
