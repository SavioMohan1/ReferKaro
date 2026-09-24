import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import test from 'node:test'
import {
    isValidCheckoutSignature,
    isValidWebhookSignature,
    validateCapturedPayment,
} from '../src/lib/payments/razorpay-validation.ts'

const secret = 'test_secret_for_signature_checks'

test('accepts a valid checkout signature and rejects tampering', () => {
    const orderId = 'order_test_123'
    const paymentId = 'pay_test_456'
    const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')

    assert.equal(isValidCheckoutSignature(orderId, paymentId, signature, secret), true)
    assert.equal(isValidCheckoutSignature(orderId, 'pay_tampered', signature, secret), false)
    assert.equal(isValidCheckoutSignature(orderId, paymentId, 'not-a-signature', secret), false)
})

test('accepts a valid webhook signature and rejects a changed payload', () => {
    const payload = JSON.stringify({ event: 'payment.captured' })
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    assert.equal(isValidWebhookSignature(payload, signature, secret), true)
    assert.equal(isValidWebhookSignature(`${payload} `, signature, secret), false)
})

test('requires captured provider data to match the stored order, amount, and currency', () => {
    const transaction = { amount: 99, razorpay_order_id: 'order_test_123' }
    const payment = {
        id: 'pay_test_456',
        order_id: 'order_test_123',
        amount: 9900,
        currency: 'INR',
        status: 'captured',
        captured: true,
    }

    assert.equal(validateCapturedPayment(transaction, payment, payment.id), null)
    assert.equal(validateCapturedPayment(transaction, { ...payment, amount: 9800 }, payment.id), 'Payment amount does not match')
    assert.equal(validateCapturedPayment(transaction, { ...payment, order_id: 'order_other' }, payment.id), 'Payment order does not match')
    assert.equal(validateCapturedPayment(transaction, { ...payment, captured: false, status: 'authorized' }, payment.id), 'Payment has not been captured')
})
