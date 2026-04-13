import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Admin client for all privileged writes — bypasses RLS after auth verification
const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { applicationId, status } = body

        if (!applicationId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // 1. Fetch the application with full job details and seeker profile
        // Use admin client to avoid RLS blocking the join read
        const { data: application, error: fetchError } = await supabaseAdmin
            .from('applications')
            .select(`
                *,
                job:jobs(id, employee_id, referral_type, job_url),
                profiles:job_seeker_id(email, token_balance)
            `)
            .eq('id', applicationId)
            .single()

        if (fetchError || !application) {
            return NextResponse.json(
                { error: 'Application not found or access denied' },
                { status: 404 }
            )
        }

        if (!application.profiles) {
            return NextResponse.json(
                { error: 'Job seeker profile not found. Cannot generate proxy.' },
                { status: 404 }
            )
        }

        // 2. Verify the authenticated user owns this job
        if (application.job.employee_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to review this application' },
                { status: 403 }
            )
        }

        const referral_type = application.referral_type || application.job?.referral_type || 'single'

        let dbStatus = status
        let proxyEmail = null

        // =====================================================
        // CASE A: Employee clicks "Accept"
        // =====================================================
        if (status === 'accepted') {

            if (referral_type === 'pooling') {
                // --- POOLING ACCEPTANCE ---
                // No payment required. Winner is selected, all others rejected immediately.
                dbStatus = 'accepted'

                // Reject all OTHER applications in the same pool (same job)
                const { error: rejectError } = await supabaseAdmin
                    .from('applications')
                    .update({ status: 'rejected' })
                    .eq('job_id', application.job_id)
                    .neq('id', applicationId)

                if (rejectError) {
                    console.error('Failed to reject other pool members:', rejectError)
                }

                // Accept the winner
                const { error: acceptError } = await supabaseAdmin
                    .from('applications')
                    .update({ status: 'accepted' })
                    .eq('id', applicationId)

                if (acceptError) {
                    return NextResponse.json({ error: 'Failed to accept application' }, { status: 500 })
                }

                // Use universal proxy email from env (saviomohan2002@gmail.com)
                const proxyAddress = process.env.PROXY_EMAIL || 'saviomohan2002@gmail.com'
                await supabaseAdmin.from('proxy_emails').insert({
                    application_id: applicationId,
                    proxy_address: proxyAddress,
                    real_email: application.profiles.email,
                    is_active: true
                })
                proxyEmail = proxyAddress

                // Create Dashboard Inbox notification for the winner
                const jobUrl = application.job?.job_url || null
                await supabaseAdmin.from('notifications').insert({
                    user_id: application.job_seeker_id,
                    application_id: applicationId,
                    type: 'pooling_accepted',
                    title: '🏆 You were selected from the referral pool!',
                    body: `Congratulations! You have been chosen. The referrer will submit your application using the contact email: ${proxyAddress}. Use the link below to apply directly to the company posting.`,
                    job_link: jobUrl,
                })

                // Send email to winner (non-blocking)
                sendCandidateEmail(application.profiles.email, 'pooling_accepted', proxyAddress)

                return NextResponse.json({ success: true, status: 'accepted', proxyEmail })

            } else {
                // --- SINGLE REFERRAL ACCEPTANCE ---
                // Check if seeker has enough tokens (9 tokens required).
                const seekerBalance = application.profiles.token_balance || 0

                if (seekerBalance >= 9) {
                    // Seeker has tokens — deduct immediately and generate proxy email
                    const { error: tokenError } = await supabaseAdmin
                        .from('profiles')
                        .update({ token_balance: seekerBalance - 9 })
                        .eq('id', application.job_seeker_id)

                    if (tokenError) {
                        return NextResponse.json({ error: 'Failed to deduct tokens' }, { status: 500 })
                    }

                    // Create transaction record
                    await supabaseAdmin.from('transactions').insert({
                        user_id: application.job_seeker_id,
                        application_id: applicationId,
                        amount: 0,
                        tokens_added: -9,
                        type: 'premium_fee',
                        status: 'success'
                    })

                    // Generate Proxy Email using universal env address
                    const proxyAddress = process.env.PROXY_EMAIL || 'saviomohan2002@gmail.com'
                    await supabaseAdmin.from('proxy_emails').insert({
                        application_id: applicationId,
                        proxy_address: proxyAddress,
                        real_email: application.profiles.email,
                        is_active: true
                    })
                    proxyEmail = proxyAddress

                    // Update application to accepted
                    await supabaseAdmin
                        .from('applications')
                        .update({ status: 'accepted' })
                        .eq('id', applicationId)

                    // Create inbox notification for seeker
                    await supabaseAdmin.from('notifications').insert({
                        user_id: application.job_seeker_id,
                        application_id: applicationId,
                        type: 'accepted',
                        title: '✅ Your referral has been confirmed!',
                        body: `The referrer will contact the company on your behalf using: ${proxyAddress}. Use the link below to apply to the job posting directly.`,
                        job_link: application.job?.job_url || null,
                    })

                    // Notify candidate
                    sendCandidateEmail(application.profiles.email, 'accepted', proxyAddress)

                    return NextResponse.json({ success: true, status: 'accepted', proxyEmail })

                } else {
                    // Seeker lacks tokens — move to 'selected', prompt payment
                    const { error: updateSelectedError } = await supabaseAdmin
                        .from('applications')
                        .update({ status: 'selected', selected_at: new Date().toISOString() })
                        .eq('id', applicationId)

                    if (updateSelectedError) {
                        return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
                    }

                    // Create inbox notification for seeker
                    await supabaseAdmin.from('notifications').insert({
                        user_id: application.job_seeker_id,
                        application_id: applicationId,
                        type: 'selected',
                        title: '⚡ Action Required — You have been selected!',
                        body: 'The referrer has chosen you! You need 9 tokens to confirm. Please top up within 24 hours or the offer will expire.',
                        job_link: application.job?.job_url || null,
                    })

                    // Email seeker to buy tokens
                    sendCandidateEmail(application.profiles.email, 'selected', null)

                    return NextResponse.json({ success: true, status: 'selected', proxyEmail: null })
                }
            }
        }

        // =====================================================
        // CASE B: Employee clicks "Reject"
        // =====================================================
        if (status === 'rejected') {
            const { error: updateError } = await supabaseAdmin
                .from('applications')
                .update({ status: 'rejected' })
                .eq('id', applicationId)

            if (updateError) {
                return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 })
            }

            // Create inbox notification for seeker
            await supabaseAdmin.from('notifications').insert({
                user_id: application.job_seeker_id,
                application_id: applicationId,
                type: 'rejected',
                title: 'Application Not Selected',
                body: 'Thank you for your interest. Unfortunately your application was not chosen this time. Keep applying — there are more opportunities on ReferKaro!',
            })

            sendCandidateEmail(application.profiles.email, 'rejected', null)
            return NextResponse.json({ success: true, status: 'rejected', proxyEmail: null })
        }

        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })

    } catch (error: any) {
        console.error('Error updating application:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error', details: error },
            { status: 500 }
        )
    }
}

async function sendCandidateEmail(to: string, scenario: string, proxyEmail: string | null) {
    try {
        const { sendEmail } = await import('@/lib/resend')

        const scenarios: Record<string, { subject: string; html: string }> = {
            accepted: {
                subject: '🎉 Congratulations! Your Referral is Secured',
                html: `
                    <h1>🎉 Great News!</h1>
                    <p>Your application has been <strong>ACCEPTED</strong> by the referrer and the required tokens have been processed.</p>
                    <p>Log in to your ReferKaro dashboard to view your secure proxy referral email.</p>
                `
            },
            pooling_accepted: {
                subject: '🎉 You Won the Pool! Your Referral is Confirmed',
                html: `
                    <h1>🏆 You Were Selected!</h1>
                    <p>You have been chosen as the winner of the referral pool!</p>
                    <p>Your proxy referral email is: <strong>${proxyEmail}</strong></p>
                    <p>Log in to your ReferKaro dashboard for full details.</p>
                `
            },
            selected: {
                subject: '⚠️ Action Required: Complete Your Referral',
                html: `
                    <h1>You've Been Selected!</h1>
                    <p>The employee has selected you for a Premium Referral.</p>
                    <p>However, you need <strong>9 tokens</strong> to finalize. Please log in within <strong>24 hours</strong> to buy tokens, or the offer will expire.</p>
                `
            },
            rejected: {
                subject: 'Application Update from ReferKaro',
                html: `
                    <h1>Application Update</h1>
                    <p>Thank you for your interest. Unfortunately, your application was not selected at this time.</p>
                    <p>Don't give up — apply to other roles on ReferKaro!</p>
                `
            }
        }

        const template = scenarios[scenario]
        if (template) {
            await sendEmail({ to, subject: template.subject, html: template.html })
        }
    } catch (err) {
        console.error('Email sending failed (non-blocking):', err)
    }
}
