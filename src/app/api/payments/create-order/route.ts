import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { getPlanById } from '@/lib/pricing'

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Rate limit: 10 requests per 60 seconds
        const rateLimitResult = rateLimit(
            getRequestIdentifier(request, user.id),
            { limit: 10, windowSeconds: 60 }
        )
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(rateLimitResult.resetIn) } }
            )
        }

        const body = await request.json()
        const { planId, type = 'token', applicationId = null } = body

        let finalAmount = 0
        let finalTokens = 0

        if (type === 'success_fee') {
            if (!applicationId) {
                return NextResponse.json({ error: 'applicationId is required for success fee payments' }, { status: 400 })
            }

            // Verify the application exists, belongs to the user, and is in 'selected' state
            const { data: application, error: appError } = await supabase
                .from('applications')
                .select('id, status, job_seeker_id')
                .eq('id', applicationId)
                .single()

            if (appError || !application) {
                return NextResponse.json({ error: 'Application not found' }, { status: 404 })
            }

            if (application.job_seeker_id !== user.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
            }

            if (application.status !== 'selected') {
                return NextResponse.json({ error: `Application is not in payment pending state (current: ${application.status})` }, { status: 400 })
            }

            finalAmount = 900 // Hardcoded ₹900 required payment
            finalTokens = 0
        } else if (type === 'token') {
            if (!planId) {
                return NextResponse.json({ error: 'planId is required for token purchase' }, { status: 400 })
            }

            const plan = getPlanById(planId)
            if (!plan) {
                return NextResponse.json({ error: 'Invalid planId' }, { status: 400 })
            }

            finalAmount = plan.price
            finalTokens = plan.tokens
        } else {
            return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
        }

        // Create Razorpay Order
        const order = await razorpay.orders.create({
            amount: finalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        })

        // Create Transaction Record in DB
        const { error: dbError } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                amount: finalAmount,
                tokens_added: finalTokens,
                status: 'pending',
                razorpay_order_id: order.id,
                type: type,
                application_id: applicationId
            })

        if (dbError) {
            console.error('Database insertion error:', JSON.stringify(dbError, null, 2))
            return NextResponse.json({ error: `Failed to create transaction record: ${dbError.message}` }, { status: 500 })
        }

        return NextResponse.json({
            orderId: order.id,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: finalAmount * 100 // return amount in paise for Razorpay checkout UI compatibility
        })

    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }
}
