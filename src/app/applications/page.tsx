import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Inbox } from 'lucide-react'
import ApplicationCard from '@/components/applications/application-card'
import PoolRankingPanel from '@/components/applications/pool-ranking-panel'
import { requireRole } from '@/lib/auth/authorization'

export default async function ApplicationsPage() {
    const auth = await requireRole(['employee', 'admin'])
    if (!auth) redirect('/dashboard')

    const { data: applications, error } = await auth.admin
        .from('applications')
        .select('*, jobs:job_id(id, role_title, company, referral_type, pool_size), profiles:job_seeker_id(id, full_name, email, token_balance), proxy_emails(proxy_address)')
        .eq('employee_id', auth.user.id)
        .order('applied_at', { ascending: false })
    if (error) console.error('Error fetching applications:', error)

    const jobIds = [...new Set((applications || []).map((application) => application.job_id))]
    const { data: runs } = jobIds.length
        ? await auth.admin.from('resume_ranking_runs').select('*, resume_ranking_results(*)').in('job_id', jobIds).eq('status', 'completed').order('run_number', { ascending: false })
        : { data: [] }
    const latestRunByJob = new Map<string, any>()
    for (const run of runs || []) if (!latestRunByJob.has(run.job_id)) latestRunByJob.set(run.job_id, run)

    const pendingCount = applications?.filter((application) => application.status === 'pending').length || 0
    const groupedApplications = Object.values((applications || []).reduce((groups: any, application: any) => {
        if (!groups[application.job_id]) groups[application.job_id] = { job: application.jobs, applications: [] }
        groups[application.job_id].applications.push(application)
        return groups
    }, {})) as any[]

    return <main className="rk-product-page"><div className="rk-shell rk-queue-page">
        <Link href="/dashboard" className="rk-back-link"><ArrowLeft size={14} /> Workspace</Link>
        <header className="rk-queue-header"><div><span className="rk-kicker">Review queue</span><h1>People behind<br />the profiles.</h1></div><p><strong>{pendingCount}</strong> request{pendingCount === 1 ? '' : 's'} waiting for a decision. Review the candidate&apos;s own context before using AI assistance.</p></header>
        {groupedApplications.length === 0 ? <section className="rk-product-panel rk-empty-state"><Inbox size={30} /><h2>No applications yet</h2><p>Candidate requests will appear here after they apply to one of your approved listings.</p></section> : groupedApplications.map((group) => {
            const run = latestRunByJob.get(group.job.id)
            const rankings = new Map((run?.resume_ranking_results || []).map((result: any) => [result.application_id, result]))
            return <section className="rk-queue-group" key={group.job.id}><header><div><span>{group.job.company}</span><h2>{group.job.role_title}</h2></div><small>{group.applications.length} candidate{group.applications.length === 1 ? '' : 's'} · {group.job.referral_type === 'pooling' ? `Pool ${group.applications.length}/${group.job.pool_size || 10}` : 'Single referral'}</small></header>{group.job.referral_type === 'pooling' && <PoolRankingPanel jobId={group.job.id} candidateCount={group.applications.length} poolSize={group.job.pool_size || 10} run={run || null} />}<div>{group.applications.map((application: any) => <ApplicationCard key={application.id} application={application} ranking={rankings.get(application.id) || null} />)}</div></section>
        })}
    </div></main>
}
