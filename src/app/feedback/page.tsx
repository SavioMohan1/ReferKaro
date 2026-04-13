'use client'

import { useState } from 'react'
import { MessageSquarePlus, Send, Loader2, CheckCircle } from 'lucide-react'

export default function FeedbackPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [feedback, setFeedback] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!feedback.trim()) return
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        setIsSuccess(true)
        setFeedback('')
        setTimeout(() => setIsSuccess(false), 5000)
    }

    return (
        <div className="page-wrapper" style={{ paddingTop:80, position:'relative', overflow:'hidden' }}>
            <div className="glow-orb glow-violet" style={{ width:380, height:380, top:-60, right:-60, opacity:0.4 }} />

            <div className="page-container" style={{ maxWidth:680, paddingBottom:80, position:'relative', zIndex:1 }}>
                <div style={{ textAlign:'center', marginBottom:40 }}>
                    <div style={{ width:56,height:56,borderRadius:'50%',background:'rgba(0,240,255,0.09)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px' }}>
                        <MessageSquarePlus size={26} color="#00F0FF" />
                    </div>
                    <span className="dk-chip" style={{ marginBottom:14, display:'inline-block' }}>Feedback</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.7rem,4vw,2.4rem)', color:'#E8EDF5', marginBottom:10 }}>
                        We Value Your Input
                    </h1>
                    <p style={{ fontSize:'0.95rem', color:'#6B7A99', lineHeight:1.75, maxWidth:480, margin:'0 auto' }}>
                        Tell us what features you'd like, or report any issues. Your feedback goes straight to{' '}
                        <span style={{ color:'#00F0FF', fontWeight:600 }}>feedback@referkaro.com</span>.
                    </p>
                </div>

                <div className="dk-card" style={{ padding:'40px 36px' }}>
                    {isSuccess ? (
                        <div style={{ textAlign:'center', padding:'40px 0' }}>
                            <CheckCircle size={56} color="#22C55E" style={{ margin:'0 auto 16px' }} />
                            <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1.4rem', color:'#E8EDF5', marginBottom:8 }}>
                                Thank You! 🎉
                            </h3>
                            <p style={{ color:'#6B7A99', marginBottom:24 }}>
                                Your feedback has been sent. We appreciate you taking the time!
                            </p>
                            <button className="dk-btn-outline" onClick={() => setIsSuccess(false)}>
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom:20 }}>
                                <label style={{ display:'block', marginBottom:8, color:'#B0BAD4', fontSize:'0.875rem', fontWeight:500 }}>
                                    What's on your mind?
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    rows={6}
                                    required
                                    placeholder="Tell us what you think — features, bugs, improvements..."
                                    style={{
                                        width:'100%', padding:'12px 14px', resize:'none',
                                        background:'rgba(255,255,255,0.04)',
                                        border:'1px solid rgba(0,240,255,0.14)',
                                        borderRadius:10, color:'#E8EDF5',
                                        fontFamily:'var(--font-body)', fontSize:'0.9rem',
                                        outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)'
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08)'
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.borderColor = 'rgba(0,240,255,0.14)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !feedback.trim()}
                                className="dk-btn-primary"
                                style={{ width:'100%', justifyContent:'center', padding:'13px 24px', fontSize:'0.95rem' }}
                            >
                                {isSubmitting ? (
                                    <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Sending...</>
                                ) : (
                                    <><Send size={16} /> Submit Feedback</>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
