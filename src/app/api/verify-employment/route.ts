import { NextResponse } from 'next/server'
import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { requireRole } from '@/lib/auth/authorization'
import { passesAutomaticEmploymentVerification } from '@/lib/verification/employment-analysis'
import { analyzeEmploymentEvidence } from '@/lib/ai/employment-verification'

export async function POST(request: Request) {
    try {
        const auth = await requireRole(['employee', 'admin'])
        if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await request.formData()
        const file = formData.get('file') as File
        const formFullName = formData.get('fullName') as string
        const formCompany = formData.get('company') as string
        const formRole = formData.get('role') as string

        if (!file || !formFullName || !formCompany || !formRole) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
        if (!allowedMimeTypes.has(file.type) || file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Upload a PDF, JPG, PNG, or WebP file up to 5MB' }, { status: 400 })
        }

        // Rate limit: 3 requests per 300 seconds (expensive AI call)
        const rateLimitResult = rateLimit(
            getRequestIdentifier(request, auth.user.id),
            { limit: 3, windowSeconds: 300 }
        )
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(rateLimitResult.resetIn) } }
            )
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
        const filePath = `${auth.user.id}/${crypto.randomUUID()}.${fileExt}`
        const supabaseAdmin = auth.admin

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('work_email, work_email_verified_at')
            .eq('id', auth.user.id)
            .single()
        if (!profile?.work_email || !profile.work_email_verified_at) {
            return NextResponse.json({ error: 'Verify your work email before submitting employment evidence' }, { status: 400 })
        }

        const { error: uploadError } = await supabaseAdmin.storage
            .from('verification-documents')
            .upload(filePath, file)

        if (uploadError) return NextResponse.json({ error: 'Verification evidence could not be stored' }, { status: 500 })

        const analysis = await analyzeEmploymentEvidence({
            file,
            fullName: formFullName,
            company: formCompany,
            role: formRole,
        })

        const confidenceScore = analysis.confidenceScore
        const aiVerified = passesAutomaticEmploymentVerification(analysis)
        const reasoning = analysis.reasoning
        const status = aiVerified ? 'ai_verified' : 'rejected'

        console.log(`Verification Logic: Score ${confidenceScore}, AI Valid: ${analysis.isVerified} -> Status: ${status}`)

        if (status === 'ai_verified') {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    is_verified: true,
                    verification_status: 'pending',
                    ai_verification_status: 'verified',
                    admin_verification_status: 'pending',
                    verification_score: confidenceScore,
                    verification_feedback: reasoning,
                    full_name: formFullName,
                    company: formCompany,
                    designation: formRole,
                    verification_document_url: filePath
                })
                .eq('id', auth.user.id)
            if (updateError) return NextResponse.json({ error: 'Verification result could not be saved' }, { status: 500 })
        } else {
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    is_verified: false,
                    verification_status: 'pending',
                    ai_verification_status: 'rejected',
                    admin_verification_status: 'pending',
                    verification_score: confidenceScore,
                    verification_feedback: reasoning,
                    full_name: formFullName,
                    company: formCompany,
                    designation: formRole,
                    verification_document_url: filePath
                })
                .eq('id', auth.user.id)
            if (updateError) return NextResponse.json({ error: 'Verification result could not be saved' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            status,
            message: status === 'ai_verified'
                ? 'AI verification passed. Admin review remains pending.'
                : 'The evidence could not be verified automatically.',
            feedback: reasoning,
            score: confidenceScore
        })

    } catch (error: any) {
        console.error('Verification Error:', error)
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
    }
}
