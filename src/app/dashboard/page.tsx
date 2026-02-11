import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JobSeekerDashboard from '@/components/dashboard/job-seeker-dashboard'
import EmployeeDashboard from '@/components/dashboard/employee-dashboard'
import LegalDisclaimerModal from '@/components/auth/legal-disclaimer-modal'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // If no profile exists, redirect to onboarding
    if (error || !profile) {
        redirect('/onboarding')
    }

    // Check if user has accepted terms
    const showLegalModal = !profile.has_accepted_terms

    // Render appropriate dashboard based on role
    return (
        <>
            {showLegalModal && <LegalDisclaimerModal />}
            {profile.role === 'job_seeker' ? (
                <JobSeekerDashboard profile={profile} user={user} />
            ) : (
                <EmployeeDashboard profile={profile} user={user} />
            )}
        </>
    )
}
