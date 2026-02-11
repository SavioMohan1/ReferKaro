import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import MyApplicationCard from '@/components/applications/my-application-card'

export default async function MyApplicationsPage() {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'job_seeker') {
        redirect('/dashboard')
    }

    // Fetch applications submitted by this job seeker
    const { data: applications, error } = await supabase
        .from('applications')
        .select(`
      *,
      jobs:job_id (
        id,
        role_title,
        company
      )
    `)
        .eq('job_seeker_id', user.id)
        .order('applied_at', { ascending: false })

    if (error) {
        console.error('Error fetching applications:', error)
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <Link href="/jobs">
                        <Button>Browse More Jobs</Button>
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Applications</h1>
                    <p className="text-gray-600 mt-1">
                        Track the status of your referral requests
                    </p>
                </div>

                {!applications || applications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-16 text-center">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
                        <p className="text-gray-500 mb-6">You haven't applied to any jobs yet. Start looking for opportunities!</p>
                        <Link href="/jobs">
                            <Button size="lg">Explore Jobs</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map((application: any) => (
                            <MyApplicationCard key={application.id} application={application} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
