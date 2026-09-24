'use client'

import { useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, Loader2 } from 'lucide-react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TOKEN_PLANS } from '@/lib/pricing'

export default function BuyTokensPage() {
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [addedTokens, setAddedTokens] = useState(0)
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState('')
    const router = useRouter()

    const handlePurchase = async (plan: typeof TOKEN_PLANS[number]) => {
        setLoading(plan.id); setError('')
        try {
            const response = await fetch('/api/payments/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.id }) })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'The payment order could not be created.')
            if (!(window as any).Razorpay) throw new Error('Secure checkout is still loading. Please try again.')
            const razorpay = new (window as any).Razorpay({
                key: data.keyId, amount: data.amount, currency: data.currency, name: 'ReferKaro',
                description: `Purchase ${plan.tokens} Tokens`, order_id: data.orderId,
                handler: async (result: any) => {
                    try {
                        const verifyResponse = await fetch('/api/payments/verify', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ razorpay_order_id: result.razorpay_order_id, razorpay_payment_id: result.razorpay_payment_id, razorpay_signature: result.razorpay_signature }),
                        })
                        const verifyData = await verifyResponse.json()
                        if (!verifyResponse.ok || !verifyData.success) throw new Error('Payment verification failed. Tokens were not added.')
                        setAddedTokens(plan.tokens); setPaymentSuccess(true); router.refresh()
                    } catch (verificationError) {
                        setError(verificationError instanceof Error ? verificationError.message : 'Payment verification failed. Tokens were not added.')
                    } finally {
                        setLoading(null)
                    }
                },
                modal: { ondismiss: () => { setError('Checkout was closed. No tokens were added.'); setLoading(null) } },
                theme: { color: '#1f6655' },
            })
            razorpay.on('payment.failed', () => { setError('The payment failed. Tokens were not added.'); setLoading(null) })
            razorpay.open()
        } catch (purchaseError) { setError(purchaseError instanceof Error ? purchaseError.message : 'The purchase could not be started.'); setLoading(null) }
    }

    if (paymentSuccess) return <main className="rk-product-page"><div className="rk-purchase-success"><CheckCircle2 size={34} /><span className="rk-kicker">Payment verified</span><h1>{addedTokens} tokens<br />added.</h1><p>Your updated balance is ready for referral requests.</p><button type="button" className="rk-button rk-button-primary" onClick={() => router.push('/dashboard')}>Return to workspace</button></div></main>

    return <main className="rk-product-page"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /><div className="rk-shell rk-token-page">
        <Link href="/dashboard" className="rk-back-link"><ArrowLeft size={14} /> Workspace</Link>
        <header className="rk-listing-header"><div><span className="rk-kicker">Token store</span><h1>Choose how many<br />requests to make.</h1></div><div className="rk-listing-intro"><p>A token is used when you submit a referral request. Prices and quantities below come from the current product configuration.</p><strong>Payments are processed by Razorpay.</strong></div></header>
        {error && <div className="rk-form-error" role="alert">{error}</div>}
        <section className="rk-token-grid">{TOKEN_PLANS.map((plan) => <article key={plan.id} className="rk-token-card" data-featured={plan.popular}><div><span>{plan.popular ? 'Popular option' : 'Token pack'}</span><strong>{plan.tokens}</strong><small>tokens</small></div><div><h2>{plan.name}</h2><p>{plan.description}</p><ul><li><Check size={14} /> {plan.tokens} referral request slots</li><li><Check size={14} /> One-time Razorpay payment</li><li><Check size={14} /> Balance updates after signature verification</li></ul><button type="button" onClick={() => handlePurchase(plan)} disabled={!!loading} className="rk-button rk-button-primary">{loading === plan.id ? <><Loader2 size={15} className="rk-spinner" /> Opening checkout</> : `Buy for ₹${plan.price}`}</button></div></article>)}</section>
        <p className="rk-payment-footnote">Payment completion is subject to verification. See the refund policy for applicable terms.</p>
    </div></main>
}
