'use client'

import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState('')
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (!feedback.trim()) return
        window.location.href = `mailto:feedback@referkaro.app?subject=${encodeURIComponent('ReferKaro BETA feedback')}&body=${encodeURIComponent(feedback.trim())}`
    }
    return <main className="rk-product-page"><div className="rk-shell rk-feedback-layout"><Link href="/" className="rk-back-link"><ArrowLeft size={14} /> Home</Link><section><span className="rk-beta-badge">BETA</span><span className="rk-kicker">Feedback</span><h1>Where did the<br />flow lose you?</h1><p>Feedback is currently sent through your email client. The repository does not contain a feedback submission endpoint, so this page does not claim an in-app delivery.</p></section><form onSubmit={handleSubmit}><label className="rk-field"><span>Your feedback <b>Required</b></span><textarea rows={10} required value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Describe what happened, what you expected, and what would have made the step clearer." /></label><button type="submit" disabled={!feedback.trim()} className="rk-button rk-button-primary"><Send size={16} /> Open email draft</button><small>Draft recipient: feedback@referkaro.app</small></form></div></main>
}
