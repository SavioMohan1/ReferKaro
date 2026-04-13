import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Admin client bypasses RLS — used only for privileged writes after auth verification
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
    try {
        const { applicationId } = await request.json()
        if (!applicationId) return NextResponse.json({ error: 'Missing app ID' }, { status: 400 })

        // 1. Authenticate user via standard session/token
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 2. Fetch application — verify it belongs to this seeker and is in 'selected' state
        const { data: app, error: appError } = await supabaseAdmin
            .from('applications')
            .select('*, profiles:job_seeker_id(email, token_balance)')
            .eq('id', applicationId)
            .eq('job_seeker_id', user.id)
            .single()

        if (appError || !app) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }
        if (app.status !== 'selected') {
            return NextResponse.json({ error: `Status is not 'selected' (current: ${app.status})` }, { status: 400 })
        }

        // 3. Verify seeker has enough tokens (fetched fresh, not from join cache)
        const { data: freshProfile, error: profErr } = await supabaseAdmin
            .from('profiles')
            .select('token_balance')
            .eq('id', user.id)
            .single()

        if (profErr || !freshProfile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const balance = freshProfile.token_balance || 0
        if (balance < 9) {
            return NextResponse.json({ error: `Insufficient tokens. You have ${balance}, need 9.` }, { status: 400 })
        }

        // 4. Deduct 9 tokens
        const { error: balError } = await supabaseAdmin
            .from('profiles')
            .update({ token_balance: balance - 9 })
            .eq('id', user.id)

        if (balError) {
            console.error('Token deduction error:', balError)
            return NextResponse.json({ error: 'Failed to deduct tokens' }, { status: 500 })
        }

        // 5. Create Transaction Record
        const { error: txError } = await supabaseAdmin.from('transactions').insert({
            user_id: user.id,
            application_id: applicationId,
            amount: 0,
            tokens_added: -9,
            type: 'premium_fee',
            status: 'success'
        })

        if (txError) {
            console.error('Transaction record error:', txError)
            // Non-fatal — continue
        }

        // 6. Generate Proxy Email using universal env address
        const randomString = crypto.randomBytes(4).toString('hex')
        const proxyAddress = process.env.PROXY_EMAIL || 'saviomohan2002@gmail.com'

        const { error: proxyError } = await supabaseAdmin.from('proxy_emails').insert({
            application_id: applicationId,
            proxy_address: proxyAddress,
            real_email: app.profiles.email,
            is_active: true
        })

        if (proxyError) {
            console.error('Proxy email insert error:', proxyError)
            return NextResponse.json({ error: 'Failed to create proxy email' }, { status: 500 })
        }

        // 7. Finalize Application status → accepted
        const { error: finalError } = await supabaseAdmin
            .from('applications')
            .update({ status: 'accepted' })
            .eq('id', applicationId)

        if (finalError) {
            console.error('Application status update error:', finalError)
            return NextResponse.json({ error: 'Failed to finalize application' }, { status: 500 })
        }

        // 8. Create Dashboard Inbox notification for seeker
        await supabaseAdmin.from('notifications').insert({
            user_id: user.id,
            application_id: applicationId,
            type: 'accepted',
            title: '🎉 Referral Confirmed — Payment Complete!',
            body: `Your 9 tokens have been processed. The referrer will contact the company using: ${proxyAddress}. Use the link below to apply to the job posting directly.`,
            job_link: null, // job_url not fetched here — seeker already knows from prior notification
        })

        // 8. Send congratulations email (non-blocking)
        try {
            const { sendEmail } = await import('@/lib/resend')
            await sendEmail({
                to: app.profiles.email,
                subject: '🎉 Referral Unlocked!',
                html: `
                    <h1>You're All Set!</h1>
                    <p>Your referral has been confirmed. Your secure proxy email is:</p>
                    <p><strong>${proxyAddress}</strong></p>
                    <p>Log in to your ReferKaro dashboard for full details.</p>
                `
            })
        } catch (emailErr) {
            console.error('Email sending failed (non-blocking):', emailErr)
        }

        return NextResponse.json({ success: true, proxyEmail: proxyAddress })

    } catch (error: any) {
        console.error('Payment completion error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
