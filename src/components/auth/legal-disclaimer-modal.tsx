'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CURRENT_LEGAL_POLICY_VERSION } from '@/lib/legal'

export default function LegalDisclaimerModal() {
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleAccept = async () => {
        setLoading(true); setError('')
        try {
            const response = await fetch('/api/legal/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ termsAccepted, privacyNoticeAcknowledged: privacyAcknowledged }),
            })
            const data = await response.json()
            if (!response.ok) { setError(data.error || 'Your acknowledgement could not be saved.'); return }
            router.refresh()
        } catch { setError('Your acknowledgement could not be saved. Check your connection and try again.') }
        finally { setLoading(false) }
    }

    return <div className="rk-legal-backdrop" role="dialog" aria-modal="true" aria-labelledby="legal-title">
        <section className="rk-legal-modal">
            <header><span><ShieldCheck size={23} /></span><div><small>Required before entering your workspace</small><h2 id="legal-title">Privacy and responsibility notice</h2><p>Policy version {CURRENT_LEGAL_POLICY_VERSION}</p></div></header>
            <div className="rk-legal-copy">
                <p>ReferKaro processes account, employment-verification, job-listing, application, resume, communications, and payment-reference data to operate the referral marketplace, prevent abuse, and meet legal obligations.</p>
                <p>Candidate information is confidential and may be used only for the requested referral. Referrals, interviews, or employment outcomes are never guaranteed.</p>
                <p>The <strong>Digital Personal Data Protection Act, 2023</strong> and the phased <strong>DPDP Rules, 2025</strong> are the correct names. Our DPDP notice explains purposes, recipients, retention, security, automated checks, and how to exercise privacy rights.</p>
                <div className="rk-legal-links"><Link href="/terms" target="_blank">Read Terms of Use</Link><Link href="/privacy" target="_blank">Read Privacy Policy</Link><Link href="/data-protection" target="_blank">Read DPDP Notice</Link></div>
                {error && <div className="rk-form-error" role="alert">{error}</div>}
            </div>
            <footer>
                <label><Checkbox checked={termsAccepted} onCheckedChange={(checked: boolean | 'indeterminate') => setTermsAccepted(checked === true)} /><span>I have read and accept the Terms of Use.</span></label>
                <label><Checkbox checked={privacyAcknowledged} onCheckedChange={(checked: boolean | 'indeterminate') => setPrivacyAcknowledged(checked === true)} /><span>I acknowledge the Privacy Policy and DPDP Notice, including the stated processing needed to provide the service.</span></label>
                <Button onClick={handleAccept} disabled={!termsAccepted || !privacyAcknowledged || loading}>{loading ? 'Saving acknowledgement...' : 'Accept and enter dashboard'}</Button>
            </footer>
        </section>
    </div>
}
