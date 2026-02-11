'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Briefcase, User } from 'lucide-react'

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employee' | null>(null)
    const router = useRouter()

    const handleRoleSelection = async () => {
        if (!selectedRole) return

        setLoading(true)
        const supabase = createClient()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        // Create profile
        const { error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name || user.email?.split('@')[0],
                role: selectedRole,
                token_balance: selectedRole === 'job_seeker' ? 0 : null,
            })

        if (error) {
            console.error('Error creating profile:', error)
            alert('Error creating profile. Please try again.')
            setLoading(false)
            return
        }

        // Redirect to dashboard
        router.push('/dashboard')
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-blue-600 mb-4">
                        <ShieldCheck className="h-8 w-8" />
                        <span>ReferKaro</span>
                    </div>
                    <h1 className="text-3xl font-bold">Welcome aboard!</h1>
                    <p className="text-gray-500 mt-2">How would you like to use ReferKaro?</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Job Seeker Card */}
                    <button
                        onClick={() => setSelectedRole('job_seeker')}
                        className={`
              p-8 rounded-xl border-2 transition-all hover:shadow-lg
              ${selectedRole === 'job_seeker'
                                ? 'border-blue-600 bg-blue-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }
            `}
                    >
                        <User className="h-12 w-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">I'm looking for a job</h3>
                        <p className="text-sm text-gray-600">
                            Get referred to top companies by verified employees
                        </p>
                        <ul className="mt-4 space-y-2 text-left text-sm text-gray-600">
                            <li>✓ Buy application tokens</li>
                            <li>✓ Apply for referrals</li>
                            <li>✓ Track application status</li>
                        </ul>
                    </button>

                    {/* Employee Card */}
                    <button
                        onClick={() => setSelectedRole('employee')}
                        className={`
              p-8 rounded-xl border-2 transition-all hover:shadow-lg
              ${selectedRole === 'employee'
                                ? 'border-green-600 bg-green-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-green-300'
                            }
            `}
                    >
                        <Briefcase className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">I can refer candidates</h3>
                        <p className="text-sm text-gray-600">
                            Earn money by reviewing profiles and providing referrals
                        </p>
                        <ul className="mt-4 space-y-2 text-left text-sm text-gray-600">
                            <li>✓ Review applications</li>
                            <li>✓ Earn per referral</li>
                            <li>✓ Help job seekers</li>
                        </ul>
                    </button>
                </div>

                <Button
                    onClick={handleRoleSelection}
                    disabled={!selectedRole || loading}
                    className="w-full h-12 text-lg"
                >
                    {loading ? 'Setting up your account...' : 'Continue'}
                </Button>
            </div>
        </div>
    )
}
