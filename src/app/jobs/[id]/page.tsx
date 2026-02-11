'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, IndianRupee, TrendingUp, ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import ApplicationModal from '@/components/jobs/application-modal'

const jobTypeLabels: Record<string, string> = {
    full_time: 'Full Time',
    part_time: 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
}

const experienceLevelLabels: Record<string, string> = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior',
    lead: 'Lead',
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [job, setJob] = useState<any>(null)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [hasApplied, setHasApplied] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        const supabase = createClient()

        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select(`
        *,
        profiles:employee_id (full_name, company)
      `)
            .eq('id', id)
            .single()

        if (jobError || !jobData) {
            notFound()
            return
        }

        setJob(jobData)

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // Get user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('token_balance, role')
                .eq('id', user.id)
                .single()

            setUserProfile(profile)

            // Check if already applied
            const { data: application } = await supabase
                .from('applications')
                .select('id')
                .eq('job_id', id)
                .eq('job_seeker_id', user.id)
                .single()

            setHasApplied(!!application)
        }

        setLoading(false)
    }

    const handleApplySuccess = () => {
        setHasApplied(true)
        fetchData() // Refresh data to update token balance
    }

    if (loading || !job) {
        return <div>Loading...</div>
    }

    const canApply = userProfile && userProfile.role === 'job_seeker' && userProfile.token_balance > 0 && !hasApplied

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container max-w-4xl mx-auto px-4">
                <Link href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Jobs
                </Link>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{job.role_title}</h1>
                                <p className="text-xl text-blue-100">{job.company}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-6 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                {jobTypeLabels[job.job_type]}
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {experienceLevelLabels[job.experience_level]}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Posted {new Date(job.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8">
                        {/* Job URL */}
                        {job.job_url && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900 mb-2">
                                    Official Job Posting:
                                </p>
                                <a
                                    href={job.job_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all text-sm"
                                >
                                    {job.job_url}
                                </a>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-bold mb-3">About the Role</h2>
                            <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                        </div>

                        {/* Requirements */}
                        {job.requirements && (
                            <div>
                                <h2 className="text-xl font-bold mb-3">Requirements</h2>
                                <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                            </div>
                        )}

                        {/* Referrer Info */}
                        <div className="bg-slate-50 rounded-lg p-6">
                            <h3 className="font-semibold mb-2">Referred by</h3>
                            <p className="text-gray-700">{job.profiles?.full_name || 'Anonymous Employee'}</p>
                            {job.profiles?.company && (
                                <p className="text-sm text-gray-500">Works at {job.profiles.company}</p>
                            )}
                        </div>

                        {/* Apply Button */}
                        <div className="pt-4">
                            {hasApplied ? (
                                <Button disabled className="w-full h-12 text-lg bg-green-600">
                                    ✓ Application Submitted
                                </Button>
                            ) : !userProfile ? (
                                <Link href="/login">
                                    <Button className="w-full h-12 text-lg">
                                        Login to Apply
                                    </Button>
                                </Link>
                            ) : userProfile.role !== 'job_seeker' ? (
                                <Button disabled className="w-full h-12 text-lg">
                                    Only Job Seekers Can Apply
                                </Button>
                            ) : userProfile.token_balance < 1 ? (
                                <Button className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700">
                                    Buy Tokens to Apply
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setShowModal(true)}
                                    className="w-full h-12 text-lg"
                                >
                                    Apply with 1 Token
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {showModal && (
                <ApplicationModal
                    jobId={job.id}
                    employeeId={job.employee_id}
                    jobTitle={job.role_title}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleApplySuccess}
                />
            )}
        </div>
    )
}
