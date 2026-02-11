'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PLANS = [
    {
        id: 'starter',
        name: 'Starter Pack',
        tokens: 3,
        price: 99,
        description: 'Perfect for trying out the platform.'
    },
    {
        id: 'pro',
        name: 'Pro Pack',
        tokens: 10,
        price: 299,
        description: 'Best value for serious job seekers.',
        popular: true
    }
]

export default function BuyTokensPage() {
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [addedTokens, setAddedTokens] = useState(0)
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handlePurchase = async (plan: typeof PLANS[0]) => {
        setLoading(plan.id)

        try {
            // 1. Create Order
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    amount: plan.price,
                    tokens: plan.tokens
                })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error)

            // 2. Open Razorpay Checkout
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: 'INR',
                name: 'ReferKaro',
                description: `Purchase ${plan.tokens} Tokens`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                    })

                    const verifyData = await verifyRes.json()

                    if (verifyData.success) {
                        setAddedTokens(plan.tokens)
                        setPaymentSuccess(true)
                        router.refresh()
                    } else {
                        alert('Payment Verification Failed')
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#0f172a'
                }
            }

            const rzp1 = new window.Razorpay(options)
            rzp1.open()

        } catch (error) {
            console.error('Purchase failed:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    if (paymentSuccess) {
        return (
            <div className="container mx-auto py-20 px-4 flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center border-green-200 shadow-xl bg-green-50/50">
                    <CardHeader>
                        <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
                        <CardDescription className="text-green-700 font-medium">
                            {addedTokens} Tokens have been added to your wallet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            You are now ready to apply for referrals. Good luck!
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => router.push('/dashboard')}
                        >
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Buy Tokens</h1>
                <p className="text-muted-foreground">Invest in your career. Get referred today.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                {PLANS.map((plan) => (
                    <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                MOST POPULAR
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-4xl font-bold mb-4">
                                ₹{plan.price}
                                <span className="text-sm font-normal text-muted-foreground"> / one-time</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="font-bold">{plan.tokens} Tokens</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>{plan.tokens} Application Opportunities</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Direct connection to employees</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => handlePurchase(plan)}
                                disabled={!!loading}
                                variant={plan.popular ? 'default' : 'outline'}
                            >
                                {loading === plan.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Buy Now'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
