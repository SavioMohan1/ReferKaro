import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { getPlanById } from '@/lib/pricing'

export async function POST(request: Request) {
    const auth = await requireRole(['job_seeker'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = rateLimit(getRequestIdentifier(request, auth.user.id), { limit: 10, windowSeconds: 60 })
    if (!limited.success) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 })

    try {
        const { planId, type = 'token' } = await request.json()
        if (type !== 'token') return NextResponse.json({ error: 'Only token purchases are supported' }, { status: 400 })
        const plan = getPlanById(planId)
        if (!plan || plan.price * 100 < 100) return NextResponse.json({ error: 'Invalid token plan' }, { status: 400 })

        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: plan.price * 100, currency: 'INR', receipt: `rk_${crypto.randomUUID()}`.slice(0, 40) }),
            cache: 'no-store',
        })
        const order = await razorpayResponse.json()
        if (!razorpayResponse.ok) {
            console.error('Razorpay order creation failed:', razorpayResponse.status, order?.error?.code || 'unknown')
            return NextResponse.json({ error: razorpayResponse.status === 401 ? 'Payment credentials were rejected by Razorpay' : 'Razorpay could not create the order' }, { status: razorpayResponse.status === 401 ? 503 : 502 })
        }

        const { error } = await auth.admin.from('transactions').insert({
            user_id: auth.user.id,
            amount: plan.price,
            tokens_added: plan.tokens,
            status: 'pending',
            razorpay_order_id: order.id,
            type: 'token',
        })
        if (error) throw error

        return NextResponse.json({ orderId: order.id, keyId, amount: order.amount, currency: order.currency })
    } catch (error) {
        console.error('Payment order failed:', error)
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }
}
