import { NextResponse } from 'next/server'
import {
    isValidWebhookSignature,
    markRazorpayOrderFailed,
    reconcileRazorpayPayment
} from '@/lib/payments/reconcile-razorpay-payment'

export async function POST(request: Request) {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
        if (!webhookSecret) {
            console.error('RAZORPAY_WEBHOOK_SECRET is not configured')
            return NextResponse.json({ error: 'Webhook verification is not configured' }, { status: 500 })
        }

        const signature = request.headers.get('x-razorpay-signature')
        if (!signature) {
            return NextResponse.json({ error: 'Missing Razorpay webhook signature' }, { status: 400 })
        }

        const rawBody = await request.text()
        if (!isValidWebhookSignature(rawBody, signature, webhookSecret)) {
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
        }

        const payload = JSON.parse(rawBody)
        const event = payload.event
        const payment = payload.payload?.payment?.entity

        if (!payment?.order_id || !payment?.id) {
            return NextResponse.json({ received: true, message: 'No payment order to reconcile' })
        }

        if (event === 'payment.captured') {
            const result = await reconcileRazorpayPayment(payment.order_id, payment.id)
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: result.status })
            }

            return NextResponse.json({ received: true, message: result.message || 'Payment reconciled' })
        }

        if (event === 'payment.failed') {
            const result = await markRazorpayOrderFailed(payment.order_id, payment.id)
            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: result.status })
            }

            return NextResponse.json({ received: true, message: result.message || 'Payment marked failed' })
        }

        return NextResponse.json({ received: true, message: `Ignored event: ${event}` })
    } catch (error) {
        console.error('Error handling Razorpay webhook:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
