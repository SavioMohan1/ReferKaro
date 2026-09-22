import { randomInt } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { sendEmail } from '@/lib/resend'
import { digestWorkEmailOtp, validateWorkEmail } from '@/lib/verification/work-email'

export async function POST(request: Request) {
    const auth = await requireRole(['employee', 'admin'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const validation = validateWorkEmail((await request.json()).email)
    if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 })

    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { count } = await auth.admin
        .from('work_email_verification_challenges')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', auth.user.id)
        .gte('created_at', since)
    if ((count || 0) >= 3) return NextResponse.json({ error: 'Too many codes requested. Try again in 15 minutes.' }, { status: 429 })

    const code = randomInt(100000, 1000000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { data: challenge, error } = await auth.admin.from('work_email_verification_challenges').insert({
        user_id: auth.user.id,
        email: validation.email,
        code_digest: digestWorkEmailOtp(auth.user.id, validation.email, code),
        expires_at: expiresAt,
    }).select('id').single()
    if (error) return NextResponse.json({ error: 'Verification code could not be created' }, { status: 500 })

    const sent = await sendEmail({
        to: validation.email,
        subject: 'Your ReferKaro work email verification code',
        idempotencyKey: `work-email-${challenge.id}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h1 style="font-size:24px">Verify your work email</h1><p>Enter this code in ReferKaro:</p><p style="font-size:34px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, ignore this email.</p></div>`,
    })
    if (!sent) {
        await auth.admin.from('work_email_verification_challenges').delete().eq('id', challenge.id)
        return NextResponse.json({ error: 'Verification email could not be delivered. Try again shortly.' }, { status: 502 })
    }

    return NextResponse.json({ success: true, email: validation.email, expiresAt })
}
