import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
    // 1. Authorization Check (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production') {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        const supabase = await createClient()

        // 2. Find applications that are 'selected' and > 24 hours old
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: expiredApps, error: fetchError } = await supabase
            .from('applications')
            .select(`
                id, 
                employee_id,
                job_seeker_id,
                jobs ( role_title, company ),
                seeker:profiles!job_seeker_id ( email, full_name ),
                employee:profiles!employee_id ( email, full_name )
            `)
            .eq('status', 'selected')
            .lt('selected_at', twentyFourHoursAgo)

        if (fetchError) throw fetchError

        if (!expiredApps || expiredApps.length === 0) {
            return NextResponse.json({ message: 'No expired applications found' })
        }

        console.log(`Found ${expiredApps.length} expired applications. Processing...`)

        // 3. Mark them as expired
        const expiredIds = expiredApps.map(app => app.id)
        
        const { error: updateError } = await supabase
            .from('applications')
            .update({ status: 'expired' })
            .in('id', expiredIds)

        if (updateError) throw updateError

        // 4. Send Emails (Optional but good UX)
        for (const app of expiredApps) {
            // Email to Seeker
            if (app.seeker?.email) {
                await resend.emails.send({
                    from: 'ReferKaro <notifications@referkaro.com>',
                    to: app.seeker.email,
                    subject: 'Referral Offer Expired ⏳',
                    html: `
                        <h2>Offer Expired</h2>
                        <p>Hi ${app.seeker.full_name},</p>
                        <p>Your selection for <strong>${app.jobs?.role_title}</strong> at <strong>${app.jobs?.company}</strong> has expired because the 9 tokens were not provided within the 24-hour window.</p>
                        <p>We wish you luck in your future applications!</p>
                    `
                });
            }

            // Email to Employee
            if (app.employee?.email) {
                await resend.emails.send({
                    from: 'ReferKaro <notifications@referkaro.com>',
                    to: app.employee.email,
                    subject: 'Candidate Selection Expired',
                    html: `
                        <h2>Candidate Offer Expired</h2>
                        <p>Hi ${app.employee.full_name},</p>
                        <p>The candidate you selected for <strong>${app.jobs?.role_title}</strong> failed to provide the required tokens within the 24-hour limit.</p>
                        <p>You can now log back into your dashboard and select a different candidate from the pool.</p>
                        <a href="https://referkaro.com/dashboard" style="display:inline-block;padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:5px;">Go to Dashboard</a>
                    `
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Expired ${expiredApps.length} applications securely.` 
        })

    } catch (error: any) {
        console.error('Expiration Cron Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
