'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Coins, ArrowRight, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface JobSeekerDashboardProps {
    profile: any
    user: any
}

export default function JobSeekerDashboard({ profile, user }: JobSeekerDashboardProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <Navbar profile={profile} user={user} />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Token Balance Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 mb-2">Your Token Balance</p>
                                <div className="flex items-center gap-3">
                                    <Coins className="h-10 w-10" />
                                    <h2 className="text-5xl font-bold">{profile.token_balance || 0}</h2>
                                </div>
                                <p className="text-blue-100 mt-2 text-sm">1 token = 1 referral application</p>
                            </div>
                            <Link href="/buy-tokens">
                                <Button className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8">
                                    Buy Tokens
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold mb-2">Browse Referrals</h3>
                            <p className="text-gray-600 mb-4">
                                Find companies hiring and connect with employees who can refer you
                            </p>
                            <Link href="/jobs">
                                <Button className="w-full">
                                    Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold mb-2">My Applications</h3>
                            <p className="text-gray-600 mb-4">
                                Track the status of your referral requests
                            </p>
                            <Link href="/my-applications">
                                <Button variant="outline" className="w-full">
                                    View Applications <FileText className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                        <div className="text-center py-12 text-gray-400">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>No activity yet. Start by buying tokens and applying for referrals!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
