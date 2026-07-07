import { NextResponse } from 'next/server'
import { isValidCheckoutSignature, reconcileRazorpayPayment } from '@/lib/payments/reconcile-razorpay-payment'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing Razorpay verification fields' }, { status: 400 })
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.error('RAZORPAY_KEY_SECRET is not configured')
            return NextResponse.json({ error: 'Payment verification is not configured' }, { status: 500 })
        }

        if (!isValidCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const result = await reconcileRazorpayPayment(razorpay_order_id, razorpay_payment_id)
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.status })
        }

        return NextResponse.json({ success: true, message: result.message })

    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
