import 'server-only'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export function isValidCheckoutSignature(orderId: string, paymentId: string, signature: string) {
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(`${orderId}|${paymentId}`).digest('hex')
    return timingSafeHexCompare(expected, signature)
}

export function isValidWebhookSignature(rawBody: string, signature: string, webhookSecret: string) {
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
    return timingSafeHexCompare(expected, signature)
}

function timingSafeHexCompare(expected: string, received: string) {
    const expectedBuffer = Buffer.from(expected)
    const receivedBuffer = Buffer.from(received)
    return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

export async function markRazorpayOrderFailed(orderId: string, paymentId: string) {
    const admin = createAdminClient()
    const { error } = await admin.from('transactions').update({ status: 'failed', razorpay_payment_id: paymentId }).eq('razorpay_order_id', orderId).eq('status', 'pending')
    return error ? { success: false, status: 500, error: 'Failed to mark payment as failed' } : { success: true }
}

export async function reconcileRazorpayPayment(orderId: string, paymentId: string, expectedUserId?: string) {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('credit_token_purchase', {
        p_order_id: orderId,
        p_payment_id: paymentId,
        p_expected_user_id: expectedUserId || null,
    })
    if (error) {
        if (error.message.includes('transaction_not_found')) return { success: false, status: 404, error: 'Transaction not found' }
        if (error.message.includes('forbidden')) return { success: false, status: 403, error: 'Payment does not belong to this account' }
        if (error.message.includes('not_pending')) return { success: false, status: 409, error: 'Payment cannot be processed in its current state' }
        console.error('Payment reconciliation RPC failed:', error.code)
        return { success: false, status: 500, error: 'Payment was verified but token crediting failed' }
    }
    return { success: true, message: data?.already_processed ? 'Payment already processed' : 'Tokens added successfully' }
}
