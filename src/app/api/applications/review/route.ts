import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createProxyAddress } from '@/lib/proxy-email'

export async function POST(request: Request) {
    const auth = await requireRole(['employee'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { applicationId, status } = await request.json()
        if (!applicationId || !['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid review request' }, { status: 400 })
        }

        const { data, error } = await auth.supabase.rpc('review_application', {
            p_application_id: applicationId,
            p_action: status,
            p_proxy_address: createProxyAddress(applicationId),
        })
        if (error) return NextResponse.json({ error: error.message }, { status: error.message.includes('forbidden') ? 403 : 400 })

        await auth.admin.from('notifications').insert({
            user_id: data.job_seeker_id,
            application_id: applicationId,
            type: data.status,
            title: data.status === 'accepted' ? 'Referral confirmed' : data.status === 'selected' ? 'You were selected' : 'Application reviewed',
            body: data.status === 'selected'
                ? 'Add 9 tokens within 24 hours to confirm this referral.'
                : data.status === 'accepted'
                    ? `Your secure referral address is ${data.proxy_address}.`
                    : 'The employee did not select this request.',
        })

        return NextResponse.json({ success: true, status: data.status, proxyEmail: data.proxy_address })
    } catch (error) {
        console.error('Application review failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
