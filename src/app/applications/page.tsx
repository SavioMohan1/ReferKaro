import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Inbox } from 'lucide-react'
import ApplicationCard from '@/components/applications/application-card'

export default async function ApplicationsPage() {
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

    if (!profile || profile.role !== 'employee') {
        redirect('/dashboard')
    }

    // Fetch applications for jobs posted by this employee
    const { data: applications, error } = await supabase
        .from('applications')
        .select(`
      *,
      jobs:job_id (
        id,
        role_title,
        company
      ),
      profiles:job_seeker_id (
        id,
        full_name,
        email
      )
    `)
        .eq('employee_id', user.id)
        .order('applied_at', { ascending: false })

    if (error) {
        console.error('Error fetching applications:', error)
    }

    const pendingCount = applications?.filter(app => app.status === 'pending').length || 0

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container max-w-6xl mx-auto px-4">
                <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Applications</h1>
                    <p className="text-gray-600 mt-1">
                        {pendingCount} pending application{pendingCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {!applications || applications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
                        <p className="text-gray-500">Applications will appear here once job seekers apply to your listings</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application: any) => (
                            <ApplicationCard key={application.id} application={application} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
