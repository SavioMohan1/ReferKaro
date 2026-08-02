import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, FileText } from 'lucide-react'
import MyApplicationCard from '@/components/applications/my-application-card'

export default async function MyApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'job_seeker') redirect('/dashboard')
    const { data: applications, error } = await supabase.from('applications').select(`*, jobs:job_id(id, role_title, company)`).eq('job_seeker_id', user.id).order('applied_at', { ascending: false })
    if (error) console.error('Error fetching applications:', error)

    return <main className="rk-product-page"><div className="rk-shell rk-queue-page">
        <Link href="/dashboard" className="rk-back-link"><ArrowLeft size={14} /> Workspace</Link>
        <header className="rk-queue-header"><div><span className="rk-kicker">Request tracker</span><h1>Every step,<br />in plain sight.</h1></div><div><p><strong>{applications?.length || 0}</strong> referral request{applications?.length === 1 ? '' : 's'} in your history.</p><Link href="/jobs" className="rk-button rk-button-primary">Browse openings <ArrowUpRight size={15} /></Link></div></header>
        {!applications || applications.length === 0 ? <section className="rk-product-panel rk-empty-state"><FileText size={30} /><h2>No requests submitted</h2><p>When you request a referral, its review and payment state will appear here.</p><Link href="/jobs" className="rk-button rk-button-primary">Browse openings</Link></section> : <div className="rk-tracker-list">{applications.map((application: any) => <MyApplicationCard key={application.id} application={application} />)}</div>}
    </div></main>
}
