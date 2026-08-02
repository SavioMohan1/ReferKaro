'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Building2, ClipboardCheck, FilePlus2, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { APPLICATION_STATUS_MAP } from '@/lib/constants'
import InboxPanel from '@/components/dashboard/inbox-panel'

interface EmployeeDashboardProps { profile: any; user: any; recentActivity: any[] }

export default function EmployeeDashboard({ profile, user, recentActivity }: EmployeeDashboardProps) {
    const [pendingCount, setPendingCount] = useState(0)
    const firstName = profile.full_name?.split(' ')[0] || 'there'

    useEffect(() => {
        const fetchPendingCount = async () => {
            const supabase = createClient()
            const { count, error } = await supabase
                .from('applications').select('id', { count: 'exact', head: true })
                .eq('employee_id', user.id).eq('status', 'pending')
            if (!error && count !== null) setPendingCount(count)
        }
        fetchPendingCount()
    }, [user.id])

    return (
        <main className="rk-product-page">
            <div className="rk-shell rk-product-shell">
                <header className="rk-product-hero rk-rise">
                    <div>
                        <span className="rk-kicker">Employee workspace</span>
                        <h1>Make a thoughtful<br />introduction, {firstName}.</h1>
                        <p>Review candidates against the role, keep decisions visible, and manage the openings you can genuinely refer for.</p>
                    </div>
                    <div className="rk-balance-card rk-balance-card-employee">
                        <span>Waiting for review</span>
                        <strong>{pendingCount}</strong>
                        <p>Pending referral request{pendingCount === 1 ? '' : 's'} across your listings.</p>
                        <Link href="/applications">Review queue <ArrowUpRight size={16} /></Link>
                    </div>
                </header>

                <section className="rk-action-grid rk-rise-delay" aria-label="Quick actions">
                    <Link href="/applications" className="rk-action-card rk-action-card-primary">
                        <span className="rk-action-icon"><ClipboardCheck size={22} /></span>
                        <span className="rk-action-index">01</span>
                        <strong>Review requests</strong>
                        <p>Compare candidate context with each listing and record a clear decision.</p>
                        <span className="rk-action-link">Open review queue <ArrowUpRight size={16} /></span>
                    </Link>
                    <Link href="/jobs/create" className="rk-action-card">
                        <span className="rk-action-icon"><FilePlus2 size={22} /></span>
                        <span className="rk-action-index">02</span>
                        <strong>Create a listing</strong>
                        <p>Add an opening you can refer for. New listings enter the admin review queue.</p>
                        <span className="rk-action-link">Start a listing <ArrowUpRight size={16} /></span>
                    </Link>
                    <div className="rk-action-card rk-company-card">
                        <span className="rk-action-icon"><Building2 size={22} /></span>
                        <span className="rk-action-index">Profile</span>
                        <strong>{profile.company || 'Company not set'}</strong>
                        <p>This is the company associated with your employee profile.</p>
                    </div>
                </section>

                <div className="rk-dashboard-grid">
                    <section className="rk-product-panel">
                        <div className="rk-panel-heading">
                            <div><span className="rk-kicker">Latest movement</span><h2>Recent candidates</h2></div>
                            {recentActivity.length > 0 && <Link href="/applications">View all <ArrowUpRight size={14} /></Link>}
                        </div>
                        {recentActivity.length === 0 ? (
                            <div className="rk-empty-state">
                                <UserRound size={28} />
                                <h3>No applications received</h3>
                                <p>Create an accurate listing when you have an opening available for referral.</p>
                                <Link href="/jobs/create" className="rk-button rk-button-primary">Create a listing</Link>
                            </div>
                        ) : (
                            <div className="rk-activity-list">
                                {recentActivity.map((item) => {
                                    const status = APPLICATION_STATUS_MAP[item.status] || APPLICATION_STATUS_MAP.expired
                                    return (
                                        <article className="rk-activity-row" key={item.id}>
                                            <span className="rk-activity-mark"><UserRound size={17} /></span>
                                            <div className="rk-activity-copy">
                                                <strong>{item.profiles?.full_name || 'Candidate'}</strong>
                                                <span>{item.jobs?.role_title} · {new Date(item.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <span className="rk-status" data-status={item.status}>{status.label}</span>
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </section>
                    <aside className="rk-product-panel rk-inbox-card"><InboxPanel /></aside>
                </div>
            </div>
        </main>
    )
}
