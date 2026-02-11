import { createClient } from '@/lib/supabase/server'
import JobCard from '@/components/jobs/job-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'

export default async function JobsPage() {
    const supabase = await createClient()

    // Fetch all active jobs
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching jobs:', error)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Browse Referrals</h1>
                            <p className="text-gray-600 mt-1">
                                {jobs?.length || 0} opportunities available
                            </p>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="container mx-auto px-4 py-8">
                {!jobs || jobs.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs available yet</h3>
                        <p className="text-gray-500">Check back soon for new referral opportunities!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job: any) => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
