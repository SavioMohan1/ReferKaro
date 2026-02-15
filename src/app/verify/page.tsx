"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, CheckCircle, XCircle, FileText } from "lucide-react"

export default function VerifyPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [verifying, setVerifying] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Form verification details
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

            // Create preview if image
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

            if (data.success) {
                if (data.status === 'verified') {
                    setTimeout(() => router.push('/dashboard'), 3000)
                } else if (data.status === 'pending') {
                    // Optional: logout user or redirect to home after a delay
                    // data.status === 'pending': Do nothing, let user read message and click button.
                }
            }
        } catch (error) {
            console.error('Verification failed', error)
            alert('Verification failed. Please try again.')
        } finally {
            setVerifying(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-purple-900">Verify Your Employment</CardTitle>
                    <CardDescription>
                        Enter your details and upload your ID Card or Offer Letter.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-6">

                        {/* Manual Entry Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name (as on ID)</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Current Company</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    required
                                    placeholder="e.g. Google"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Job Role / Designation</Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label>Upload ID Card / Offer Letter</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    required
                                />

                                {preview ? (
                                    <img src={preview} alt="ID Preview" className="h-40 object-contain rounded-md" />
                                ) : file ? (
                                    <div className="text-center">
                                        <FileText className="h-10 w-10 text-purple-600 mx-auto mb-2" />
                                        <p className="font-medium text-slate-700">{file.name}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                        <p className="font-medium text-slate-900">Click to Upload</p>
                                        <p className="text-sm text-slate-500 mt-1">Image or PDF (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {result && (
                            <div className={`p-4 rounded-lg flex items-start gap-3 ${result.status === 'verified' ? 'bg-green-50 text-green-800' :
                                result.status === 'pending' ? 'bg-yellow-50 text-yellow-800' :
                                    'bg-red-50 text-red-800'
                                }`}>
                                {result.status === 'verified' ? <CheckCircle className="h-5 w-5 shrink-0" /> :
                                    result.status === 'pending' ? <Loader2 className="h-5 w-5 shrink-0" /> :
                                        <XCircle className="h-5 w-5 shrink-0" />}

                                <div>
                                    <p className="font-semibold">
                                        {result.status === 'verified' ? "Verification Successful!" :
                                            result.status === 'pending' ? "Application Submitted" :
                                                "Verification Failed"}
                                    </p>
                                    <p className="text-sm mt-1 opacity-90">
                                        {result.status === 'verified' ? "Redirecting you to the dashboard..." :
                                            result.status === 'pending' ? "Our Team will get back to you in sometime. Please login later." :
                                                (result.message || result.error)}
                                    </p>
                                    {result.status === 'rejected' && result.feedback && (
                                        <p className="text-xs mt-2 italic border-t border-red-200 pt-1">Reason: {result.feedback}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {result?.status === 'pending' ? (
                            <Button
                                type="button"
                                onClick={() => router.push('/')}
                                className="w-full bg-slate-800 hover:bg-slate-900 transition-all duration-300"
                            >
                                Go Back to Home
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={!file || verifying || (result?.status === 'verified')}
                                className={`w-full transition-all duration-300 ${result?.status === 'verified' ? 'bg-green-600 hover:bg-green-700' :
                                        'bg-purple-600 hover:bg-purple-700'
                                    }`}
                            >
                                {verifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying Documents...
                                    </>
                                ) : result?.status === 'verified' ? (
                                    "Verified! Redirecting..."
                                ) : (
                                    "Submit for Verification"
                                )}
                            </Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
