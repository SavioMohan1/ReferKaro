'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Upload, FileText, CheckCircle } from 'lucide-react'

interface ApplicationModalProps {
    jobId: string
    employeeId: string
    jobTitle: string
    onClose: () => void
    onSuccess: () => void
}

export default function ApplicationModal({
    jobId,
    employeeId,
    jobTitle,
    onClose,
    onSuccess
}: ApplicationModalProps) {
    const [loading, setLoading] = useState(false)
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        cover_letter: '',
        linkedin_url: '',
        portfolio_url: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('Please login to apply')
                return
            }

            let resumeUrl = ''

            // Upload resume if selected
            if (resumeFile) {
                const fileExt = resumeFile.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(fileName, resumeFile)

                if (uploadError) {
                    throw new Error('Resume upload failed: ' + uploadError.message)
                }

                // Get public URL (or signed URL depending on policy, public is easier for MVP)
                // Note: For private buckets we usually use createSignedUrl, but for this MVP 
                // we'll assume the bucket is private but we generate a signed URL on view.
                // However, storing the path is better. Let's store the full path.
                resumeUrl = fileName
            }

            // Call API route to handle application with token deduction
            const response = await fetch('/api/applications/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    employee_id: employeeId,
                    cover_letter: formData.cover_letter,
                    linkedin_url: formData.linkedin_url || null,
                    portfolio_url: formData.portfolio_url || null,
                    resume_url: resumeUrl || null,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                alert(result.error || 'Failed to submit application')
                setLoading(false)
                return
            }

            // Success
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error submitting application:', error)
            alert('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Apply for Referral</h2>
                        <p className="text-gray-600 mt-1">{jobTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Submitting this application will deduct 1 token from your balance.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Cover Letter *
                        </label>
                        <textarea
                            required
                            rows={8}
                            className="w-full rounded-md border p-3"
                            value={formData.cover_letter}
                            onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                            placeholder="Introduce yourself and explain why you're a great fit for this role..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            LinkedIn Profile URL
                        </label>
                        <input
                            type="url"
                            className="w-full rounded-md border p-2"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/yourprofile"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Portfolio URL (Optional)
                        </label>
                        <input
                            type="url"
                            className="w-full rounded-md border p-2"
                            value={formData.portfolio_url}
                            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                            placeholder="https://yourportfolio.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Resume (PDF/DOCX)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="resume-upload" className="cursor-pointer block">
                                {resumeFile ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <CheckCircle className="h-6 w-6" />
                                        <span className="font-medium">{resumeFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <span>Click to upload resume</span>
                                        <span className="text-xs text-gray-400">Max 5MB (PDF or DOCX)</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Submitting...' : 'Submit Application (1 Token)'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
