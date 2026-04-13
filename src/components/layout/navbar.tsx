'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, Info, Mail, MessageSquare, LogOut, Menu, X } from 'lucide-react'

interface NavbarProps { profile: any; user?: any }

export default function Navbar({ profile, user }: NavbarProps) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'About',      href: '/about',     icon: Info },
        { name: 'Contact',    href: '/contact',   icon: Mail },
        { name: 'Feedback',   href: '/feedback',  icon: MessageSquare },
    ]

    return (
        <>
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(5,10,20,0.88)',
                backdropFilter: 'blur(14px)',
                borderBottom: '1px solid rgba(0,240,255,0.08)',
            }}>
                <div style={{ maxWidth:1200, margin:'0 auto', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    {/* Logo */}
                    <Link href="/" style={{ fontFamily:'var(--font-head)', fontSize:'1.1rem', fontWeight:800, textDecoration:'none' }}>
                        <span style={{ color:'#00F0FF' }}>Refer</span>
                        <span style={{ color:'#E8EDF5' }}>Karo</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav style={{ display:'flex', alignItems:'center', gap:6 }}>
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href} style={{
                                fontSize:'0.85rem',
                                fontWeight: 500,
                                padding:'7px 14px',
                                borderRadius:8,
                                textDecoration:'none',
                                color: pathname === item.href ? '#00F0FF' : '#6B7A99',
                                background: pathname === item.href ? 'rgba(0,240,255,0.07)' : 'transparent',
                                transition: 'color 0.2s, background 0.2s',
                                display:'flex', alignItems:'center', gap:6,
                            }}
                                onMouseEnter={e => { if (pathname !== item.href) { (e.currentTarget as HTMLElement).style.color = '#E8EDF5'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' } }}
                                onMouseLeave={e => { if (pathname !== item.href) { (e.currentTarget as HTMLElement).style.color = '#6B7A99'; (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
                            >
                                <item.icon size={14} />
                                {item.name}
                            </Link>
                        ))}
                        {user?.email === 'saviomohan2002@gmail.com' && (
                            <Link href="/admin" style={{ fontSize:'0.8rem', fontWeight:700, color:'#7B5EFF', background:'rgba(123,94,255,0.1)', border:'1px solid rgba(123,94,255,0.25)', padding:'6px 12px', borderRadius:999, textDecoration:'none' }}>
                                Admin
                            </Link>
                        )}
                    </nav>

                    {/* Right: profile + logout */}
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'11px', color:'#6B7A99' }}>Welcome back,</div>
                            <div style={{ fontSize:'13px', color:'#E8EDF5', fontWeight:600 }}>{profile.full_name || user?.email}</div>
                        </div>
                        <button onClick={handleLogout} className="dk-btn-ghost" style={{ gap:6 }}>
                            <LogOut size={14} /> Logout
                        </button>
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{ display:'none', background:'none', border:'none', cursor:'pointer', color:'#6B7A99', padding:6 }}
                            className="mobile-menu-btn"
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Inline mobile styles */}
            <style>{`
                @media (max-width: 768px) {
                    nav { display: none !important; }
                    .mobile-menu-btn { display: flex !important; }
                }
            `}</style>
        </>
    )
}
