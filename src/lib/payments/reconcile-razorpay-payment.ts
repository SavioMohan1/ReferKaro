import crypto from 'crypto'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createProxyAddress } from '@/lib/proxy-email'

const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export function isValidCheckoutSignature(orderId: string, paymentId: string, signature: string) {
    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

    return timingSafeHexCompare(expected, signature)
}

export function isValidWebhookSignature(rawBody: string, signature: string, webhookSecret: string) {
    const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

    return timingSafeHexCompare(expected, signature)
}

function timingSafeHexCompare(expected: string, received: string) {
    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(received)

    return expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

async function markTransactionFailed(transactionId: string, paymentId: string) {
    await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', razorpay_payment_id: paymentId })
        .eq('id', transactionId)
}

export async function markRazorpayOrderFailed(orderId: string, paymentId: string) {
    const { data: transaction } = await supabaseAdmin
        .from('transactions')
        .select('id, status')
        .eq('razorpay_order_id', orderId)
        .single()

    if (!transaction || transaction.status === 'success') {
        return { success: true, message: 'No pending transaction to fail' }
    }

    if (transaction.status === 'failed') {
        return { success: true, message: 'Already marked failed' }
    }

    const { error } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed', razorpay_payment_id: paymentId })
        .eq('id', transaction.id)
        .eq('status', 'pending')

    if (error) {
        return { success: false, status: 500, error: 'Failed to mark payment as failed' }
    }

    return { success: true }
}

export async function reconcileRazorpayPayment(orderId: string, paymentId: string) {
    const { data: transaction, error: fetchError } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single()

    if (fetchError || !transaction) {
        return { success: false, status: 404, error: 'Transaction not found' }
    }

    if (transaction.status === 'success') {
        return { success: true, message: 'Already processed' }
    }

    if (transaction.status === 'failed') {
        return { success: false, status: 409, error: 'Payment reconciliation previously failed. Please contact support.' }
    }

    const { data: lockedTransaction, error: lockError } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'success', razorpay_payment_id: paymentId })
        .eq('id', transaction.id)
        .eq('status', 'pending')
        .select('*')
        .single()

    if (lockError || !lockedTransaction) {
        return { success: false, status: 409, error: 'Payment is already being processed. Please refresh.' }
    }

    if (lockedTransaction.type === 'token') {
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('token_balance')
            .eq('id', lockedTransaction.user_id)
            .single()

        if (profileError || !profile) {
            await markTransactionFailed(lockedTransaction.id, paymentId)
            return { success: false, status: 500, error: 'Payment verified but profile was not found' }
        }

        const currentBalance = profile.token_balance || 0
        const { data: balanceUpdate, error: balanceError } = await supabaseAdmin
            .from('profiles')
            .update({ token_balance: currentBalance + lockedTransaction.tokens_added })
            .eq('id', lockedTransaction.user_id)
            .eq('token_balance', currentBalance)
            .select('id')
            .single()

        if (balanceError || !balanceUpdate) {
            await markTransactionFailed(lockedTransaction.id, paymentId)
            return { success: false, status: 500, error: 'Payment verified but balance update failed. Please contact support.' }
        }
    } else if (lockedTransaction.type === 'success_fee' && lockedTransaction.application_id) {
        const { error: appUpdateError } = await supabaseAdmin
            .from('applications')
            .update({ status: 'accepted' })
            .eq('id', lockedTransaction.application_id)

        if (appUpdateError) {
            await markTransactionFailed(lockedTransaction.id, paymentId)
            return { success: false, status: 500, error: 'Payment verified but application status update failed' }
        }

        const { data: application, error: appFetchError } = await supabaseAdmin
            .from('applications')
            .select('*, profiles:job_seeker_id(email)')
            .eq('id', lockedTransaction.application_id)
            .single()

        if (appFetchError || !application?.profiles?.email) {
            await markTransactionFailed(lockedTransaction.id, paymentId)
            return { success: false, status: 500, error: 'Payment verified but application details were not found' }
        }

        const proxyAddress = createProxyAddress(lockedTransaction.application_id)

        const { error: proxyError } = await supabaseAdmin
            .from('proxy_emails')
            .insert({
                application_id: lockedTransaction.application_id,
                proxy_address: proxyAddress,
                real_email: application.profiles.email,
                is_active: true
            })

        if (proxyError) {
            await markTransactionFailed(lockedTransaction.id, paymentId)
            return { success: false, status: 500, error: 'Payment verified but proxy email creation failed' }
        }

        try {
            const { sendEmail } = await import('@/lib/resend')
            await sendEmail({
                to: application.profiles.email,
                subject: 'Referral Unlocked & Tokens Added!',
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

        try {
            const { data: jsProfile } = await supabaseAdmin
                .from('profiles')
                .select('token_balance')
                .eq('id', lockedTransaction.user_id)
                .single()

            const jsCurrentBalance = jsProfile?.token_balance || 0
            const { data: bonusUpdate, error: bonusError } = await supabaseAdmin
                .from('profiles')
                .update({ token_balance: jsCurrentBalance + 2 })
                .eq('id', lockedTransaction.user_id)
                .eq('token_balance', jsCurrentBalance)
                .select('id')
                .single()

            if (bonusError || !bonusUpdate) {
                console.error('Bonus token update conflict - will be retried or reconciled')
            }
        } catch (tokenErr) {
            console.error('Failed to add bonus tokens:', tokenErr)
        }
    }

    return { success: true }
}
