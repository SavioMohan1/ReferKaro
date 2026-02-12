'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { ShieldCheck, IndianRupee, ArrowRight, UserPlus, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EmployeeDashboardProps {
    profile: any
    user: any
}

export default function EmployeeDashboard({ profile, user }: EmployeeDashboardProps) {
    const router = useRouter()
    const supabase = createClient()
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => {
        fetchPendingCount()
    }, [])

    const fetchPendingCount = async () => {
        const { data, error } = await supabase
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .eq('employee_id', user.id)
            .eq('status', 'pending')

        if (!error && data !== null) {
            setPendingCount(data as unknown as number)
        }
    }

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
                    {/* Earnings Card */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-8 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 mb-2">Total Earnings</p>
                                <div className="flex items-center gap-3">
                                    <IndianRupee className="h-10 w-10" />
                                    <h2 className="text-5xl font-bold">₹0</h2>
                                </div>
                                <p className="text-green-100 mt-2 text-sm">Earn ₹500 per successful referral</p>
                            </div>
                            <div className="text-right">
                                <p className="text-green-100 text-sm mb-1">Your Company</p>
                                <p className="text-2xl font-bold">{profile.company || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold mb-2">Pending Requests</h3>
                            <p className="text-gray-600 mb-4">
                                Review and respond to referral applications
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-orange-600">
                                    <Clock className="h-5 w-5" />
                                    <span className="text-2xl font-bold">{pendingCount}</span>
                                </div>
                                <span className="text-sm text-gray-500">awaiting review</span>
                            </div>
                            <Link href="/applications">
                                <Button className="w-full">
                                    View Requests <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold mb-2">Create Listing</h3>
                            <p className="text-gray-600 mb-4">
                                Post a new job opening from your company
                            </p>
                            <Link href="/jobs/create">
                                <Button variant="outline" className="w-full">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    New Listing
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-md text-center">
                            <p className="text-gray-500 text-sm mb-2">Total Referrals</p>
                            <p className="text-4xl font-bold text-blue-600">0</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md text-center">
                            <p className="text-gray-500 text-sm mb-2">Success Rate</p>
                            <p className="text-4xl font-bold text-green-600">-</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-md text-center">
                            <p className="text-gray-500 text-sm mb-2">Avg. Response Time</p>
                            <p className="text-4xl font-bold text-purple-600">-</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
