import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/authorization'
import { createAdminClient } from '@/lib/supabase/admin'
import { CURRENT_LEGAL_POLICY_VERSION } from '@/lib/legal'

export async function POST(request: Request) {
    const session = await requireUser()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { termsAccepted, privacyNoticeAcknowledged } = await request.json()
    if (termsAccepted !== true || privacyNoticeAcknowledged !== true) {
        return NextResponse.json({ error: 'Both acknowledgements are required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const acceptedAt = new Date().toISOString()
    const { error: consentError } = await admin.from('legal_consents').upsert({
        user_id: session.user.id,
        policy_version: CURRENT_LEGAL_POLICY_VERSION,
        terms_accepted: true,
        privacy_notice_acknowledged: true,
        accepted_at: acceptedAt,
    }, { onConflict: 'user_id,policy_version' })
    if (consentError) return NextResponse.json({ error: 'Consent record could not be saved' }, { status: 500 })

    const { error: profileError } = await admin.from('profiles').update({
        has_accepted_terms: true,
        terms_accepted_at: acceptedAt,
        privacy_accepted_at: acceptedAt,
        legal_policy_version: CURRENT_LEGAL_POLICY_VERSION,
    }).eq('id', session.user.id)
    if (profileError) return NextResponse.json({ error: 'Profile consent state could not be saved' }, { status: 500 })

    return NextResponse.json({ success: true, policyVersion: CURRENT_LEGAL_POLICY_VERSION })
}
