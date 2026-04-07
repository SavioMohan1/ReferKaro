import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

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

        // 1. Verify the employee owns this application (via job -> employee_id)
        // We can trust RLS, or double check here. Let's rely on RLS update policy, 
        // but we need to fetch the application first to get the job_seeker_id and real email.

        const { data: application, error: fetchError } = await supabase
            .from('applications')
            .select(`
                *,
                job:jobs(employee_id),
                profiles:job_seeker_id(email)
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

        // Verify ownership
        if (application.job.employee_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized to review this application' },
                { status: 403 }
            )
        }

        // 2. Map 'accepted' to 'payment_pending'
        const dbStatus = status === 'accepted' ? 'payment_pending' : status

        const { error: updateError } = await supabase
            .from('applications')
            .update({ status: dbStatus })
            .eq('id', applicationId)

        if (updateError) {
            throw updateError
        }

        let proxyEmail = null



        // --- NEW: Send Email to Candidate ---
        try {
            const candidateEmail = application.profiles.email
            if (candidateEmail) {
                const { sendEmail } = await import('@/lib/resend')

                const subject = status === 'accepted'
                    ? '🎉 Congratulations! Your Application was Accepted'
                    : 'Application Update'

                let htmlContent = `<h1>Application Update</h1><p>Your application status has been updated to: <strong>${status.toUpperCase()}</strong>.</p>`

                if (status === 'accepted') {
                    htmlContent = `
                        <h1>🎉 Great News!</h1>
                        <p>Your application has been <strong>ACCEPTED</strong> by the referrer!</p>
                        <p>Log in to your ReferKaro dashboard to pay the ₹900 Success Fee and unlock your referral email securely.</p>
                    `
                } else if (status === 'rejected') {
                    htmlContent = `
                        <h1>Application Update</h1>
                        <p>Thank you for your interest. Unfortunately, your application was not selected at this time.</p>
                        <p>Don't lose hope! Apply to other roles on ReferKaro.</p>
                    `
                }

                await sendEmail({
                    to: candidateEmail,
                    subject: subject,
                    html: htmlContent
                })
            }
        } catch (emailError) {
            console.error('Email sending failed (non-blocking):', emailError)
        }
        // ------------------------------------

        return NextResponse.json({
            success: true,
            status: dbStatus,
            proxyEmail // will be null now, generated post-payment
        })

    } catch (error: any) {
        console.error('Error updating application:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error', details: error },
            { status: 500 }
        )
    }
}
