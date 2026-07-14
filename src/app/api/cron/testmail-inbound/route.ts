import { NextResponse } from 'next/server'
import { processInboundProxyEmail } from '@/lib/email/inbound-email'
import { fetchTestmailInbox } from '@/lib/testmail/client'

export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')

    if (!cronSecret) {
        return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const inbox = await fetchTestmailInbox()
        const results = []

        for (const email of inbox.emails || []) {
            const to = email.envelope_to || email.to
            if (!to) {
                results.push({ status: 'skipped', reason: 'missing_recipient', id: email.id || email.oid || null })
                continue
            }

            const result = await processInboundProxyEmail({
                to,
                from: email.envelope_from || email.from,
                subject: email.subject,
                text: email.text,
                html: email.html,
                providerMessageId: email.id || email.oid
            })

            results.push({
                status: result.status,
                id: email.id || email.oid || null
            })
        }

        return NextResponse.json({
            success: true,
            fetched: inbox.count || inbox.emails?.length || 0,
            processed: results.filter((result) => result.status === 'processed').length,
            alreadyProcessed: results.filter((result) => result.status === 'already_processed').length,
            notFound: results.filter((result) => result.status === 'not_found').length,
            skipped: results.filter((result) => result.status === 'skipped').length
        })
    } catch (error) {
        console.error('Testmail inbound cron failed:', error)
        return NextResponse.json({ error: 'Testmail inbound cron failed' }, { status: 500 })
    }
}
