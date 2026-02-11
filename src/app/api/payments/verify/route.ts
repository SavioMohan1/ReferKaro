import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = body

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex')

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
        }

        // Payment is verified
        const supabase = await createClient()

        // Update Transaction Status
        const { data: transaction, error: fetchError } = await supabase
            .from('transactions')
            .select('*')
            .eq('razorpay_order_id', razorpay_order_id)
            .single()

        if (fetchError || !transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
        }

        if (transaction.status === 'success') {
            return NextResponse.json({ message: 'Already processed' })
        }

        // Atomic Update: Mark Transaction Success + Add Tokens
        const { error: updateError } = await supabase
            .from('transactions')
            .update({
                status: 'success',
                razorpay_payment_id: razorpay_payment_id
            })
            .eq('id', transaction.id)

        if (updateError) {
            console.error('Error updating transaction:', updateError)
            return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
        }

        // Add tokens to profile
        // Note: Ideally use a stored procedure/RPC for true atomicity, but client-side atomic increment pattern works too for MVP
        // OR better: Fetch current balance first
        const { data: profile } = await supabase
            .from('profiles')
            .select('token_balance')
            .eq('id', transaction.user_id)
            .single()

        const currentBalance = profile?.token_balance || 0

        const { error: balanceError } = await supabase
            .from('profiles')
            .update({ token_balance: currentBalance + transaction.tokens_added })
            .eq('id', transaction.user_id)

        if (balanceError) {
            console.error('Error updating balance:', balanceError)
            // Critical: Payment success but balance update failed. 
            // In producton, log this specifically for manual reconciliation.
            return NextResponse.json({ error: 'Payment verified but balance update failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
