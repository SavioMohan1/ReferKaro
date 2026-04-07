import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

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

        const body = await request.json()
        const { planId, amount, tokens, type = 'token', applicationId = null } = body

        let finalAmount = amount
        let finalTokens = tokens

        if (type === 'success_fee') {
            finalAmount = 900 // Hardcode ₹900 required payment
            finalTokens = 0
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
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
        })

    } catch (error) {
        console.error('Error creating order:', error)
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }
}
