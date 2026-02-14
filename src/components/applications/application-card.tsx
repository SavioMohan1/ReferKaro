'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { User, Briefcase, Calendar, ExternalLink, Check, X, Copy, Mail, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ApplicationCardProps {
    application: any
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(application.status)
    // Initialize with existing proxy email if available (it comes as an array from Supabase)
    const initialProxy = application.proxy_emails?.[0]?.proxy_address || null
    const [proxyEmail, setProxyEmail] = useState<string | null>(initialProxy)
    const [analyzing, setAnalyzing] = useState(false)
    const [aiResult, setAiResult] = useState<any>(null)
    const router = useRouter()

    const handleAnalyze = async () => {
        setAnalyzing(true)
        try {
            const response = await fetch('/api/ai/analyze-resume', {
                method: 'POST',
                body: JSON.stringify({ applicationId: application.id })
            })
            const data = await response.json()
            if (data.error) throw new Error(data.error)
            setAiResult(data.analysis)
        } catch (error: any) {
            alert(error.message || 'Analysis failed')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleStatusUpdate = async (newStatus: 'accepted' | 'rejected') => {
        setLoading(true)

        try {
            const response = await fetch('/api/applications/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    applicationId: application.id,
                    status: newStatus,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update application')
            }

            setStatus(newStatus)
            if (data.proxyEmail) {
                setProxyEmail(data.proxyEmail)
            }
            router.refresh()
        } catch (error: any) {
            console.error('Error updating status:', error)
            alert(error.message || 'Failed to update application status')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert('Copied to clipboard!')
    }

    const statusColors = {
        pending: 'bg-orange-100 text-orange-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 rounded-full p-2">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{application.profiles?.full_name || 'Anonymous'}</h3>
                            <p className="text-sm text-gray-500">{application.profiles?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            <span>{application.jobs?.role_title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Applied {new Date(application.applied_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold mb-2">Cover Letter</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
                    {application.cover_letter}
                </p>

                <div className="flex gap-3 mt-3 flex-wrap items-center">
                    {application.resume_url && (
                        <>
                            <button
                                onClick={async () => {
                                    const supabase = createClient()
                                    const { data, error } = await supabase.storage
                                        .from('resumes')
                                        .createSignedUrl(application.resume_url, 60)
                                    if (data) window.open(data.signedUrl, '_blank')
                                    if (error) alert('Error opening resume')
                                }}
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-md"
                            >
                                <ExternalLink className="h-3 w-3" /> View Resume
                            </button>

                            {/* AI Analysis Button */}
                            <Button
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                size="sm"
                                variant="outline"
                                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            >
                                {analyzing ? 'Analyzing...' : '⚡ Analyze Match'}
                            </Button>
                        </>
                    )}
                    {application.linkedin_url && (
                        <a
                            href={application.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            LinkedIn <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                    {application.portfolio_url && (
                        <a
                            href={application.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            Portfolio <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </div>

            {/* AI Results Display */}
            {aiResult && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-purple-900 flex items-center gap-2">
                            <span>⚡ AI Match Score</span>
                        </h4>
                        <span className={`text-xl font-bold px-3 py-1 rounded-lg ${aiResult.score >= 80 ? 'bg-green-100 text-green-700' :
                            aiResult.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {aiResult.score}/100
                        </span>
                    </div>

                    <p className="text-sm text-purple-800 mb-3 italic">"{aiResult.summary}"</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-green-700 mb-1">Pros</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600">
                                {aiResult.pros.map((p: string, i: number) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold text-red-700 mb-1">Cons</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600">
                                {aiResult.cons.map((c: string, i: number) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {status === 'pending' && (
                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={() => handleStatusUpdate('accepted')}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Accept & Refer
                    </Button>
                    <Button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                </div>
            )}

            {/* Proxy Email Display */}
            {status === 'accepted' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="flex items-center text-green-800 font-bold mb-2">
                        <Check className="h-5 w-5 mr-2" />
                        Candidate Accepted!
                    </h4>

                    {proxyEmail ? (
                        <div className="mt-3">
                            <p className="text-sm text-green-800 mb-2">
                                Use this <strong>Secure Proxy Email</strong> to refer the candidate in your company portal:
                            </p>
                            <div className="flex items-center gap-2 bg-white border border-green-300 p-2 rounded-md">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <code className="flex-1 font-mono text-sm text-gray-800">{proxyEmail}</code>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 hover:bg-green-100"
                                    onClick={() => copyToClipboard(proxyEmail)}
                                >
                                    <Copy className="h-4 w-4 text-green-700" />
                                </Button>
                            </div>
                            <div className="flex items-start gap-2 mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <p>
                                    <strong>Important:</strong> Do NOT use their personal email. Updates sent to this proxy email will be automatically tracked by ReferKaro.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-green-800">
                            Refresh the page to see the unique referral email for this candidate.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
