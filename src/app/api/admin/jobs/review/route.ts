import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'

export async function GET() {
    const auth = await requireRole(['admin'])
    if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [{ data: jobs, error: jobsError }, { data: profiles, error: profilesError }] = await Promise.all([
        auth.admin.from('jobs').select('*, employee:profiles!employee_id(full_name, email)').order('created_at', { ascending: false }),
        auth.admin.from('profiles').select('id, full_name, email, company, verification_status, verification_score, verification_feedback, verification_document_url').eq('role', 'employee').eq('verification_status', 'pending').order('updated_at', { ascending: true }),
    ])
    if (jobsError || profilesError) return NextResponse.json({ error: 'Admin queue could not be loaded' }, { status: 500 })

    const verificationReviews = await Promise.all((profiles || []).map(async (profile) => {
        if (!profile.verification_document_url) return { ...profile, documentUrl: null }
        const { data } = await auth.admin.storage.from('verification-documents').createSignedUrl(profile.verification_document_url, 300)
        return { ...profile, documentUrl: data?.signedUrl || null }
    }))

    return NextResponse.json({ jobs: jobs || [], verificationReviews })
}

export async function POST(request: Request) {
    const auth = await requireRole(['admin'])
    if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    try {
        const { resourceType = 'job', resourceId, jobId, action, feedback } = await request.json()
        const id = resourceId || jobId
        if (!id || !['approved', 'rejected'].includes(action)) return NextResponse.json({ error: 'Invalid review request' }, { status: 400 })

        if (resourceType === 'employment') {
            const { error } = await auth.admin.from('profiles').update({
                verification_status: action === 'approved' ? 'verified' : 'rejected',
                is_verified: action === 'approved',
                verification_feedback: feedback?.trim() || null,
            }).eq('id', id).eq('role', 'employee')
            if (error) throw error
        } else {
            const { data: job } = await auth.admin.from('jobs').select('job_url, employee_id').eq('id', id).single()
            if (action === 'approved' && !job?.job_url) return NextResponse.json({ error: 'A verified official job URL is required' }, { status: 400 })
            const { error } = await auth.admin.from('jobs').update({
                approval_status: action,
                admin_feedback: feedback?.trim() || null,
                approved_at: action === 'approved' ? new Date().toISOString() : null,
            }).eq('id', id)
            if (error) throw error
            if (job?.employee_id) await auth.admin.from('notifications').insert({
                user_id: job.employee_id,
                type: action === 'approved' ? 'job_approved' : 'job_rejected',
                title: action === 'approved' ? 'Your listing was approved' : 'Your listing needs changes',
                body: action === 'approved' ? 'Your referral listing is now visible to job seekers.' : feedback?.trim() || 'The listing was not approved.',
            })
        }

        await auth.admin.from('admin_audit_logs').insert({
            admin_user_id: auth.user.id,
            action,
            resource_type: resourceType,
            resource_id: id,
            metadata: { feedback: feedback?.trim() || null },
        })
        return NextResponse.json({ success: true, action })
    } catch (error) {
        console.error('Admin review failed:', error)
        return NextResponse.json({ error: 'Review action failed' }, { status: 500 })
    }
}
