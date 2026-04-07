import { ShieldCheck, Target, Users, Zap } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                    Democratizing Career Opportunities
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    ReferKaro connects ambitious professionals with verified tech insiders, turning the black hole of job applications into guaranteed human review.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold">The Problem</h3>
                    <p className="text-slate-600 leading-relaxed">
                        The ATS (Applicant Tracking System) is broken. Talented individuals send hundreds of applications and never hear back. The only reliable way to get an interview is through a referral, but "who you know" shouldn't dictate your career trajectory.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold">The Solution</h3>
                    <p className="text-slate-600 leading-relaxed">
                        We incentivize current employees to mentor and refer. By paying a small verifiable token fee, candidates guarantee that a real human in their target company will review their profile. If there's a match, they get a referral.
                    </p>
                </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-10 md:p-16 text-center space-y-8 shadow-xl">
                <Users className="h-12 w-12 text-blue-400 mx-auto" />
                <h2 className="text-3xl font-bold">Built for Trust</h2>
                <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                    Our platform relies on the secure "Proxy Email" system. This ensures absolute privacy for both the employee and the candidate, while our automated tracking guarantees transparency and prevents fraud.
                </p>
            </div>
        </div>
    )
}
