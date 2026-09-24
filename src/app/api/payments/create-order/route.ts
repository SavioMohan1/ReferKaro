import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/authorization'
import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { getPlanById } from '@/lib/pricing'
import { getRazorpayClient, getRazorpayErrorStatus, RazorpayConfigurationError } from '@/lib/payments/razorpay'

const SUCCESS_FEE_RUPEES = 900

export async function POST(request: Request) {
    const auth = await requireRole(['job_seeker'])
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const limited = rateLimit(getRequestIdentifier(request, auth.user.id), { limit: 10, windowSeconds: 60 })
    if (!limited.success) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })

    try {
        const { planId, type = 'token', applicationId } = await request.json()
        let amount: number
        let tokensAdded: number
        let transactionType: 'token' | 'success_fee'
        let transactionApplicationId: string | null = null

        if (type === 'token') {
            const plan = getPlanById(planId)
            if (!plan || plan.price * 100 < 100) return NextResponse.json({ error: 'Invalid token plan' }, { status: 400 })
            amount = plan.price
            tokensAdded = plan.tokens
            transactionType = 'token'
        } else if (type === 'success_fee' && typeof applicationId === 'string') {
            const { data: application, error: applicationError } = await auth.admin
                .from('applications')
                .select('id, job_seeker_id, status')
                .eq('id', applicationId)
                .single()
            if (applicationError || !application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
            if (application.job_seeker_id !== auth.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
            if (application.status !== 'payment_pending') {
                return NextResponse.json({ error: 'This application is not awaiting a success-fee payment' }, { status: 409 })
            }
            amount = SUCCESS_FEE_RUPEES
            tokensAdded = 0
            transactionType = 'success_fee'
            transactionApplicationId = application.id
        } else {
            return NextResponse.json({ error: 'Unsupported purchase type' }, { status: 400 })
        }

        const amountPaise = amount * 100
        if (!Number.isSafeInteger(amountPaise) || amountPaise < 100) {
            return NextResponse.json({ error: 'Payment amount must be at least 100 paise' }, { status: 400 })
        }

        const { client, keyId } = getRazorpayClient()
        const order = await client.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: `rk_${crypto.randomUUID()}`.slice(0, 40),
            notes: { purchase_type: transactionType },
        })

        const { error } = await auth.admin.from('transactions').insert({
            user_id: auth.user.id,
            amount,
            tokens_added: tokensAdded,
            status: 'pending',
            razorpay_order_id: order.id,
            type: transactionType,
            application_id: transactionApplicationId,
        })
        if (error) throw error

        return NextResponse.json({ orderId: order.id, keyId, amount: order.amount, currency: order.currency })
    } catch (error) {
        if (error instanceof RazorpayConfigurationError) {
            return NextResponse.json({ error: 'Payments are not configured' }, { status: 503 })
        }
        const providerStatus = getRazorpayErrorStatus(error)
        if (providerStatus === 401) {
            console.error('Razorpay rejected the configured credentials')
            return NextResponse.json({ error: 'Payment credentials were rejected by Razorpay' }, { status: 401 })
        }
        console.error('Payment order failed:', providerStatus || 'internal')
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }
}
