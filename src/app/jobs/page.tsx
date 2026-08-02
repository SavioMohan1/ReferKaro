import { createClient } from '@/lib/supabase/server'
import JobCard from '@/components/jobs/job-card'
import Link from 'next/link'
import { ArrowLeft, BriefcaseBusiness, ShieldCheck } from 'lucide-react'

export default async function JobsPage() {
    const supabase = await createClient()
    const { data: jobs, error } = await supabase
        .from('jobs').select('*').eq('is_active', true).eq('approval_status', 'approved')
        .order('created_at', { ascending: false })

    if (error) console.error('Error fetching jobs:', error)

    return (
        <main className="rk-product-page rk-jobs-page">
            <div className="rk-shell rk-product-shell">
                <header className="rk-listing-header rk-rise">
                    <div>
                        <span className="rk-kicker">Reviewed opportunities</span>
                        <h1>Open roles,<br />with a human route in.</h1>
                    </div>
                    <div className="rk-listing-intro">
                        <ShieldCheck size={22} />
                        <p>Every role shown here is active and has passed ReferKaro&apos;s listing review.</p>
                        <strong>{jobs?.length || 0} active {jobs?.length === 1 ? 'opening' : 'openings'}</strong>
                        <Link href="/dashboard"><ArrowLeft size={14} /> Return to workspace</Link>
                    </div>
                </header>

                {!jobs || jobs.length === 0 ? (
                    <section className="rk-product-panel rk-empty-state">
                        <BriefcaseBusiness size={30} />
                        <h2>No reviewed openings right now</h2>
                        <p>New roles will appear here after an employee submits a listing and it passes review.</p>
                    </section>
                ) : (
                    <section className="rk-jobs-grid" aria-label="Available referral openings">
                        {jobs.map((job: any, index: number) => <JobCard key={job.id} job={job} index={index + 1} />)}
                    </section>
                )}
            </div>
        </main>
    )
}
