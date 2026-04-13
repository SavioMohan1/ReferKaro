import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Inbox } from 'lucide-react'
import ApplicationCard from '@/components/applications/application-card'

export default async function ApplicationsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'employee') redirect('/dashboard')

    const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *, jobs:job_id(id, role_title, company, referral_type, pool_size),
          profiles:job_seeker_id(id, full_name, email, token_balance),
          proxy_emails(proxy_address)
        `)
        .eq('employee_id', user.id)
        .order('applied_at', { ascending: false })

    if (error) console.error('Error fetching applications:', error)

    const pendingCount = applications?.filter((a: any) => a.status === 'pending').length || 0

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80 }}>
            <div className="page-container" style={{ maxWidth:1100 }}>
                {/* Top nav */}
                <Link href="/dashboard" className="dk-btn-ghost" style={{ marginBottom:32, display:'inline-flex' }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                {/* Header */}
                <div style={{ marginBottom:40 }}>
                    <span className="dk-chip" style={{ marginBottom:12, display:'inline-block' }}>Review Panel</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.6rem,3vw,2.4rem)', color:'#E8EDF5', marginBottom:6 }}>
                        Applications
                    </h1>
                    <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>
                        {pendingCount} pending review{pendingCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {!applications || applications.length === 0 ? (
                    <div className="dk-card" style={{ padding:'72px 32px', textAlign:'center' }}>
                        <Inbox size={48} color="#6B7A99" strokeWidth={1.5} style={{ margin:'0 auto 16px' }} />
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1.2rem', color:'#E8EDF5', marginBottom:8 }}>
                            No Applications Yet
                        </h3>
                        <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>
                            Applications will appear here once job seekers apply to your listings.
                        </p>
                    </div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
                        {/* Group by job */}
                        {(Object.values(
                            applications.reduce((acc: any, app: any) => {
                                const jobId = app.job_id
                                if (!acc[jobId]) acc[jobId] = { job: app.jobs, apps: [] }
                                acc[jobId].apps.push(app)
                                return acc
                            }, {})
                        ) as any[]).map((group: any) => (
                            <div key={group.job.id}>
                                {/* Job group header */}
                                <div style={{
                                    display:'flex', alignItems:'center', justifyContent:'space-between',
                                    flexWrap:'wrap', gap:12,
                                    paddingBottom:16, marginBottom:20,
                                    borderBottom:'1px solid rgba(0,240,255,0.09)',
                                }}>
                                    <div>
                                        <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', color:'#E8EDF5', marginBottom:2 }}>
                                            {group.job.role_title}
                                        </h2>
                                        <p style={{ fontSize:'0.85rem', color:'#6B7A99' }}>{group.job.company}</p>
                                    </div>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                        <span style={{
                                            fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
                                            padding:'4px 12px', borderRadius:999,
                                            background: group.job.referral_type === 'pooling' ? 'rgba(0,240,255,0.08)' : 'rgba(123,94,255,0.08)',
                                            color:        group.job.referral_type === 'pooling' ? '#00F0FF' : '#7B5EFF',
                                            border:       group.job.referral_type === 'pooling' ? '1px solid rgba(0,240,255,0.2)' : '1px solid rgba(123,94,255,0.2)',
                                        }}>
                                            {group.job.referral_type === 'pooling' ? '🌊 Pooling' : '💎 Premium'}
                                        </span>
                                        {group.job.referral_type === 'pooling' && (
                                            <span style={{
                                                fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:999,
                                                background:'rgba(255,255,255,0.05)',
                                                color: group.apps.length >= (group.job.pool_size || 10) ? '#22C55E' : '#E8EDF5',
                                                border:'1px solid rgba(255,255,255,0.08)',
                                            }}>
                                                {group.apps.length}/{group.job.pool_size || 10} in pool
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                                    {group.apps.map((application: any) => (
                                        <ApplicationCard key={application.id} application={application} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
