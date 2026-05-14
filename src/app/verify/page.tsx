"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Upload, Loader2, CheckCircle, XCircle, FileText } from "lucide-react"

export default function VerifyPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [verifying, setVerifying] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        fullName: '',
        company: '',
        role: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, company')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: profile.full_name || '',
                        company: profile.company || ''
                    }))
                }
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile))
            } else {
                setPreview(null)
            }
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setVerifying(true)
        setResult(null)

        const apiFormData = new FormData()
        apiFormData.append('file', file)
        apiFormData.append('fullName', formData.fullName)
        apiFormData.append('company', formData.company)
        apiFormData.append('role', formData.role)

        try {
            const response = await fetch('/api/verify-employment', {
                method: 'POST',
                body: apiFormData
            })

            const data = await response.json()
            setResult(data)

            if (data.success && data.status === 'verified') {
                setTimeout(() => router.push('/dashboard'), 3000)
            }
        } catch (error) {
            console.error('Verification failed', error)
            alert('Verification failed. Please try again.')
        } finally {
            setVerifying(false)
        }
    }

    if (loading) {
        return (
            <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div className="dk-card" style={{ width: '100%', maxWidth: 520, padding: '40px 36px' }}>
                    <div className="animate-shimmer" style={{ height: 32, width: '50%', borderRadius: 8, background: 'rgba(0,240,255,0.06)' }} />
                    <div className="animate-shimmer" style={{ height: 16, width: '75%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 12 }} />
                    <div className="animate-shimmer" style={{ height: 40, width: '100%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 24 }} />
                    <div className="animate-shimmer" style={{ height: 40, width: '100%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 12 }} />
                    <div className="animate-shimmer" style={{ height: 128, width: '100%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 24 }} />
                </div>
            </div>
        )
    }

    return (
        <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div className="glow-orb glow-violet" style={{ width: 380, height: 380, top: -80, right: -80, opacity: 0.3 }} />
            <div className="glow-orb glow-cyan" style={{ width: 320, height: 320, bottom: -80, left: -80, opacity: 0.25 }} />

            <div className="dk-card" style={{ width: '100%', maxWidth: 520, padding: '40px 36px', position: 'relative', zIndex: 1 }}>
                <span className="dk-chip" style={{ marginBottom: 16, display: 'inline-block' }}>Verification</span>
                <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#E8EDF5', marginBottom: 6 }}>
                    Verify Your Employment
                </h1>
                <p style={{ color: '#6B7A99', fontSize: '0.9rem', marginBottom: 28 }}>
                    Enter your details and upload your ID Card or Offer Letter.
                </p>

                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Manual Entry Fields */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Full Name (as on ID) *</label>
                        <input type="text" required className="dk-input" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="e.g. John Doe" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Current Company *</label>
                        <input type="text" required className="dk-input" value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g. Google" />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Job Role / Designation *</label>
                        <input type="text" required className="dk-input" value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Senior Software Engineer" />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Upload ID Card / Offer Letter *</label>
                        <div style={{
                            border: '2px dashed rgba(0,240,255,0.2)',
                            borderRadius: 12, padding: '32px 24px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,240,255,0.02)',
                            position: 'relative', cursor: 'pointer',
                            transition: 'border-color 0.2s',
                        }}>
                            <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                                required
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            />

                            {preview ? (
                                <img src={preview} alt="ID Preview" style={{ height: 160, objectFit: 'contain', borderRadius: 8 }} />
                            ) : file ? (
                                <div style={{ textAlign: 'center' }}>
                                    <FileText size={40} color="#7B5EFF" style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontWeight: 500, color: '#E8EDF5', fontSize: '0.9rem' }}>{file.name}</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <Upload size={40} color="#6B7A99" style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontWeight: 500, color: '#E8EDF5', fontSize: '0.9rem' }}>Click to Upload</p>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7A99', marginTop: 4 }}>Image or PDF (Max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <div style={{
                            padding: '20px 24px', borderRadius: 12,
                            background: result.status === 'verified'
                                ? 'rgba(34,197,94,0.08)'
                                : result.status === 'pending'
                                    ? 'rgba(251,191,36,0.08)'
                                    : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${result.status === 'verified'
                                ? 'rgba(34,197,94,0.25)'
                                : result.status === 'pending'
                                    ? 'rgba(251,191,36,0.25)'
                                    : 'rgba(239,68,68,0.25)'}`,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                {result.status === 'verified'
                                    ? <CheckCircle size={20} color="#22C55E" />
                                    : result.status === 'pending'
                                        ? <Loader2 size={20} color="#F59E0B" />
                                        : <XCircle size={20} color="#EF4444" />}
                                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: '#E8EDF5' }}>
                                    {result.message}
                                </h3>
                            </div>
                            {result.feedback && (
                                <p style={{ fontSize: '0.85rem', color: '#6B7A99', lineHeight: 1.6 }}>{result.feedback}</p>
                            )}
                            {result.score && (
                                <p style={{ fontSize: '0.8rem', color: '#6B7A99', marginTop: 8 }}>Confidence Score: <strong style={{ color: '#E8EDF5' }}>{result.score}%</strong></p>
                            )}
                            {result.status === 'verified' && (
                                <p style={{ fontSize: '0.8rem', color: '#22C55E', marginTop: 10 }}>Redirecting to dashboard...</p>
                            )}
                            {result.status === 'pending' && (
                                <button type="button" onClick={() => router.push('/dashboard')} className="dk-btn-outline" style={{ marginTop: 12, fontSize: '0.85rem' }}>
                                    Go to Dashboard
                                </button>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={verifying || !file}
                        className="dk-btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', opacity: (verifying || !file) ? 0.5 : 1 }}
                    >
                        {verifying ? (
                            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                        ) : (
                            'Verify Employment'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
