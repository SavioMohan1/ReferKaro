import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { createProxyAddress } from '@/lib/proxy-email'

export async function POST(request: Request) {
    const auth = await requireRole(['job_seeker'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { applicationId } = await request.json()
        if (!applicationId) return NextResponse.json({ error: 'Missing application ID' }, { status: 400 })

        const { data, error } = await auth.supabase.rpc('complete_selected_application', {
            p_application_id: applicationId,
            p_proxy_address: createProxyAddress(applicationId),
        })
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        await auth.admin.from('notifications').insert({
            user_id: auth.user.id,
            application_id: applicationId,
            type: 'accepted',
            title: 'Referral confirmed',
            body: `Your 9 tokens were processed. Your secure referral address is ${data.proxy_address}.`,
        })

        return NextResponse.json({ success: true, proxyEmail: data.proxy_address })
    } catch (error) {
        console.error('Referral completion failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
