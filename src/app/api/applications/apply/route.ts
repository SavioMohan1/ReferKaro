import { after, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { validateCoverLetter, validateOptionalUrl } from '@/lib/validation'

export async function POST(request: Request) {
    const auth = await requireRole(['job_seeker'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = rateLimit(getRequestIdentifier(request, auth.user.id), { limit: 10, windowSeconds: 60 })
    if (!limited.success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, {
            status: 429,
            headers: { 'Retry-After': String(limited.resetIn) },
        })
    }

    try {
        const body = await request.json()
        const cover = validateCoverLetter(body.cover_letter)
        const linkedin = validateOptionalUrl(body.linkedin_url, 'LinkedIn URL')
        const portfolio = validateOptionalUrl(body.portfolio_url, 'Portfolio URL')
        if (!body.job_id || !cover.valid || !linkedin.valid || !portfolio.valid) {
            return NextResponse.json({ error: cover.error || linkedin.error || portfolio.error || 'Missing job ID' }, { status: 400 })
        }

        const { data, error } = await auth.supabase.rpc('submit_application', {
            p_job_id: body.job_id,
            p_cover_letter: body.cover_letter,
            p_linkedin_url: body.linkedin_url || null,
            p_portfolio_url: body.portfolio_url || null,
            p_resume_url: body.resume_url || null,
        })

        if (error) {
            const known = ['already_applied', 'pool_full', 'job_unavailable', 'insufficient_tokens', 'invalid_resume_path']
            const message = known.find((item) => error.message.includes(item))
            return NextResponse.json({ error: message ? message.replaceAll('_', ' ') : 'Application could not be submitted' }, { status: message ? 400 : 500 })
        }

        after(async () => {
            const { sendEmail } = await import('@/lib/resend')
            const { data: employee } = await auth.admin.from('profiles').select('email, full_name').eq('id', data.employee_id).single()
            if (employee?.email) {
                await sendEmail({
                    to: employee.email,
                    subject: 'New referral request',
                    html: `<p>Hi ${employee.full_name || 'there'},</p><p>A candidate submitted a referral request. Review it from your ReferKaro workspace.</p>`,
                })
            }

            if (data.pool_filled) {
                const { rankResumePool } = await import('@/lib/ai/resume-ranking')
                await rankResumePool({ jobId: body.job_id, requestedBy: data.employee_id, triggerKind: 'automatic' })
            }
        })

        return NextResponse.json({ success: true, applicationId: data.application_id, poolFilled: data.pool_filled })
    } catch (error) {
        console.error('Application submission failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
