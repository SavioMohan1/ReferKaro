import { NextResponse } from 'next/server'
import { processInboundProxyEmail } from '@/lib/email/inbound-email'

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization')
        const webhookSecret = process.env.WEBHOOK_INBOUND_SECRET

        if (!webhookSecret) {
            console.error('WEBHOOK_INBOUND_SECRET is not configured')
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
        }

        if (authHeader !== `Bearer ${webhookSecret}`) {
            console.warn('Unauthorized inbound email webhook attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { to, from, subject, text, html, id } = body

        if (!to) {
            return NextResponse.json({ error: 'Missing "to" field' }, { status: 400 })
        }

        const result = await processInboundProxyEmail({
            to,
            from,
            subject,
            text,
            html,
            providerMessageId: id
        })

        if (result.status === 'not_found') {
            return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            status: result.status,
            message: result.status === 'processed'
                ? 'Email processed and forwarded'
                : 'Email already processed'
        })
    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
