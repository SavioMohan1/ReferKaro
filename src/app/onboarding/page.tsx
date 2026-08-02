'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, Loader2, UserRoundSearch } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const roles = [
    {
        id: 'job_seeker' as const,
        icon: UserRoundSearch,
        title: 'I need a referral',
        description: 'Browse approved openings, submit applications with tokens and track each status change.',
        points: ['Purchase application tokens', 'Upload a resume and profile links', 'Track referral application states'],
    },
    {
        id: 'employee' as const,
        icon: BriefcaseBusiness,
        title: 'I can refer candidates',
        description: 'Verify employment, publish referral listings and review candidate applications.',
        points: ['Complete employment verification', 'Create referral listings', 'Review and decide on requests'],
    },
]

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employee' | null>(null)
    const router = useRouter()

    const handleRoleSelection = async () => {
        if (!selectedRole) return

        setLoading(true)
        setError('')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            role: selectedRole,
        })

        if (profileError) {
            console.error('Profile creation failed:', profileError)
            setError('Your profile could not be created. Please try again.')
            setLoading(false)
            return
        }

        router.push('/dashboard')
        router.refresh()
    }

    return (
        <div className="rk-onboarding">
            <div className="rk-shell">
                <Link href="/" className="rk-brand">
                    <span className="rk-brand-mark">RK</span>
                    <span>ReferKaro</span>
                </Link>

                <header className="rk-onboarding-head rk-rise">
                    <div className="rk-eyebrow"><span className="rk-beta">BETA</span> Choose your workspace</div>
                    <h1>Which side of the referral are you on?</h1>
                    <p>This choice shapes your dashboard and available actions. It does not promise a hiring or referral outcome.</p>
                </header>

                <div className="rk-role-grid rk-rise-delay">
                    {roles.map(role => {
                        const Icon = role.icon
                        const selected = selectedRole === role.id

                        return (
                            <button
                                className="rk-card rk-role-card"
                                data-selected={selected}
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                aria-pressed={selected}
                            >
                                <span className="rk-role-icon"><Icon size={24} /></span>
                                <h2>{role.title}</h2>
                                <p>{role.description}</p>
                                <ul>{role.points.map(point => <li key={point}>{point}</li>)}</ul>
                            </button>
                        )
                    })}
                </div>

                <div className="rk-onboarding-action">
                    {error && <div className="rk-alert" role="alert">{error}</div>}
                    <button
                        className="rk-button rk-button-primary"
                        onClick={handleRoleSelection}
                        disabled={!selectedRole || loading}
                    >
                        {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Creating workspace…</> : <>Continue <ArrowRight size={17} /></>}
                    </button>
                </div>
            </div>
        </div>
    )
}
