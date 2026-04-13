import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobSeekerDashboard from '@/components/dashboard/job-seeker-dashboard'
import EmployeeDashboard from '@/components/dashboard/employee-dashboard'
import LegalDisclaimerModal from '@/components/auth/legal-disclaimer-modal'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile, error } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

    if (error || !profile) redirect('/onboarding')

    const showLegalModal = !profile.has_accepted_terms

    // Fetch recent activity depending on role
    let recentActivity: any[] = []

    if (profile.role === 'job_seeker') {
        // Last 5 applications this seeker made
        const { data } = await supabase
            .from('applications')
            .select(`
                id, status, applied_at,
                jobs:job_id(role_title, company)
            `)
            .eq('job_seeker_id', user.id)
            .order('applied_at', { ascending: false })
            .limit(5)
        recentActivity = data || []
    } else {
        // Last 5 applications received by this employee
        const { data } = await supabase
            .from('applications')
            .select(`
                id, status, applied_at,
                jobs:job_id(role_title, company),
                profiles:job_seeker_id(full_name)
            `)
            .eq('employee_id', user.id)
            .order('applied_at', { ascending: false })
            .limit(5)
        recentActivity = data || []
    }

    return (
        <>
            {showLegalModal && <LegalDisclaimerModal />}
            {profile.role === 'job_seeker' ? (
                <JobSeekerDashboard profile={profile} user={user} recentActivity={recentActivity} />
            ) : (
                <EmployeeDashboard profile={profile} user={user} recentActivity={recentActivity} />
            )}
        </>
    )
}
