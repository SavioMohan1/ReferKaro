import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, FileText, ArrowRight } from 'lucide-react'
import MyApplicationCard from '@/components/applications/my-application-card'

export default async function MyApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'job_seeker') redirect('/dashboard')

    const { data: applications, error } = await supabase
        .from('applications')
        .select(`*, jobs:job_id(id, role_title, company)`)
        .eq('job_seeker_id', user.id)
        .order('applied_at', { ascending: false })

    if (error) console.error('Error fetching applications:', error)

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80 }}>
            <div className="page-container">
                {/* Top nav */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:40 }}>
                    <Link href="/dashboard" className="dk-btn-ghost" style={{ fontSize:'0.875rem' }}>
                        <ArrowLeft size={15} /> Back to Dashboard
                    </Link>
                    <Link href="/jobs" className="dk-btn-primary">
                        Browse More Jobs <ArrowRight size={15} />
                    </Link>
                </div>

                {/* Header */}
                <div style={{ marginBottom:40 }}>
                    <span className="dk-chip" style={{ marginBottom:12, display:'inline-block' }}>Tracker</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.6rem,3vw,2.2rem)', color:'#E8EDF5', marginBottom:6 }}>
                        My Applications
                    </h1>
                    <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>
                        {applications?.length || 0} referral request{applications?.length !== 1 ? 's' : ''} tracked
                    </p>
                </div>

                {/* Content */}
                {!applications || applications.length === 0 ? (
                    <div className="dk-card" style={{ padding:'80px 32px', textAlign:'center' }}>
                        <FileText size={48} color="#6B7A99" strokeWidth={1.5} style={{ margin:'0 auto 16px' }} />
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1.2rem', color:'#E8EDF5', marginBottom:8 }}>
                            No applications yet
                        </h3>
                        <p style={{ color:'#6B7A99', fontSize:'0.9rem', marginBottom:28 }}>
                            You haven't applied to any jobs yet. Start exploring opportunities!
                        </p>
                        <Link href="/jobs" className="dk-btn-primary">
                            Explore Jobs →
                        </Link>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                        {applications.map((application: any) => (
                            <MyApplicationCard key={application.id} application={application} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
