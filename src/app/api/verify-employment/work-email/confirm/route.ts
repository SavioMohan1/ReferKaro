import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { digestWorkEmailOtp, normalizeWorkEmail, otpDigestsMatch } from '@/lib/verification/work-email'

export async function POST(request: Request) {
    const auth = await requireRole(['employee', 'admin'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const email = normalizeWorkEmail(body.email)
    const code = typeof body.code === 'string' ? body.code.trim() : ''
    if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ error: 'Enter the six-digit code' }, { status: 400 })

    const { data: challenge } = await auth.admin
        .from('work_email_verification_challenges')
        .select('id, code_digest, attempts, expires_at')
        .eq('user_id', auth.user.id)
        .eq('email', email)
        .is('consumed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!challenge || new Date(challenge.expires_at).getTime() <= Date.now()) {
        return NextResponse.json({ error: 'This code has expired. Request a new one.' }, { status: 400 })
    }
    if (challenge.attempts >= 5) return NextResponse.json({ error: 'Too many incorrect attempts. Request a new code.' }, { status: 429 })

    const digest = digestWorkEmailOtp(auth.user.id, email, code)
    if (!otpDigestsMatch(challenge.code_digest, digest)) {
        await auth.admin.from('work_email_verification_challenges').update({ attempts: challenge.attempts + 1 }).eq('id', challenge.id)
        return NextResponse.json({ error: 'The code is incorrect' }, { status: 400 })
    }

    const verifiedAt = new Date().toISOString()
    const { data: consumed, error: challengeError } = await auth.admin
        .from('work_email_verification_challenges')
        .update({ consumed_at: verifiedAt })
        .eq('id', challenge.id)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle()
    if (challengeError || !consumed) return NextResponse.json({ error: 'This code has already been used' }, { status: 409 })
    const { error: profileError } = await auth.admin.from('profiles').update({ work_email: email, work_email_verified_at: verifiedAt }).eq('id', auth.user.id)
    if (profileError) return NextResponse.json({ error: 'Work email could not be confirmed' }, { status: 500 })

    return NextResponse.json({ success: true, email, verifiedAt })
}
