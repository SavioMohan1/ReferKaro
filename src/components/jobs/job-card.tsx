'use client'

import Link from 'next/link'
import { MapPin, Briefcase, TrendingUp, ArrowRight } from 'lucide-react'

interface Job {
    id: string
    company: string
    role_title: string
    location: string
    job_type: string
    experience_level: string
    referral_fee: number
    created_at: string
}

interface JobCardProps { job: Job }

const jobTypeLabels: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time',
    contract: 'Contract',  internship: 'Internship',
}

const experienceLevelLabels: Record<string, string> = {
    entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead',
}

export default function JobCard({ job }: JobCardProps) {
    return (
        <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
                background: 'rgba(255,255,255,0.033)',
                border: '1px solid rgba(0,240,255,0.12)',
                borderRadius: 16,
                padding: '24px',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'translateY(-4px)'
                    el.style.boxShadow = '0 0 28px rgba(0,240,255,0.15)'
                    el.style.borderColor = 'rgba(0,240,255,0.28)'
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.transform = 'none'
                    el.style.boxShadow = 'none'
                    el.style.borderColor = 'rgba(0,240,255,0.12)'
                }}
            >
                {/* Title + Company */}
                <div>
                    <h3 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#E8EDF5',
                        marginBottom: 4,
                        lineHeight: 1.3,
                    }}>{job.role_title}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#00F0FF', fontWeight: 600 }}>{job.company}</p>
                </div>

                {/* Meta tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                    {[
                        { icon: <MapPin size={12} />, label: job.location },
                        { icon: <Briefcase size={12} />, label: jobTypeLabels[job.job_type] || job.job_type },
                        { icon: <TrendingUp size={12} />, label: experienceLevelLabels[job.experience_level] || job.experience_level },
                    ].map(tag => (
                        <span key={tag.label} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            fontSize: '0.75rem', color: '#6B7A99',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '4px 10px', borderRadius: 999,
                        }}>
                            <span style={{ color: '#00F0FF' }}>{tag.icon}</span>
                            {tag.label}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid rgba(0,240,255,0.07)',
                }}>
                    <span style={{ fontSize: '0.8rem', color: '#6B7A99' }}>
                        {new Date(job.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: '#00F0FF', fontSize: '0.82rem', fontWeight: 600,
                    }}>
                        View Details <ArrowRight size={13} />
                    </span>
                </div>
            </div>
        </Link>
    )
}
