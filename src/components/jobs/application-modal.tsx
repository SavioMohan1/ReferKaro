'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Loader2, Upload, X } from 'lucide-react'

interface ApplicationModalProps {
    jobId: string
    jobTitle: string
    onClose: () => void
    onSuccess: () => void
}

export default function ApplicationModal({ jobId, jobTitle, onClose, onSuccess }: ApplicationModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({ cover_letter: '', linkedin_url: '', portfolio_url: '' })

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        setError('')
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setError('Please sign in before submitting a request.'); setLoading(false); return }

            let resumeUrl = ''
            if (resumeFile) {
                if (resumeFile.type !== 'application/pdf' || !resumeFile.name.toLowerCase().endsWith('.pdf')) {
                    throw new Error('Resume must be a PDF file.')
                }
                if (resumeFile.size > 5 * 1024 * 1024) throw new Error('Resume must be 5MB or smaller.')
                const fileName = `${user.id}/${crypto.randomUUID()}.pdf`
                const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, resumeFile)
                if (uploadError) throw new Error(`Resume upload failed: ${uploadError.message}`)
                resumeUrl = fileName
            }

            const response = await fetch('/api/applications/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    cover_letter: formData.cover_letter,
                    linkedin_url: formData.linkedin_url || null,
                    portfolio_url: formData.portfolio_url || null,
                    resume_url: resumeUrl || null,
                }),
            })
            const result = await response.json()
            if (!response.ok) { setError(result.error || 'The referral request could not be submitted.'); setLoading(false); return }
            onSuccess()
            onClose()
        } catch (submitError) {
            console.error('Error submitting application:', submitError)
            setError(submitError instanceof Error ? submitError.message : 'An unexpected error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="rk-modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
            <section className="rk-modal" role="dialog" aria-modal="true" aria-labelledby="application-title">
                <header className="rk-modal-head">
                    <div><span className="rk-kicker">Referral request</span><h2 id="application-title">Tell them why you fit.</h2><p>{jobTitle}</p></div>
                    <button type="button" onClick={onClose} aria-label="Close application form"><X size={20} /></button>
                </header>
                <form onSubmit={handleSubmit} className="rk-form-stack">
                    <div className="rk-form-note"><strong>1 token will be used</strong><span>when this request is successfully submitted.</span></div>
                    {error && <div className="rk-form-error" role="alert">{error}</div>}
                    <label className="rk-field">
                        <span>Cover letter <b>Required</b></span>
                        <textarea rows={7} required value={formData.cover_letter} onChange={(event) => setFormData({ ...formData, cover_letter: event.target.value })} placeholder="Explain your fit for this specific role and what you would like the employee to know." />
                    </label>
                    <div className="rk-form-pair">
                        <label className="rk-field"><span>LinkedIn URL</span><input type="url" value={formData.linkedin_url} onChange={(event) => setFormData({ ...formData, linkedin_url: event.target.value })} placeholder="https://linkedin.com/in/..." /></label>
                        <label className="rk-field"><span>Portfolio URL <i>Optional</i></span><input type="url" value={formData.portfolio_url} onChange={(event) => setFormData({ ...formData, portfolio_url: event.target.value })} placeholder="https://your-work.com" /></label>
                    </div>
                    <label className="rk-upload-field" htmlFor="resume-upload">
                        <input type="file" id="resume-upload" accept="application/pdf,.pdf" onChange={(event) => setResumeFile(event.target.files?.[0] || null)} />
                        {resumeFile ? <><CheckCircle size={24} /><strong>{resumeFile.name}</strong><span>Selected for upload</span></> : <><Upload size={24} /><strong>Add your resume</strong><span>PDF, up to 5MB</span></>}
                    </label>
                    <div className="rk-modal-actions">
                        <button type="submit" disabled={loading} className="rk-button rk-button-primary">{loading ? <><Loader2 size={16} className="rk-spinner" /> Submitting</> : 'Submit referral request'}</button>
                        <button type="button" onClick={onClose} className="rk-button rk-button-secondary">Cancel</button>
                    </div>
                </form>
            </section>
        </div>
    )
}
