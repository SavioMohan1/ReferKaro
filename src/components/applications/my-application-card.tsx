'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Briefcase, Calendar, Building, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface MyApplicationCardProps {
    application: any
}

export default function MyApplicationCard({ application }: MyApplicationCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [paying, setPaying] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        setPaying(true)
        try {
            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: 'success_fee',
                    amount: 900,
                    tokens: 0,
                    type: 'success_fee',
                    applicationId: application.id
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: 'INR',
                name: 'ReferKaro',
                description: `Success Fee for ${application.jobs?.company}`,
                order_id: data.orderId,
                handler: async function (response: any) {
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
                        alert('Payment Successful! Your Proxy Email is unlocked.')
                        router.refresh()
                    } else {
                        alert('Payment Verification Failed')
                    }
                },
                theme: { color: '#0f172a' }
            }

            const rzp1 = new window.Razorpay(options)
            rzp1.open()
        } catch (error) {
            console.error('Payment failed:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setPaying(false)
        }
    }

    const statusColors = {
        pending: 'bg-orange-100 text-orange-700',
        payment_pending: 'bg-blue-100 text-blue-700 mx-auto',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{application.jobs?.role_title}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{application.jobs?.company}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {new Date(application.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        {application.reviewed_at && (
                            <div className="flex items-center gap-1">
                                <span>• Reviewed {new Date(application.reviewed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status as keyof typeof statusColors]}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <Link href={`/jobs/${application.job_id}`}>
                        <Button variant="outline" size="sm">
                            View Job
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="pt-2">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" /> View Application Details
                        </>
                    )}
                </button>

                <div
                    className={`grid transition-all duration-300 ease-in-out origin-top ${expanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'}`}
                >
                    <div className="overflow-hidden">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="font-semibold text-sm mb-2 text-gray-700">Cover Letter</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
                                {application.cover_letter}
                            </p>

                            <div className="flex gap-4 border-t pt-3 flex-wrap">
                                {application.resume_url && (
                                    <button
                                        onClick={async () => {
                                            const supabase = createClient()
                                            const { data, error } = await supabase.storage
                                                .from('resumes')
                                                .createSignedUrl(application.resume_url, 60)
                                            if (data) window.open(data.signedUrl, '_blank')
                                            if (error) alert('Error opening resume')
                                        }}
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 transition-transform hover:scale-105"
                                    >
                                        <ExternalLink className="h-3 w-3" /> View Resume
                                    </button>
                                )}
                                {application.linkedin_url && (
                                    <a
                                        href={application.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 transition-transform hover:scale-105"
                                    >
                                        <ExternalLink className="h-3 w-3" /> LinkedIn Profile
                                    </a>
                                )}
                                {application.portfolio_url && (
                                    <a
                                        href={application.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 transition-transform hover:scale-105"
                                    >
                                        <ExternalLink className="h-3 w-3" /> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {application.status === 'payment_pending' && (
                <div className="mt-4 p-5 bg-blue-50 border border-blue-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">🎉 Application Accepted!</h4>
                        <p className="text-sm text-blue-800">
                            The referrer has agreed to refer you. Pay the ₹900 Success Fee to unlock your secure referral tracking email.
                        </p>
                    </div>
                    <Button
                        onClick={handlePayment}
                        disabled={paying}
                        className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-700"
                    >
                        {paying ? 'Processing...' : 'Pay ₹900 Now'}
                    </Button>
                </div>
            )}

            {application.status === 'accepted' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        <strong>🎉 All set!</strong> Your application was accepted and your Success Fee is paid. Check your email for your unique referral tracking inbox details.
                    </p>
                </div>
            )}
        </div>
    )
}
