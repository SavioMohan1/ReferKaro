import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, ShieldCheck, Mail, IndianRupee, Layers } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
                        <ShieldCheck className="h-6 w-6" />
                        <span>ReferKaro</span>
                    </div>
                    <nav className="hidden gap-6 md:flex">
                        <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">
                            How It Works
                        </Link>
                        <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">
                            Browse Jobs
                        </Link>
                        <Link className="text-sm font-medium hover:text-blue-600 transition-colors" href="#">
                            For Employees
                        </Link>
                    </nav>
                    <div className="flex gap-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900">
                                    Get Referred, <span className="text-blue-600">Not Ignored.</span>
                                </h1>
                                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                                    Stop applying into the black hole. Connect with verified employees who review your profile and submit a real referral.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Button className="h-12 px-8 text-lg">
                                    Find a Referrer <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="h-12 px-8 text-lg">
                                    Applying as Employee?
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400 pt-4">
                                Trusted by employees from Google, Microsoft, Amazon, and 50+ startups.
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works (The Token Model) */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 border-t">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                    The Process
                                </div>
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Fair for Everyone.</h2>
                                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    We balance the risk. You pay a small token to apply, and the success fee only when accepted.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                            <div className="grid gap-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">1. Buy Tokens</h3>
                                </div>
                                <p className="text-gray-500 pl-14">
                                    Purchase application tokens (e.g., 3 for ₹99). This filters out spam and bots, ensuring high-quality applicants.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">2. Apply & Review</h3>
                                </div>
                                <p className="text-gray-500 pl-14">
                                    Use 1 token to apply. The employee reviews your profile. If they decline, you pay nothing else.
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">3. Success Fee</h3>
                                </div>
                                <p className="text-gray-500 pl-14">
                                    If they accept, you pay the success fee (₹900). We verify the referral instantly using our Proxy Email system.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-white border-t">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">
                                    Verification
                                </div>
                                <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                                    No More Ghosting.
                                    <br className="hidden sm:inline" />
                                    guaranteed.
                                </h2>
                                <Button className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:pointer-events-none disabled:opacity-50">
                                    How Verification Works
                                </Button>
                            </div>
                            <div className="flex flex-col items-start space-y-4">
                                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed">
                                    We generate a unique 'Proxy Email' for every application. The employee refers *that* email. When the company sends the confirmation link, our system detects it and instantly forwards it to you.
                                </p>
                                <div className="grid gap-2 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" /> Auto-Refund if referral not sent within 48h
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" /> Money safe in escrow until verification
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" /> Privacy protected (Employee sees limited info)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full py-6 bg-slate-900 text-white">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
                    <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
                        © 2026 ReferKaro. Built for the Indian Tech Community.
                    </p>
                    <div className="flex gap-4">
                        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                            Terms
                        </Link>
                        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
                            Privacy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
