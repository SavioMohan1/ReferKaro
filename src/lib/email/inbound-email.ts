import { createClient as createAdminClient } from '@supabase/supabase-js'

export type InboundEmail = {
    to: string
    from?: string
    subject?: string
    text?: string
    html?: string
    providerMessageId?: string
}

export type InboundEmailResult =
    | { status: 'processed'; proxyAddress: string; applicationId: string; forwarded: boolean }
    | { status: 'already_processed'; proxyAddress: string; applicationId: string }
    | { status: 'not_found'; proxyAddress: string }

function createSupabaseAdmin() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
}

function extractEmailAddress(value: string) {
    const match = value.match(/<([^>]+)>/)
    return (match ? match[1] : value).toLowerCase().trim()
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function renderForwardHtml(email: InboundEmail) {
    const from = escapeHtml(email.from || 'Unknown sender')
    const body = email.html ||
        (email.text
            ? escapeHtml(email.text).replace(/\n/g, '<br/>')
            : '<em>You have received a referral from your connected employee. Please check any attached links or instructions.</em>')

    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f3f4f6; padding: 12px; margin-bottom: 20px; border-radius: 6px;">
                <p style="margin: 0; color: #4b5563; font-size: 14px;">
                    <strong>ReferKaro Secured Forward</strong><br/>
                    Original Sender: ${from}
                </p>
            </div>
            <div>${body}</div>
        </div>
    `
}

export async function processInboundProxyEmail(email: InboundEmail): Promise<InboundEmailResult> {
    const proxyAddress = extractEmailAddress(email.to)
    const supabaseAdmin = createSupabaseAdmin()

    const { data: proxyEntry, error: lookupError } = await supabaseAdmin
        .from('proxy_emails')
        .select(`
            *,
            applications (
                id,
                status,
                job_seeker_id,
                job_id
            )
        `)
        .eq('proxy_address', proxyAddress)
        .single()

    if (lookupError || !proxyEntry) {
        return { status: 'not_found', proxyAddress }
    }

    const application = Array.isArray(proxyEntry.applications)
        ? proxyEntry.applications[0]
        : proxyEntry.applications

    if (application?.status === 'referred' || proxyEntry.is_active === false) {
        return {
            status: 'already_processed',
            proxyAddress,
            applicationId: proxyEntry.application_id
        }
    }

    const { error: updateError } = await supabaseAdmin
        .from('applications')
        .update({
            status: 'referred',
            updated_at: new Date().toISOString()
        })
        .eq('id', proxyEntry.application_id)

    if (updateError) {
        throw new Error(`Failed to mark application referred: ${updateError.message}`)
    }

    let forwarded = false
    try {
        const { sendEmail } = await import('@/lib/resend')
        const result = await sendEmail({
            to: proxyEntry.real_email,
            subject: `[ReferKaro Forward] ${email.subject || 'New Message'}`,
            html: renderForwardHtml(email)
        })
        forwarded = Boolean(result)
    } finally {
        await supabaseAdmin
            .from('proxy_emails')
            .update({ is_active: false })
            .eq('id', proxyEntry.id)
    }

    return {
        status: 'processed',
        proxyAddress,
        applicationId: proxyEntry.application_id,
        forwarded
    }
}
