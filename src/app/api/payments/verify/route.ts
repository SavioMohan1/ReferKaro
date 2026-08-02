import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth/authorization'
import { isValidCheckoutSignature, reconcileRazorpayPayment } from '@/lib/payments/reconcile-razorpay-payment'

export async function POST(request: Request) {
    const auth = await requireUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing Razorpay verification fields' }, { status: 400 })
        }
        if (!process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: 'Payment verification is not configured' }, { status: 503 })
        if (!isValidCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        const result = await reconcileRazorpayPayment(razorpay_order_id, razorpay_payment_id, auth.user.id)
        return NextResponse.json(result.success ? { success: true, message: result.message } : { error: result.error }, { status: result.success ? 200 : result.status })
    } catch (error) {
        console.error('Payment verification failed:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
