'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Briefcase, Calendar, Building, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface MyApplicationCardProps {
    application: any
}

export default function MyApplicationCard({ application }: MyApplicationCardProps) {
    const [expanded, setExpanded] = useState(false)

    const statusColors = {
        pending: 'bg-orange-100 text-orange-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
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

                {expanded && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 animate-in slide-in-from-top-2">
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
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3 w-3" /> View Resume
                                </button>
                            )}
                            {application.linkedin_url && (
                                <a
                                    href={application.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3 w-3" /> LinkedIn Profile
                                </a>
                            )}
                            {application.portfolio_url && (
                                <a
                                    href={application.portfolio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3 w-3" /> Portfolio
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {application.status === 'accepted' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        <strong>🎉 Start preparing!</strong> The employee has accepted your request and will be referring you shortly.
                    </p>
                </div>
            )}
        </div>
    )
}
