import crypto from 'crypto'

export type StoredPaymentTransaction = {
    amount: number | string
    razorpay_order_id: string
}

export type RazorpayPaymentDetails = {
    id: string
    order_id?: string | null
    amount: number | string
    currency: string
    status: string
    captured?: boolean
}

export function isValidCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string) {
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
    return timingSafeHexCompare(expected, signature)
}

export function isValidWebhookSignature(rawBody: string, signature: string, webhookSecret: string) {
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
    return timingSafeHexCompare(expected, signature)
}

export function validateCapturedPayment(
    transaction: StoredPaymentTransaction,
    payment: RazorpayPaymentDetails,
    expectedPaymentId: string,
) {
    const expectedAmount = Math.round(Number(transaction.amount) * 100)
    if (!Number.isSafeInteger(expectedAmount) || expectedAmount < 100) return 'Stored transaction amount is invalid'
    if (payment.id !== expectedPaymentId) return 'Payment ID does not match'
    if (payment.order_id !== transaction.razorpay_order_id) return 'Payment order does not match'
    if (Number(payment.amount) !== expectedAmount) return 'Payment amount does not match'
    if (payment.currency !== 'INR') return 'Payment currency does not match'
    if (payment.status !== 'captured' || payment.captured !== true) return 'Payment has not been captured'
    return null
}

function timingSafeHexCompare(expected: string, received: string) {
    if (!/^[a-f0-9]{64}$/i.test(received)) return false
    const expectedBuffer = Buffer.from(expected, 'hex')
    const receivedBuffer = Buffer.from(received, 'hex')
    return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}
