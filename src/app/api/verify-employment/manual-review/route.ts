import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'

export async function POST() {
    const auth = await requireRole(['employee', 'admin'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await auth.admin
        .from('profiles')
        .select('work_email_verified_at, verification_document_url')
        .eq('id', auth.user.id)
        .single()
    if (!profile?.work_email_verified_at) return NextResponse.json({ error: 'Verify your work email first' }, { status: 400 })
    if (!profile.verification_document_url) return NextResponse.json({ error: 'Submit employment evidence before requesting review' }, { status: 400 })

    const { error } = await auth.admin.from('profiles').update({
        ai_verification_status: 'manual_review',
        admin_verification_status: 'pending',
        verification_status: 'pending',
        manual_review_requested_at: new Date().toISOString(),
    }).eq('id', auth.user.id)
    if (error) return NextResponse.json({ error: 'Manual review could not be requested' }, { status: 500 })
    return NextResponse.json({ success: true, status: 'manual_review', message: 'Manual review requested' })
}
