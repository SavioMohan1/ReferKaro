'use client'

import { useState } from 'react'
import { MessageSquarePlus, Send, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FeedbackPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [feedback, setFeedback] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!feedback.trim()) return

        setIsSubmitting(true)

        // Simulate sending to a dummy email address (e.g. feedback@referkaro.com)
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setIsSuccess(true)
        setFeedback('')

        // Reset success state after a few seconds
        setTimeout(() => setIsSuccess(false), 4000)
    }

    return (
        <div className="container mx-auto py-16 px-4 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10 space-y-4">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquarePlus className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">We Value Your Feedback</h1>
                <p className="text-slate-600">
                    Help us improve ReferKaro. Let us know what features you'd like to see next, or if you've encountered any issues!
                    Your feedback is sent directly to <span className="font-semibold text-blue-600">feedback@referkaro.com</span>.
                </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in-95 duration-300">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                        <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
                        <p className="text-slate-600 text-center">Your feedback has been successfully sent. We appreciate your input!</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setIsSuccess(false)}
                        >
                            Send Another
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">What's on your mind?</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-40 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-shadow text-slate-700"
                                placeholder="Tell us what you think..."
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !feedback.trim()}
                            className="w-full h-12 text-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-5 w-5" />
                                    Submit Feedback
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}
