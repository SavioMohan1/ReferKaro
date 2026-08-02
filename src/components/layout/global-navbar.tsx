'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Navbar from './navbar'

interface GlobalNavbarProps { user: any; profile: any }

export default function GlobalNavbar({ user, profile }: GlobalNavbarProps) {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const hideOnRoutes = ['/', '/login', '/onboarding', '/verify']

    if (hideOnRoutes.includes(pathname)) return null
    if (user && profile) return <Navbar user={user} profile={profile} />

    const links = [
        ['Jobs', '/jobs'],
        ['About', '/about'],
        ['Contact', '/contact'],
    ]

    return (
        <header className="rk-nav">
            <div className="rk-shell rk-nav-inner">
                <Link href="/" className="rk-brand" aria-label="ReferKaro home">
                    <span className="rk-brand-mark">RK</span>
                    <span>ReferKaro</span>
                </Link>

                <nav className="rk-nav-links" aria-label="Public navigation">
                    {links.map(([label, href]) => (
                        <Link className="rk-nav-link" data-active={pathname === href} href={href} key={href}>{label}</Link>
                    ))}
                </nav>

                <div className="rk-nav-actions">
                    <Link href="/login" className="rk-nav-link">Sign in</Link>
                    <Link href="/login" className="rk-button rk-button-primary">Enter beta</Link>
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
            <nav className="rk-shell rk-mobile-menu" data-open={mobileOpen} aria-label="Mobile navigation">
                {links.map(([label, href]) => (
                    <Link className="rk-nav-link" data-active={pathname === href} href={href} key={href} onClick={() => setMobileOpen(false)}>{label}</Link>
                ))}
                <Link className="rk-nav-link" href="/login" onClick={() => setMobileOpen(false)}>Sign in</Link>
            </nav>
        </header>
    )
}
