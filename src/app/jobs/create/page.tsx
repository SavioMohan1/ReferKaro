'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true) // Start loading initially
    const [formData, setFormData] = useState({
        company: '',
        role_title: '',
        department: '',
        location: '',
        job_type: 'full_time',
        experience_level: 'mid',
        description: '',
        requirements: '',
        job_url: '',
        referral_type: 'single',
        pool_size: 10,
    })

    // Check verification status on load
    useState(() => {
        const checkVerification = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_verified, company')
                .eq('id', user.id)
                .single()

            if (!profile?.is_verified) {
                router.push('/verify')
                return
            }

            // Auto-fill company if available
            if (profile.company) {
                setFormData(prev => ({ ...prev, company: profile.company }))
            }

            setLoading(false)
        }

        checkVerification()
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const { error } = await supabase.from('jobs').insert({
            employee_id: user.id,
            company: formData.company,
            role_title: formData.role_title,
            department: formData.department || null,
            location: formData.location,
            job_type: formData.job_type,
            experience_level: formData.experience_level,
            description: formData.description,
            requirements: formData.requirements || null,
            job_url: formData.job_url || null,
            referral_type: formData.referral_type,
            pool_size: formData.referral_type === 'pooling' ? formData.pool_size : null,
            referral_fee: 500,
        })

        if (error) {
            console.error('Error creating job:', error)
            alert('Error creating job listing. Please try again.')
            setLoading(false)
            return
        }

        router.push('/dashboard')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
                <div className="max-w-2xl w-full bg-white rounded-xl shadow-md p-8 space-y-6">
                    <div className="h-8 w-1/3 animate-shimmer rounded-md bg-slate-200"></div>
                    <div className="h-12 w-full animate-shimmer rounded-md bg-slate-200 mt-8"></div>
                    <div className="h-12 w-full animate-shimmer rounded-md bg-slate-200"></div>
                    <div className="h-32 w-full animate-shimmer rounded-md bg-slate-200"></div>
                    <div className="h-12 w-full animate-shimmer rounded-md bg-slate-200 mt-6"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container max-w-3xl mx-auto px-4">
                <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-3xl font-bold mb-2">Create Job Listing</h1>
                    <p className="text-gray-600 mb-8">Post a new job opening and start receiving applications</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company & Role */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Company *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border p-2"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g., Google"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Role Title *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border p-2"
                                    value={formData.role_title}
                                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                                    placeholder="e.g., Software Engineer"
                                />
                            </div>
                        </div>

                        {/* Department & Location */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Department</label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border p-2"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="e.g., Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Location *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border p-2"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Bangalore, Remote"
                                />
                            </div>
                        </div>

                        {/* Job Type & Experience */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Job Type *</label>
                                <select
                                    className="w-full rounded-md border p-2"
                                    value={formData.job_type}
                                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                                >
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Experience Level *</label>
                                <select
                                    className="w-full rounded-md border p-2 text-sm"
                                    value={formData.experience_level}
                                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                                >
                                    <option value="entry">Entry Level</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior</option>
                                    <option value="lead">Lead/Principal</option>
                                </select>
                            </div>
                        </div>

                        {/* Referral Type Selection */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                            <label className="block text-lg font-bold">Referral Format</label>
                            <div className="grid md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, referral_type: 'single' })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.referral_type === 'single' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-1 mb-2">💎 Single Referral</h4>
                                    <p className="text-xs text-slate-600">Pure 1-on-1 interaction. You review seekers as they apply.</p>
                                    <p className="text-[10px] mt-2 text-blue-600 font-bold uppercase tracking-wider">Premium Track (10 Tokens total)</p>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, referral_type: 'pooling' })}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.referral_type === 'pooling' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                >
                                    <h4 className="font-bold text-blue-900 border-b border-blue-100 pb-1 mb-2">🌊 Pooling System</h4>
                                    <p className="text-xs text-slate-600">Collect 10 applicants first. AI will rank them for you to pick the best.</p>
                                    <p className="text-[10px] mt-2 text-blue-600 font-bold uppercase tracking-wider">Budget Track (1 Token total)</p>
                                </button>
                            </div>

                            {formData.referral_type === 'pooling' && (
                                <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium mb-2">Desired Pool Size (Applicants to collect)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            min="2"
                                            max="50"
                                            className="w-24 rounded-md border p-2"
                                            value={formData.pool_size}
                                            onChange={(e) => setFormData({ ...formData, pool_size: parseInt(e.target.value) })}
                                        />
                                        <span className="text-sm text-slate-500 italic">Recommended: 10 per pool</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Job Description *</label>
                            <textarea
                                required
                                rows={6}
                                className="w-full rounded-md border p-2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                            />
                        </div>

                        {/* Requirements */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Requirements</label>
                            <textarea
                                rows={4}
                                className="w-full rounded-md border p-2"
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="List key skills, qualifications, and experience needed..."
                            />
                        </div>

                        {/* Job URL */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Official Job Posting URL</label>
                            <input
                                type="url"
                                className="w-full rounded-md border p-2"
                                value={formData.job_url}
                                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                                placeholder="https://company.com/careers/job-id"
                            />
                            <p className="text-sm text-gray-500 mt-1">Link to the official job posting to verify authenticity</p>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Creating...' : 'Create Job Listing'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
