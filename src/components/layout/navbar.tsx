'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ShieldCheck, Menu, Home, Info, Mail, MessageSquare, LogOut } from 'lucide-react'

interface NavbarProps {
    profile: any
    user?: any
}

export default function Navbar({ profile, user }: NavbarProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = React.useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'About', href: '/about', icon: Info },
        { name: 'Contact Us', href: '/contact', icon: Mail },
        { name: 'Feedback', href: '/feedback', icon: MessageSquare },
    ]

    return (
        <header className="bg-white border-b sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">

                {/* Left: Logo + Menu */}
                <div className="flex items-center gap-4">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader className="text-left mb-6">
                                <SheetTitle className="flex items-center gap-2 text-blue-600">
                                    <ShieldCheck className="h-6 w-6" />
                                    ReferKaro
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-gray-700 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-gray-200 my-2" />
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                        <ShieldCheck className="h-6 w-6" />
                        <span className="hidden md:inline">ReferKaro</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 ml-6">
                        {navItems.slice(1).map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Profile + Desktop Logout */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">Welcome,</p>
                        <p className="font-semibold text-sm">{profile.full_name || user?.email}</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} size="sm" className="hidden md:flex">
                        Logout
                    </Button>
                    {/* Mobile Profile Icon (Optional, can be added if needed) */}
                </div>
            </div>
        </header>
    )
}
