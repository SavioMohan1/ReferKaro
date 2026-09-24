import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/authorization'
import { reconcileRazorpayPayment } from '@/lib/payments/reconcile-razorpay-payment'
import { isValidCheckoutSignature } from '@/lib/payments/razorpay-validation'
import { getRazorpayClient, getRazorpayErrorStatus, RazorpayConfigurationError } from '@/lib/payments/razorpay'

export async function POST(request: Request) {
    const auth = await requireUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing Razorpay verification fields' }, { status: 400 })
        }
        if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every((value) => typeof value === 'string')) {
            return NextResponse.json({ error: 'Invalid Razorpay verification fields' }, { status: 400 })
        }

        const { client, keySecret } = getRazorpayClient()
        if (!isValidCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const payment = await client.payments.fetch(razorpay_payment_id)
        const result = await reconcileRazorpayPayment(
            razorpay_order_id,
            razorpay_payment_id,
            auth.user.id,
            payment,
        )
        return NextResponse.json(result.success ? { success: true, message: result.message } : { error: result.error }, { status: result.success ? 200 : result.status })
    } catch (error) {
        if (error instanceof RazorpayConfigurationError) {
            return NextResponse.json({ error: 'Payment verification is not configured' }, { status: 503 })
        }
        const providerStatus = getRazorpayErrorStatus(error)
        console.error('Payment verification failed:', providerStatus || 'internal')
        if (providerStatus === 400 || providerStatus === 404) {
            return NextResponse.json({ error: 'Razorpay could not confirm this payment' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
