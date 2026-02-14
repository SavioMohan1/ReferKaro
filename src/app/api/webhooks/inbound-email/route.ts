import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This would strictly be a POST request from SendGrid/Resend/AWS SES
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Simulating a payload from an email provider (e.g., SendGrid Inbound Parse)
        // Expected format: { "to": "ref-xyz@referkaro.com", "from": "recruiter@google.com", "subject": "Referral Confirmed" }
        const { to, from, subject, text } = body

        if (!to) {
            return NextResponse.json({ error: 'Missing "to" field' }, { status: 400 })
        }

        console.log(`📨 Inbound Email Webhook Triggered!`)
        console.log(`To: ${to}, From: ${from}`)

        const supabase = await createClient()

        // 1. Extract the proxy address (handle "Name <email>" format if needed, here assuming simple email)
        const proxyAddress = to.toLowerCase().trim()

        // 2. Lookup the proxy in DB
        const { data: proxyEntry, error: lookupError } = await supabase
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
            .eq('is_active', true)
            .single()

        if (lookupError || !proxyEntry) {
            console.warn(`❌ Unknown or inactive proxy: ${proxyAddress}`)
            return NextResponse.json({ error: 'Proxy not found' }, { status: 404 })
        }

        console.log(`✅ Found Proxy! Linking to Application ID: ${proxyEntry.application_id}`)

        // 3. LOGIC: If we receive an email here, it means the Referral was sent!
        // We verified the employee did their job.

        // 4. Update Application Status -> 'referred' (or 'completed')
        // We'll calculate the payment release here in a real system.
        const { error: updateError } = await supabase
            .from('applications')
            .update({
                status: 'referred', // New status we might need to handle in UI
                updated_at: new Date().toISOString()
            })
            .eq('id', proxyEntry.application_id)

        if (updateError) {
            console.error('Failed to update application status:', updateError)
            return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
        }

        // 5. Forward the email to the Real Candidate (Simulated)
        // In prod: await resend.emails.send({ to: proxyEntry.real_email, ... })
        console.log(`🚀 FORWARDING EMAIL TO REAL CANDIDATE: ${proxyEntry.real_email}`)
        console.log(`Subject: ${subject}`)

        return NextResponse.json({
            success: true,
            message: 'Email processed and forwarded',
            real_recipient: proxyEntry.real_email
        })

    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
