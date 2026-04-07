import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex')

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // Payment is verified
        const supabase = await createClient()

        // Update Transaction Status
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('razorpay_order_id', razorpay_order_id)
            .single()

        if (fetchError || !transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        if (transaction.status === 'success') {
            return NextResponse.json({ message: 'Already processed' })
        }

        // Atomic Update: Mark Transaction Success + Add Tokens
        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                status: 'success',
                razorpay_payment_id: razorpay_payment_id
            })
            .eq('id', transaction.id)

        if (updateError) {
            console.error('Error updating transaction:', updateError)
            return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
        }

        if (transaction.type === 'token') {
            // Add tokens to profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('token_balance')
                .eq('id', transaction.user_id)
                .single()

            const currentBalance = profile?.token_balance || 0

            const { error: balanceError } = await supabase
                .from('profiles')
                .update({ token_balance: currentBalance + transaction.tokens_added })
                .eq('id', transaction.user_id)

            if (balanceError) {
                console.error('Error updating balance:', balanceError)
                return NextResponse.json({ error: 'Payment verified but balance update failed' }, { status: 500 })
            }
        } else if (transaction.type === 'success_fee' && transaction.application_id) {
            // 1. Update application status to 'accepted'
            const { error: appUpdateError } = await supabase
                .from('applications')
                .update({ status: 'accepted' })
                .eq('id', transaction.application_id)

            if (appUpdateError) {
                console.error('Error updating application status:', appUpdateError)
                return NextResponse.json({ error: 'Payment verified but application status update failed' }, { status: 500 })
            }

            // 2. Generate Proxy Email
            const { data: application } = await supabase
                .from('applications')
                .select('*, profiles:job_seeker_id(email)')
                .eq('id', transaction.application_id)
                .single()

            if (application && application.profiles) {
                const randomString = crypto.randomBytes(4).toString('hex')
                const domain = 'referkaro.com'
                const proxyAddress = `ref-${randomString}@${domain}`

                const { error: proxyError } = await supabase
                    .from('proxy_emails')
                    .insert({
                        application_id: transaction.application_id,
                        proxy_address: proxyAddress,
                        real_email: application.profiles.email,
                        is_active: true
                    })

                if (!proxyError) {
                    try {
                        const { sendEmail } = await import('@/lib/resend')
                        await sendEmail({
                            to: application.profiles.email,
                            subject: '🎉 Referral Unlocked & Tokens Added!',
                            html: `
                                <h1>Success Phase!</h1>
                                <p>Your payment was successful and your referral proxy email has been generated: <strong>${proxyAddress}</strong>.</p>
                                <p>The employee will now be able to use this email to make the referral.</p>
                                <p>As a bonus, we have credited <strong>2 Tokens</strong> to your account for future use!</p>
                            `
                        })
                    } catch (emailErr) {
                        console.error('Email sending failed:', emailErr)
                    }

                    // --- NEW: Add 2 Bonus Tokens to Job Seeker ---
                    try {
                        const { data: jsProfile } = await supabase
                            .from('profiles')
                            .select('token_balance')
                            .eq('id', transaction.user_id)
                            .single()

                        const currentBalance = jsProfile?.token_balance || 0
                        await supabase
                            .from('profiles')
                            .update({ token_balance: currentBalance + 2 })
                            .eq('id', transaction.user_id)
                    } catch (tokenErr) {
                        console.error('Failed to add bonus tokens:', tokenErr)
                    }
                    // ---------------------------------------------
                } else {
                    console.error('Error creating proxy email:', proxyError)
                }
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
