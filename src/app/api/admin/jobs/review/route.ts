import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Verify requester is admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { jobId, action, feedback } = await request.json()
        if (!jobId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        if (!['approved', 'rejected'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Fetch job to validate it has a job_url before approving
        const { data: job } = await supabaseAdmin.from('jobs').select('job_url, employee_id').eq('id', jobId).single()
        if (action === 'approved' && !job?.job_url) {
            return NextResponse.json({ error: 'Cannot approve a job without a valid job_url.' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('jobs')
            .update({
                approval_status: action,
                admin_feedback: feedback || null,
                approved_at: action === 'approved' ? new Date().toISOString() : null,
            })
            .eq('id', jobId)

        if (error) throw error

        // Notify the employee about the decision
        if (job?.employee_id) {
            await supabaseAdmin.from('notifications').insert({
                user_id: job.employee_id,
                type: action === 'approved' ? 'job_approved' : 'job_rejected',
                title: action === 'approved' ? '✅ Your job posting has been approved!' : '❌ Your job posting was rejected',
                body: action === 'approved'
                    ? 'Your referral listing is now live and visible to job seekers.'
                    : `Your listing was not approved. Admin feedback: ${feedback || 'No feedback provided.'}`,
            })
        }

        return NextResponse.json({ success: true, action })
    } catch (error: any) {
        console.error('Admin review error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
