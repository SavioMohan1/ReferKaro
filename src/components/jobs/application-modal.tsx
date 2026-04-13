'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, CheckCircle, Loader2 } from 'lucide-react'

interface ApplicationModalProps {
    jobId: string; employeeId: string; jobTitle: string
    onClose: () => void; onSuccess: () => void
}

export default function ApplicationModal({ jobId, employeeId, jobTitle, onClose, onSuccess }: ApplicationModalProps) {
    const [loading, setLoading] = useState(false)
    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({ cover_letter: '', linkedin_url: '', portfolio_url: '' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { alert('Please login to apply'); return }

            let resumeUrl = ''
            if (resumeFile) {
                const fileExt = resumeFile.name.split('.').pop()
                const fileName = `${user.id}/${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, resumeFile)
                if (uploadError) throw new Error('Resume upload failed: ' + uploadError.message)
                resumeUrl = fileName
            }

            const response = await fetch('/api/applications/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId, employee_id: employeeId,
                    cover_letter: formData.cover_letter,
                    linkedin_url: formData.linkedin_url || null,
                    portfolio_url: formData.portfolio_url || null,
                    resume_url: resumeUrl || null,
                }),
            })
            const result = await response.json()
            if (!response.ok) { alert(result.error || 'Failed to submit application'); setLoading(false); return }
            onSuccess(); onClose()
        } catch (error) {
            console.error('Error submitting application:', error)
            alert('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: 8, resize: 'none' as const,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,240,255,0.14)',
        color: '#E8EDF5', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none',
    }

    return (
        /* Backdrop */
        <div style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>

            <div style={{
                background: '#080E1C',
                border: '1px solid rgba(0,240,255,0.16)',
                borderRadius: 20,
                width: '100%', maxWidth: 620,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 0 60px rgba(0,240,255,0.08)',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '28px 32px 24px',
                    borderBottom: '1px solid rgba(0,240,255,0.08)',
                }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.2rem', color: '#E8EDF5', marginBottom: 4 }}>
                            Request Profile Review &amp; Referral
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#00F0FF', fontWeight: 600 }}>{jobTitle}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7A99', padding: 4, transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E8EDF5')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
                    {/* Token notice */}
                    <div style={{
                        background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.18)',
                        borderRadius: 10, padding: '12px 16px',
                        fontSize: '0.85rem', color: '#6B7A99',
                    }}>
                        <strong style={{ color: '#E8EDF5' }}>Heads up:</strong> Submitting this application will deduct{' '}
                        <strong style={{ color: '#00F0FF' }}>1 token</strong> from your balance.
                    </div>

                    {/* Cover letter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>
                            Cover Letter <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea rows={7} required style={inputStyle}
                            value={formData.cover_letter}
                            onChange={e => setFormData({ ...formData, cover_letter: e.target.value })}
                            placeholder="Introduce yourself and explain why you're a great fit for this role..."
                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.14)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* LinkedIn */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>
                            LinkedIn Profile URL
                        </label>
                        <input type="url" style={inputStyle}
                            value={formData.linkedin_url}
                            onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/yourprofile"
                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.14)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Portfolio */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>
                            Portfolio URL <span style={{ color: '#6B7A99', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <input type="url" style={inputStyle}
                            value={formData.portfolio_url}
                            onChange={e => setFormData({ ...formData, portfolio_url: e.target.value })}
                            placeholder="https://yourportfolio.com"
                            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08)' }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.14)'; e.currentTarget.style.boxShadow = 'none' }}
                        />
                    </div>

                    {/* Resume upload */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>
                            Resume (PDF / DOCX)
                        </label>
                        <div style={{
                            border: '2px dashed rgba(0,240,255,0.2)', borderRadius: 12, padding: '24px 20px',
                            textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)')}
                        >
                            <input type="file" id="resume-upload" style={{ display: 'none' }}
                                accept=".pdf,.doc,.docx"
                                onChange={e => setResumeFile(e.target.files?.[0] || null)}
                            />
                            <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                {resumeFile ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#22C55E' }}>
                                        <CheckCircle size={20} />
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{resumeFile.name}</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#6B7A99' }}>
                                        <Upload size={26} color="rgba(0,240,255,0.4)" />
                                        <span style={{ fontSize: '0.875rem' }}>Click to upload resume</span>
                                        <span style={{ fontSize: '0.75rem', color: '#6B7A99' }}>Max 5MB · PDF or DOCX</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                        <button type="submit" disabled={loading} className="dk-btn-primary"
                            style={{ flex: 1, justifyContent: 'center', padding: '13px 20px', fontSize: '0.9rem', opacity: loading ? 0.65 : 1 }}>
                            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : 'Request Review & Referral (1 Token)'}
                        </button>
                        <button type="button" onClick={onClose} className="dk-btn-outline" style={{ padding: '13px 20px' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
