'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LegalDisclaimerModal() {
    const [open, setOpen] = useState(false)
    const [scrolledToBottom, setScrolledToBottom] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const checkTerms = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('has_accepted_terms')
                    .eq('id', user.id)
                    .single()

                if (profile && !profile.has_accepted_terms) {
                    setOpen(true)
                }
            }
        }
        checkTerms()
    }, [])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 10
        if (bottom) setScrolledToBottom(true)
    }

    const handleAccept = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({
                    has_accepted_terms: true,
                    terms_accepted_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (!error) {
                setOpen(false)
                router.refresh()
            } else {
                alert('Detailed Error: ' + error.message)
            }
        }
        setLoading(false)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 bg-slate-50 border-b flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Terms of Responsibility</h2>
                        <p className="text-slate-500">Please review and accept our guidelines to proceed.</p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div
                    className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-700 leading-relaxed"
                    onScroll={handleScroll}
                    ref={scrollRef}
                >
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                            1. Employee Liability & Discretion
                        </h3>
                        <p>
                            As an Employee utilizing ReferKaro, you acknowledge that any referrals you make are done at your <strong>sole discretion and risk</strong>.
                            You agree that:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <li>You are responsible for adhering to your current employer's internal referral policies.</li>
                            <li>ReferKaro is <strong>not liable</strong> for any disciplinary action, policy violation, or conflict of interest arising from your use of this platform.</li>
                            <li>You verify that you have the authority to refer candidates for the roles you post.</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">2. Privacy & Data Integrity</h3>
                        <p>
                            We value privacy. By using ReferKaro, you agree that candidate information shared with you is <strong>confidential</strong> and must not be shared with third parties or used for any purpose other than the intended referral.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">3. Job Seeker Acknowledgments</h3>
                        <p>
                            As a Job Seeker, you understand that:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>A referral does not guarantee a job interview or offer.</li>
                            <li>Token purchases are non-refundable once used for an application.</li>
                            <li>You are responsible for the accuracy of the information provided in your profile and resume.</li>
                        </ul>
                    </div>

                    <div className="p-4 bg-slate-100 rounded text-sm text-slate-600 text-center">
                        Please scroll to the bottom to acknowledge these terms.
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={accepted}
                            onCheckedChange={(checked: boolean | 'indeterminate') => setAccepted(checked === true)}
                            disabled={!scrolledToBottom}
                        />
                        <label
                            htmlFor="terms"
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${!scrolledToBottom ? 'text-gray-400' : 'text-slate-900'}`}
                        >
                            I have read, understood, and accept these responsibilities and terms of use.
                        </label>
                    </div>

                    <Button
                        onClick={handleAccept}
                        disabled={!accepted || loading}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6"
                    >
                        {loading ? 'Processing...' : 'I Acknowledge & Enter Dashboard'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
