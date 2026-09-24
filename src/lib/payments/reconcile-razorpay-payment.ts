import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { createProxyAddress } from '@/lib/proxy-email'
import { RazorpayPaymentDetails, validateCapturedPayment } from '@/lib/payments/razorpay-validation'

export async function markRazorpayOrderFailed(orderId: string, paymentId: string) {
    const admin = createAdminClient()
    const { error } = await admin.from('transactions').update({ status: 'failed', razorpay_payment_id: paymentId }).eq('razorpay_order_id', orderId).eq('status', 'pending')
    return error ? { success: false, status: 500, error: 'Failed to mark payment as failed' } : { success: true }
}

export async function reconcileRazorpayPayment(
    orderId: string,
    paymentId: string,
    expectedUserId?: string,
    paymentDetails?: RazorpayPaymentDetails,
) {
    const admin = createAdminClient()
    const { data: transaction, error: transactionError } = await admin
        .from('transactions')
        .select('user_id, amount, status, razorpay_order_id, type, application_id')
        .eq('razorpay_order_id', orderId)
        .single()

    if (transactionError || !transaction) return { success: false, status: 404, error: 'Transaction not found' }
    if (expectedUserId && transaction.user_id !== expectedUserId) {
        return { success: false, status: 403, error: 'Payment does not belong to this account' }
    }
    if (paymentDetails) {
        const validationError = validateCapturedPayment(transaction, paymentDetails, paymentId)
        if (validationError) return { success: false, status: 409, error: validationError }
    }

    const rpc = transaction.type === 'token'
        ? admin.rpc('credit_token_purchase', {
            p_order_id: orderId,
            p_payment_id: paymentId,
            p_expected_user_id: expectedUserId || null,
        })
        : transaction.type === 'success_fee' && transaction.application_id
            ? admin.rpc('complete_success_fee_payment', {
                p_order_id: orderId,
                p_payment_id: paymentId,
                p_proxy_address: createProxyAddress(transaction.application_id),
                p_expected_user_id: expectedUserId || null,
            })
            : null

    if (!rpc) return { success: false, status: 400, error: 'Unsupported transaction type' }
    const { data, error } = await rpc
    if (error) {
        if (error.message.includes('transaction_not_found')) return { success: false, status: 404, error: 'Transaction not found' }
        if (error.message.includes('forbidden')) return { success: false, status: 403, error: 'Payment does not belong to this account' }
        if (error.message.includes('not_pending')) return { success: false, status: 409, error: 'Payment cannot be processed in its current state' }
        if (error.message.includes('invalid_application_state')) return { success: false, status: 409, error: 'Application cannot accept this payment' }
        console.error('Payment reconciliation RPC failed:', error.code)
        return { success: false, status: 500, error: 'Payment was verified but fulfilment failed' }
    }
    const successMessage = transaction.type === 'token' ? 'Tokens added successfully' : 'Referral access unlocked'
    return { success: true, message: data?.already_processed ? 'Payment already processed' : successMessage }
}
