'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, Zap, Star } from 'lucide-react'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

declare global { interface Window { Razorpay: any } }

const PLANS = [
    { id:'starter', name:'Starter Pack', tokens:3, price:99,  description:'Perfect for trying out the platform.', popular:false },
    { id:'pro',     name:'Pro Pack',     tokens:10, price:299, description:'Best value for serious job seekers.',  popular:true  },
]

export default function BuyTokensPage() {
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [addedTokens, setAddedTokens] = useState(0)
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    const handlePurchase = async (plan: typeof PLANS[0]) => {
        setLoading(plan.id)
        try {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id, amount: plan.price, tokens: plan.tokens }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            const options = {
                key: data.keyId, amount: data.amount, currency: 'INR',
                name: 'ReferKaro', description: `Purchase ${plan.tokens} Tokens`,
                order_id: data.orderId,
                handler: async (response: any) => {
                    const verifyRes = await fetch('/api/payments/verify', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    })
                    const verifyData = await verifyRes.json()
                    if (verifyData.success) { setAddedTokens(plan.tokens); setPaymentSuccess(true); router.refresh() }
                    else alert('Payment Verification Failed')
                },
                prefill: { name:'', email:'', contact:'' },
                theme: { color:'#00F0FF' },
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
            <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
                <div className="dk-card" style={{ maxWidth:420, width:'100%', padding:'48px 36px', textAlign:'center' }}>
                    <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}>
                        <CheckCircle2 size={36} color="#22C55E" />
                    </div>
                    <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.5rem', color:'#22C55E', marginBottom:8 }}>
                        Payment Successful!
                    </h2>
                    <p style={{ color:'#6B7A99', marginBottom:28 }}>
                        <strong style={{ color:'#E8EDF5' }}>{addedTokens} Tokens</strong> have been added to your wallet. You're ready to apply!
                    </p>
                    <button className="dk-btn-primary" onClick={() => router.push('/dashboard')} style={{ width:'100%', justifyContent:'center' }}>
                        Go to Dashboard →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="page-wrapper" style={{ paddingTop:80, paddingBottom:80, position:'relative', overflow:'hidden' }}>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="glow-orb glow-cyan"   style={{ width:380, height:380, top:-60, right:-60, opacity:0.4 }} />
            <div className="glow-orb glow-violet"  style={{ width:320, height:320, bottom:-60, left:-60, opacity:0.35 }} />

            <div className="page-container" style={{ maxWidth:780, position:'relative', zIndex:1 }}>
                <div style={{ textAlign:'center', marginBottom:48 }}>
                    <span className="dk-chip" style={{ marginBottom:14, display:'inline-block' }}>Token Store</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.7rem,4vw,2.6rem)', color:'#E8EDF5', marginBottom:10 }}>
                        Buy Tokens
                    </h1>
                    <p style={{ color:'#6B7A99', fontSize:'0.95rem' }}>
                        Invest in your career. Every token is a guaranteed human review.
                    </p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
                    {PLANS.map(plan => (
                        <div
                            key={plan.id}
                            className="dk-card"
                            style={{
                                padding:'36px 32px', position:'relative', overflow:'hidden',
                                border: plan.popular ? '1px solid rgba(0,240,255,0.45)' : undefined,
                                boxShadow: plan.popular ? '0 0 36px rgba(0,240,255,0.12)' : undefined,
                                transform: plan.popular ? 'scale(1.03)' : undefined,
                            }}
                        >
                            {plan.popular && (
                                <div style={{
                                    position:'absolute', top:16, right:16,
                                    background:'rgba(0,240,255,0.12)', color:'#00F0FF',
                                    fontSize:10, fontWeight:700, letterSpacing:'0.08em',
                                    padding:'4px 10px', borderRadius:999,
                                    border:'1px solid rgba(0,240,255,0.25)',
                                }}>★ BEST VALUE</div>
                            )}
                            <div style={{ width:44, height:44, borderRadius:10, background:'rgba(0,240,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                                {plan.popular ? <Star size={22} color="#00F0FF" /> : <Zap size={22} color="#00F0FF" />}
                            </div>
                            <div style={{ fontFamily:'var(--font-head)', fontSize:'0.85rem', fontWeight:700, color:'#6B7A99', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{plan.name}</div>
                            <div style={{ fontFamily:'var(--font-head)', fontSize:'2.4rem', fontWeight:800, color:'#E8EDF5', marginBottom:4 }}>₹{plan.price}</div>
                            <div style={{ fontSize:'0.8rem', color:'#6B7A99', marginBottom:4 }}>one-time payment</div>
                            <p style={{ fontSize:'0.875rem', color:'#6B7A99', marginBottom:24, lineHeight:1.6 }}>{plan.description}</p>

                            <ul style={{ listStyle:'none', padding:0, margin:'0 0 28px' }}>
                                {[`${plan.tokens} Tokens`, `${plan.tokens} Application Slots`, 'Direct employee connection', 'Email status tracking'].map(f => (
                                    <li key={f} style={{ fontSize:'0.875rem', color:'#6B7A99', padding:'7px 0', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid rgba(0,240,255,0.06)' }}>
                                        <span style={{ color:'#00F0FF' }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={plan.popular ? 'dk-btn-primary' : 'dk-btn-outline'}
                                style={{ width:'100%', justifyContent:'center', padding:'13px 24px' }}
                                onClick={() => handlePurchase(plan)}
                                disabled={!!loading}
                            >
                                {loading === plan.id ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Processing...</> : 'Buy Now'}
                            </button>
                        </div>
                    ))}
                </div>

                <p style={{ textAlign:'center', color:'#6B7A99', fontSize:'0.8rem', marginTop:32 }}>
                    Secured by Razorpay · Tokens never expire · Refund policy applies
                </p>
            </div>
        </div>
    )
}
