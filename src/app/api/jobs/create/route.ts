import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { validateOptionalUrl } from '@/lib/validation'

const allowedJobTypes = new Set(['full_time', 'part_time', 'contract', 'internship'])
const allowedExperience = new Set(['entry', 'mid', 'senior', 'lead'])

export async function POST(request: Request) {
    const auth = await requireRole(['employee'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!auth.profile.is_verified) return NextResponse.json({ error: 'Employment verification is required' }, { status: 403 })

    try {
        const body = await request.json()
        const required = ['company', 'role_title', 'location', 'description', 'job_url']
        if (required.some((key) => typeof body[key] !== 'string' || !body[key].trim())) {
            return NextResponse.json({ error: 'Complete all required fields, including the official job URL' }, { status: 400 })
        }
        if (!allowedJobTypes.has(body.job_type) || !allowedExperience.has(body.experience_level)) {
            return NextResponse.json({ error: 'Invalid job type or experience level' }, { status: 400 })
        }
        const url = validateOptionalUrl(body.job_url, 'Official job URL')
        if (!url.valid) return NextResponse.json({ error: url.error }, { status: 400 })
        if (body.referral_type === 'pooling' && (!Number.isInteger(body.pool_size) || body.pool_size < 2 || body.pool_size > 10)) {
            return NextResponse.json({ error: 'Pool size must be between 2 and 10' }, { status: 400 })
        }

        const { data, error } = await auth.admin.from('jobs').insert({
            employee_id: auth.user.id,
            company: body.company.trim(),
            role_title: body.role_title.trim(),
            department: body.department?.trim() || null,
            location: body.location.trim(),
            job_type: body.job_type,
            experience_level: body.experience_level,
            description: body.description.trim(),
            requirements: body.requirements?.trim() || null,
            job_url: body.job_url.trim(),
            referral_type: body.referral_type === 'pooling' ? 'pooling' : 'single',
            pool_size: body.referral_type === 'pooling' ? body.pool_size : null,
            referral_fee: 500,
            approval_status: 'pending',
        }).select('id').single()

        if (error) throw error
        return NextResponse.json({ success: true, jobId: data.id }, { status: 201 })
    } catch (error) {
        console.error('Job creation failed:', error)
        return NextResponse.json({ error: 'Listing could not be submitted' }, { status: 500 })
    }
}
