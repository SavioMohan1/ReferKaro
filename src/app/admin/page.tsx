"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const ADMIN_EMAIL = "saviomohan2002@gmail.com" // Hardcoded for Hackathon

export default function AdminPage() {
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        checkAdminAndFetch()
    }, [])

    const checkAdminAndFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user || user.email !== ADMIN_EMAIL) {
            router.push('/')
            return
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        setProfiles(data || [])
        setLoading(false)
    }

    const handleAction = async (userId: string, action: 'verify' | 'reject' | 'ban', reason?: string) => {
        let updates: any = {}

        if (action === 'verify') {
            updates = { is_verified: true, verification_status: 'verified' }
        } else if (action === 'reject') {
            updates = { is_verified: false, verification_status: 'rejected' }
        } else if (action === 'ban') {
            const banReason = prompt("Enter ban reason:")
            if (!banReason) return
            updates = { is_banned: true, ban_reason: banReason }
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)

        if (error) {
            console.error("Admin Action Failed:", error)
            alert(`Action failed: ${error.message}`)
        } else {
            checkAdminAndFetch() // Refresh
        }
    }

    if (loading) return <div className="p-8">Loading Admin Panel...</div>

    const pending = profiles.filter(p => p.verification_status === 'pending')
    const allUsers = profiles

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard 🛡️</h1>

            <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                    <TabsTrigger value="pending">Pending Verifications ({pending.length})</TabsTrigger>
                    <TabsTrigger value="users">all Users ({allUsers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <div className="grid gap-4">
                        {pending.length === 0 && <p className="text-gray-500">No pending verifications.</p>}
                        {pending.map(profile => (
                            <Card key={profile.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>{profile.full_name}</CardTitle>
                                        <p className="text-sm text-gray-500">{profile.email} • {profile.company}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-yellow-50">Pending</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-100 p-3 rounded mb-4">
                                        <p className="font-semibold text-xs text-gray-500 uppercase">AI Analysis</p>
                                        <p className="text-sm">{profile.verification_feedback || "No AI feedback available."}</p>
                                        <p className="text-xs text-gray-400 mt-1">Score: {profile.verification_score}/100</p>

                                        {profile.verification_document_url && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <a
                                                    href={profile.verification_document_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                                                >
                                                    View Proof Document ↗
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-green-600" onClick={() => handleAction(profile.id, 'verify')}>
                                            Approve
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleAction(profile.id, 'reject')}>
                                            Reject
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="users">
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">User</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map(user => (
                                    <tr key={user.id} className="border-t">
                                        <td className="p-3">
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </td>
                                        <td className="p-3 capitalize">{user.role}</td>
                                        <td className="p-3">
                                            {user.is_banned ? (
                                                <Badge variant="destructive">Banned</Badge>
                                            ) : user.is_verified ? (
                                                <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                            ) : (
                                                <Badge variant="outline">Unverified</Badge>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {!user.is_banned && (
                                                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleAction(user.id, 'ban')}>
                                                    Ban User
                                                </Button>
                                            )}
                                            {user.is_banned && (
                                                <span className="text-xs text-red-500">Reason: {user.ban_reason}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
