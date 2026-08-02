'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, Calendar, Coins, ExternalLink, MapPin, ShieldCheck, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import ApplicationModal from '@/components/jobs/application-modal'

const jobTypeLabels: Record<string, string> = { full_time: 'Full time', part_time: 'Part time', contract: 'Contract', internship: 'Internship' }
const experienceLevelLabels: Record<string, string> = { entry: 'Entry level', mid: 'Mid level', senior: 'Senior', lead: 'Lead' }

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [job, setJob] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [application, setApplication] = useState<any>(null)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        const supabase = createClient()
        const { data: jobData, error: jobError } = await supabase
            .from('jobs').select('*').eq('id', id).eq('is_active', true).eq('approval_status', 'approved').single()
        if (jobError || !jobData) { notFound(); return }
        setJob(jobData)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase.from('profiles').select('token_balance, role').eq('id', user.id).single()
            setUserProfile(profile)
            const { data: appData } = await supabase.from('applications').select('id, status').eq('job_id', id).eq('job_seeker_id', user.id).single()
            setApplication(appData)
        }
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [id])

    if (loading || !job) {
        return <main className="rk-product-page"><div className="rk-shell rk-role-loading"><span /><span /><span /></div></main>
    }

    const renderApplyAction = () => {
        if (application) {
            return <Link href="/my-applications" className="rk-button rk-button-secondary">{application.status === 'payment_pending' ? 'Track payment status' : 'Track submitted request'} <ArrowUpRight size={16} /></Link>
        }
        if (!userProfile) return <Link href="/login" className="rk-button rk-button-primary">Sign in to request a referral <ArrowUpRight size={16} /></Link>
        if (userProfile.role !== 'job_seeker') return <button disabled className="rk-button rk-button-secondary">Only job seekers can apply</button>
        if (userProfile.token_balance < 1) return <Link href="/buy-tokens" className="rk-button rk-button-primary"><Coins size={16} /> Get tokens to apply</Link>
        return <button type="button" onClick={() => setShowModal(true)} className="rk-button rk-button-primary">Request referral · 1 token <ArrowUpRight size={16} /></button>
    }

    const metadata = [
        { icon: <MapPin size={14} />, label: job.location },
        { icon: <BriefcaseBusiness size={14} />, label: jobTypeLabels[job.job_type] || job.job_type },
        { icon: <TrendingUp size={14} />, label: experienceLevelLabels[job.experience_level] || job.experience_level },
        { icon: <Calendar size={14} />, label: new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
    ]

    return (
        <main className="rk-product-page">
            <div className="rk-shell rk-role-layout">
                <Link href="/jobs" className="rk-back-link"><ArrowLeft size={14} /> All openings</Link>
                <header className="rk-role-header rk-rise">
                    <div className="rk-company-monogram">{job.company.slice(0, 2).toUpperCase()}</div>
                    <span className="rk-kicker">{job.company}</span>
                    <h1>{job.role_title}</h1>
                    <div className="rk-role-meta">{metadata.map((item) => <span key={item.label}>{item.icon}{item.label}</span>)}</div>
                </header>

                <div className="rk-role-content">
                    <article className="rk-role-brief">
                        {job.job_url && <a className="rk-official-link" href={job.job_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={17} /><span><strong>Official job posting</strong><small>Open the employer&apos;s original listing</small></span><ArrowUpRight size={17} /></a>}
                        <section><span className="rk-kicker">The role</span><h2>What you would be joining to do.</h2><p>{job.description}</p></section>
                        {job.requirements && <section><span className="rk-kicker">What they need</span><h2>Experience and capabilities.</h2><p>{job.requirements}</p></section>}
                    </article>

                    <aside className="rk-role-action-panel">
                        <div className="rk-verification-note"><ShieldCheck size={21} /><div><strong>Reviewed listing</strong><span>An admin reviewed the submitted role and official job link before publication.</span></div></div>
                        {userProfile?.role === 'job_seeker' && <div className="rk-token-note"><Coins size={18} /><span>Your balance</span><strong>{userProfile.token_balance} token{userProfile.token_balance !== 1 ? 's' : ''}</strong></div>}
                        <div className="rk-role-action-copy"><span className="rk-kicker">Ready?</span><h2>Ask for a considered introduction.</h2><p>Your profile and message go to the referring employee for review. A request is not a guarantee of referral or interview.</p></div>
                        {renderApplyAction()}
                    </aside>
                </div>
            </div>
            {showModal && <ApplicationModal jobId={job.id} jobTitle={job.role_title} onClose={() => setShowModal(false)} onSuccess={fetchData} />}
        </main>
    )
}
