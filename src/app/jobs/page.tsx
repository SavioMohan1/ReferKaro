import { createClient } from '@/lib/supabase/server'
import JobCard from '@/components/jobs/job-card'
import Link from 'next/link'
import { Briefcase, ArrowLeft } from 'lucide-react'

export default async function JobsPage() {
    const supabase = await createClient()
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) console.error('Error fetching jobs:', error)

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80, position:'relative', overflow:'hidden' }}>
            <div className="glow-orb glow-cyan"   style={{ width:350, height:350, top:-60, right:-60, opacity:0.35 }} />
            <div className="glow-orb glow-violet"  style={{ width:300, height:300, bottom:0, left:-60, opacity:0.28 }} />

            <div className="page-container" style={{ position:'relative', zIndex:1 }}>
                {/* Header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:40 }}>
                    <div>
                        <span className="dk-chip" style={{ marginBottom:12, display:'inline-block' }}>Opportunities</span>
                        <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.6rem,3vw,2.4rem)', color:'#E8EDF5', marginBottom:6 }}>
                            Browse Referrals
                        </h1>
                        <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>
                            {jobs?.length || 0} active {jobs?.length === 1 ? 'opportunity' : 'opportunities'} available
                        </p>
                    </div>
                    <Link href="/dashboard" className="dk-btn-outline" style={{ alignSelf:'flex-start' }}>
                        <ArrowLeft size={15} /> Dashboard
                    </Link>
                </div>

                {/* Jobs Grid */}
                {!jobs || jobs.length === 0 ? (
                    <div className="dk-card" style={{ padding:'80px 32px', textAlign:'center' }}>
                        <Briefcase size={48} color="#6B7A99" strokeWidth={1.5} style={{ margin:'0 auto 16px' }} />
                        <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1.2rem', color:'#E8EDF5', marginBottom:8 }}>
                            No Jobs Available Yet
                        </h3>
                        <p style={{ color:'#6B7A99', fontSize:'0.9rem' }}>
                            Check back soon for new referral opportunities!
                        </p>
                    </div>
                ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24 }}>
                        {jobs.map((job: any) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
