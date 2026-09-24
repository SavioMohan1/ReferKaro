import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { validateOptionalUrl } from '@/lib/validation'
import { verifyOfficialJobUrl } from '@/lib/jobs/verify-official-url'
import { normalizeJobRole, parseReferralType, poolSizeForReferralType } from '@/lib/jobs/job-submission'

const allowedJobTypes = new Set(['full_time', 'part_time', 'contract', 'internship'])
const allowedExperience = new Set(['entry', 'mid', 'senior', 'lead'])

export async function POST(request: Request) {
    const auth = await requireRole(['employee', 'admin'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!auth.profile.is_verified) return NextResponse.json({ error: 'Employment verification is required' }, { status: 403 })

    try {
        const body = await request.json()
        const required = ['role_title', 'location', 'description', 'job_url']
        if (required.some((key) => typeof body[key] !== 'string' || !body[key].trim())) {
            return NextResponse.json({ error: 'Complete all required fields, including the official job URL' }, { status: 400 })
        }
        if (!allowedJobTypes.has(body.job_type) || !allowedExperience.has(body.experience_level)) {
            return NextResponse.json({ error: 'Invalid job type or experience level' }, { status: 400 })
        }
        const url = validateOptionalUrl(body.job_url, 'Official job URL')
        if (!url.valid) return NextResponse.json({ error: url.error }, { status: 400 })
        if (!auth.profile.company?.trim()) {
            return NextResponse.json({ error: 'Complete employment verification so the company can be confirmed' }, { status: 400 })
        }
        const roleTitle = normalizeJobRole(body.role_title)
        if (!roleTitle) {
            return NextResponse.json({ error: 'Job role must be between 2 and 120 characters' }, { status: 400 })
        }
        const referralType = parseReferralType(body.referral_type)
        if (!referralType) return NextResponse.json({ error: 'Invalid referral route' }, { status: 400 })

        const urlReview = await verifyOfficialJobUrl(body.job_url.trim(), auth.profile.company, roleTitle)
        const { data, error } = await auth.admin.from('jobs').insert({
            employee_id: auth.user.id,
            company: auth.profile.company.trim(),
            role_title: roleTitle,
            department: body.department?.trim() || null,
            location: body.location.trim(),
            job_type: body.job_type,
            experience_level: body.experience_level,
            description: body.description.trim(),
            requirements: body.requirements?.trim() || null,
            job_url: body.job_url.trim(),
            referral_type: referralType,
            pool_size: poolSizeForReferralType(referralType),
            referral_fee: 500,
            approval_status: 'pending',
            url_verification_status: urlReview.status,
            url_verification_feedback: urlReview.feedback,
            url_verified_at: new Date().toISOString(),
        }).select('id').single()

        if (error) throw error
        return NextResponse.json({ success: true, jobId: data.id, reviewStatus: 'pending', urlReview }, { status: 201 })
    } catch (error) {
        console.error('Job creation failed:', error)
        return NextResponse.json({ error: 'Listing could not be submitted' }, { status: 500 })
    }
}
