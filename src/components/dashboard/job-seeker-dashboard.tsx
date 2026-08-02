'use client'

import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, Coins, FileText, Route } from 'lucide-react'
import InboxPanel from '@/components/dashboard/inbox-panel'
import { APPLICATION_STATUS_MAP } from '@/lib/constants'

interface JobSeekerDashboardProps {
    profile: any
    user: any
    recentActivity: any[]
}

export default function JobSeekerDashboard({ profile, user: _user, recentActivity }: JobSeekerDashboardProps) {
    const balance = profile.token_balance || 0
    const firstName = profile.full_name?.split(' ')[0] || 'there'

    return (
        <main className="rk-product-page">
            <div className="rk-shell rk-product-shell">
                <header className="rk-product-hero rk-rise">
                    <div>
                        <span className="rk-kicker">Job seeker workspace</span>
                        <h1>Your next introduction<br />starts here, {firstName}.</h1>
                        <p>Find reviewed openings, request a referral, and follow every decision without losing the thread.</p>
                    </div>
                    <div className="rk-balance-card" aria-label={`${balance} tokens available`}>
                        <span>Available tokens</span>
                        <strong>{balance}</strong>
                        <p>One token submits one referral request.</p>
                        <Link href="/buy-tokens">Get tokens <ArrowUpRight size={16} /></Link>
                    </div>
                </header>

                <section className="rk-action-grid rk-rise-delay" aria-label="Quick actions">
                    <Link href="/jobs" className="rk-action-card rk-action-card-primary">
                        <span className="rk-action-icon"><BriefcaseBusiness size={22} /></span>
                        <span className="rk-action-index">01</span>
                        <strong>Browse openings</strong>
                        <p>Explore active listings that have passed the platform review process.</p>
                        <span className="rk-action-link">Find a role <ArrowUpRight size={16} /></span>
                    </Link>
                    <Link href="/my-applications" className="rk-action-card">
                        <span className="rk-action-icon"><Route size={22} /></span>
                        <span className="rk-action-index">02</span>
                        <strong>Track requests</strong>
                        <p>See review, selection, payment, and referral updates in one timeline.</p>
                        <span className="rk-action-link">Open tracker <ArrowUpRight size={16} /></span>
                    </Link>
                    <Link href="/buy-tokens" className="rk-action-card">
                        <span className="rk-action-icon"><Coins size={22} /></span>
                        <span className="rk-action-index">03</span>
                        <strong>Manage tokens</strong>
                        <p>Review the current token packs before you submit another request.</p>
                        <span className="rk-action-link">View token packs <ArrowUpRight size={16} /></span>
                    </Link>
                </section>

                <div className="rk-dashboard-grid">
                    <section className="rk-product-panel">
                        <div className="rk-panel-heading">
                            <div><span className="rk-kicker">Latest movement</span><h2>Application activity</h2></div>
                            {recentActivity.length > 0 && <Link href="/my-applications">View all <ArrowUpRight size={14} /></Link>}
                        </div>
                        {recentActivity.length === 0 ? (
                            <div className="rk-empty-state">
                                <FileText size={28} />
                                <h3>No requests yet</h3>
                                <p>Browse active openings when you are ready to make your first referral request.</p>
                                <Link href="/jobs" className="rk-button rk-button-primary">Browse openings</Link>
                            </div>
                        ) : (
                            <div className="rk-activity-list">
                                {recentActivity.map((item) => {
                                    const status = APPLICATION_STATUS_MAP[item.status] || APPLICATION_STATUS_MAP.expired
                                    return (
                                        <article className="rk-activity-row" key={item.id}>
                                            <span className="rk-activity-mark"><BriefcaseBusiness size={17} /></span>
                                            <div className="rk-activity-copy">
                                                <strong>{item.jobs?.role_title}</strong>
                                                <span>{item.jobs?.company} · {new Date(item.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
