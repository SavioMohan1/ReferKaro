'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Bell,
    BriefcaseBusiness,
    CircleUserRound,
    FilePlus2,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Tickets,
    UsersRound,
    X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps { profile: any; user?: any }

export default function Navbar({ profile, user }: NavbarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)

    const jobSeekerLinks = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Find referrals', href: '/jobs', icon: BriefcaseBusiness },
        { name: 'Applications', href: '/my-applications', icon: Bell },
        { name: 'Tokens', href: '/buy-tokens', icon: Tickets },
    ]

    const employeeLinks = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Referral requests', href: '/applications', icon: UsersRound },
        { name: 'New listing', href: '/jobs/create', icon: FilePlus2 },
        { name: 'Browse', href: '/jobs', icon: BriefcaseBusiness },
    ]

    const navItems = profile?.role === 'job_seeker' ? jobSeekerLinks : employeeLinks
    const displayName = profile?.full_name || user?.email || 'Account'

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const navigation = (
        <>
            {navItems.map(item => (
                <Link
                    className="rk-nav-link"
                    data-active={pathname === item.href}
                    href={item.href}
                    key={item.href}
                    onClick={() => setMobileOpen(false)}
                >
                    <item.icon size={15} /> {item.name}
                </Link>
            ))}
            {profile?.role === 'admin' && (
                <Link className="rk-nav-link" data-active={pathname === '/admin'} href="/admin" onClick={() => setMobileOpen(false)}>
                    <ShieldCheck size={15} /> Admin
                </Link>
            )}
        </>
    )

    return (
        <header className="rk-nav">
            <div className="rk-shell rk-nav-inner">
                <Link href="/" className="rk-brand" aria-label="ReferKaro home">
                    <span className="rk-brand-mark">RK</span>
                    <span>ReferKaro</span>
                </Link>

                <nav className="rk-nav-links" aria-label="Account navigation">{navigation}</nav>

                <div className="rk-nav-actions">
                    <div className="rk-user-summary">
                        <CircleUserRound size={19} />
                        <span><small>{profile?.role?.replace('_', ' ')}</small>{displayName}</span>
                    </div>
                    <button className="rk-button rk-button-ghost rk-signout" onClick={handleLogout}>
                        <LogOut size={15} /> Sign out
                    </button>
                    <button
                        className="rk-mobile-toggle"
                        onClick={() => setMobileOpen(open => !open)}
                        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X size={19} /> : <Menu size={19} />}
                    </button>
                </div>
            </div>

            <nav className="rk-shell rk-mobile-menu" data-open={mobileOpen} aria-label="Mobile account navigation">
                <div className="rk-mobile-user">Signed in as <strong>{displayName}</strong></div>
                {navigation}
                <button className="rk-nav-link rk-mobile-signout" onClick={handleLogout}><LogOut size={15} /> Sign out</button>
            </nav>
        </header>
    )
}
