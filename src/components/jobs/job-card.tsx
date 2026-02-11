import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, IndianRupee, TrendingUp } from 'lucide-react'

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

interface JobCardProps {
    job: Job
}

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

export default function JobCard({ job }: JobCardProps) {
    return (
        <Link href={`/jobs/${job.id}`}>
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{job.role_title}</h3>
                        <p className="text-lg text-gray-700 font-medium">{job.company}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {jobTypeLabels[job.job_type] || job.job_type}
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {experienceLevelLabels[job.experience_level] || job.experience_level}
                    </div>
                </div>

                <Button className="w-full" size="sm">
                    View Details
                </Button>
            </div>
        </Link>
    )
}
