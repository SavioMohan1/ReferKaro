'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck } from 'lucide-react'

interface GlobalNavbarProps {
    user: any
    profile: any
}

export default function GlobalNavbar({ user, profile }: GlobalNavbarProps) {
    const pathname = usePathname()

    // Routes where the global navbar should be completely hidden 
    // (e.g., they have their own headers or should be completely clean)
    const hideOnRoutes = ['/', '/login', '/onboarding', '/verify']

    if (hideOnRoutes.includes(pathname)) {
        return null
    }

    // If logged in and has profile, show logged-in Navbar
    if (user && profile) {
        return <Navbar user={user} profile={profile} />
    }

    // If logged out but trying to view public pages like /about, /contact, /feedback, /jobs
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                    <span className="hidden md:inline">ReferKaro</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/about" className="text-sm font-medium hover:text-blue-600 transition-colors">About</Link>
                    <Link href="/jobs" className="text-sm font-medium hover:text-blue-600 transition-colors">Browse Jobs</Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition-colors">Contact</Link>
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
    )
}
