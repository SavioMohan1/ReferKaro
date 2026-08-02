import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, MapPin, TrendingUp } from 'lucide-react'

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

const jobTypeLabels: Record<string, string> = { full_time: 'Full time', part_time: 'Part time', contract: 'Contract', internship: 'Internship' }
const experienceLevelLabels: Record<string, string> = { entry: 'Entry level', mid: 'Mid level', senior: 'Senior', lead: 'Lead' }

export default function JobCard({ job, index }: { job: Job; index: number }) {
    return (
        <Link href={`/jobs/${job.id}`} className="rk-job-card">
            <div className="rk-job-card-top">
                <span>{String(index).padStart(2, '0')}</span>
                <span>{new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="rk-company-monogram" aria-hidden="true">{job.company.slice(0, 2).toUpperCase()}</div>
            <div className="rk-job-card-copy">
                <span>{job.company}</span>
                <h2>{job.role_title}</h2>
            </div>
            <div className="rk-job-meta">
                <span><MapPin size={13} /> {job.location}</span>
                <span><BriefcaseBusiness size={13} /> {jobTypeLabels[job.job_type] || job.job_type}</span>
                <span><TrendingUp size={13} /> {experienceLevelLabels[job.experience_level] || job.experience_level}</span>
            </div>
            <div className="rk-job-card-action">Read role details <ArrowUpRight size={17} /></div>
        </Link>
    )
}
