'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
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

    useEffect(() => {
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

            if (profile.company) {
                setFormData(prev => ({ ...prev, company: profile.company }))
            }

            setLoading(false)
        }

        checkVerification()
    }, [router])

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
            <div className="page-wrapper" style={{ paddingTop: 80, paddingBottom: 80 }}>
                <div className="page-container" style={{ maxWidth: 720 }}>
                    <div className="dk-card" style={{ padding: '40px 36px' }}>
                        <div className="animate-shimmer" style={{ height: 32, width: '33%', borderRadius: 8, background: 'rgba(0,240,255,0.06)' }} />
                        <div className="animate-shimmer" style={{ height: 48, width: '100%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 32 }} />
                        <div className="animate-shimmer" style={{ height: 48, width: '100%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 16 }} />
                        <div className="animate-shimmer" style={{ height: 128, width: '100%', borderRadius: 8, background: 'rgba(0,240,255,0.06)', marginTop: 16 }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-wrapper" style={{ paddingTop: 80, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
            <div className="glow-orb glow-violet" style={{ width: 350, height: 350, top: -60, right: -60, opacity: 0.3 }} />
            <div className="glow-orb glow-cyan" style={{ width: 300, height: 300, bottom: -60, left: -60, opacity: 0.25 }} />

            <div className="page-container" style={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
                <Link href="/dashboard" className="dk-btn-ghost" style={{ marginBottom: 28, display: 'inline-flex' }}>
                    <ArrowLeft size={15} /> Back to Dashboard
                </Link>

                <div className="dk-card" style={{ padding: '40px 36px' }}>
                    <span className="dk-chip" style={{ marginBottom: 16, display: 'inline-block' }}>New Listing</span>
                    <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.8rem', color: '#E8EDF5', marginBottom: 6 }}>Create Job Listing</h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem', marginBottom: 32 }}>Post a new job opening and start receiving applications</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Company & Role */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Company *</label>
                                <input type="text" required className="dk-input" value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="e.g., Google" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Role Title *</label>
                                <input type="text" required className="dk-input" value={formData.role_title}
                                    onChange={(e) => setFormData({ ...formData, role_title: e.target.value })} placeholder="e.g., Software Engineer" />
                            </div>
                        </div>

                        {/* Department & Location */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Department</label>
                                <input type="text" className="dk-input" value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Engineering" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Location *</label>
                                <input type="text" required className="dk-input" value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g., Bangalore, Remote" />
                            </div>
                        </div>

                        {/* Job Type & Experience */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Job Type *</label>
                                <select className="dk-input" value={formData.job_type}
                                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}>
                                    <option value="full_time">Full Time</option>
                                    <option value="part_time">Part Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Experience Level *</label>
                                <select className="dk-input" value={formData.experience_level}
                                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}>
                                    <option value="entry">Entry Level</option>
                                    <option value="mid">Mid Level</option>
                                    <option value="senior">Senior</option>
                                    <option value="lead">Lead/Principal</option>
                                </select>
                            </div>
                        </div>

                        {/* Referral Type Selection */}
                        <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: 14, padding: '24px 24px 20px' }}>
                            <label style={{ display: 'block', fontFamily: 'var(--font-head)', fontSize: '1rem', color: '#E8EDF5', marginBottom: 16 }}>Referral Format</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
                                <button type="button" onClick={() => setFormData({ ...formData, referral_type: 'single' })}
                                    style={{
                                        padding: 20, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                        background: formData.referral_type === 'single' ? 'rgba(123,94,255,0.08)' : 'rgba(255,255,255,0.02)',
                                        border: `2px solid ${formData.referral_type === 'single' ? '#7B5EFF' : 'rgba(0,240,255,0.1)'}`,
                                        transition: 'all 0.2s',
                                    }}>
                                    <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.9rem', color: '#E8EDF5', marginBottom: 6 }}>💎 Single Referral</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7A99', lineHeight: 1.5, marginBottom: 8 }}>Pure 1-on-1 interaction. You review seekers as they apply.</p>
                                    <p style={{ fontSize: '0.7rem', color: '#7B5EFF', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Premium Track (10 Tokens total)</p>
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, referral_type: 'pooling' })}
                                    style={{
                                        padding: 20, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                                        background: formData.referral_type === 'pooling' ? 'rgba(0,240,255,0.06)' : 'rgba(255,255,255,0.02)',
                                        border: `2px solid ${formData.referral_type === 'pooling' ? '#00F0FF' : 'rgba(0,240,255,0.1)'}`,
                                        transition: 'all 0.2s',
                                    }}>
                                    <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '0.9rem', color: '#E8EDF5', marginBottom: 6 }}>🌊 Pooling System</h4>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7A99', lineHeight: 1.5, marginBottom: 8 }}>Collect 10 applicants first. AI will rank them for you to pick the best.</p>
                                    <p style={{ fontSize: '0.7rem', color: '#00F0FF', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Budget Track (1 Token total)</p>
                                </button>
                            </div>

                            {formData.referral_type === 'pooling' && (
                                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,240,255,0.08)' }}>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Desired Pool Size</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input type="number" min="2" max="50" className="dk-input" style={{ width: 80 }}
                                            value={formData.pool_size}
                                            onChange={(e) => setFormData({ ...formData, pool_size: parseInt(e.target.value) })} />
                                        <span style={{ fontSize: '0.8rem', color: '#6B7A99', fontStyle: 'italic' }}>Recommended: 10 per pool</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Job Description *</label>
                            <textarea required rows={6} className="dk-input" style={{ resize: 'vertical' }}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role, responsibilities, and what makes this opportunity great..." />
                        </div>

                        {/* Requirements */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Requirements</label>
                            <textarea rows={4} className="dk-input" style={{ resize: 'vertical' }}
                                value={formData.requirements}
                                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="List key skills, qualifications, and experience needed..." />
                        </div>

                        {/* Job URL */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500, color: '#B0BAD4' }}>Official Job Posting URL</label>
                            <input type="url" className="dk-input" value={formData.job_url}
                                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                                placeholder="https://company.com/careers/job-id" />
                            <p style={{ fontSize: '0.8rem', color: '#6B7A99', marginTop: 6 }}>Link to the official job posting to verify authenticity</p>
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                            <button type="submit" disabled={loading} className="dk-btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '13px 24px' }}>
                                {loading ? 'Creating...' : 'Create Job Listing'}
                            </button>
                            <button type="button" onClick={() => router.back()} className="dk-btn-outline" style={{ padding: '13px 24px' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
