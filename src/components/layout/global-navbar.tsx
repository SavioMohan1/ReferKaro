'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Link from 'next/link'

interface GlobalNavbarProps { user: any; profile: any }

export default function GlobalNavbar({ user, profile }: GlobalNavbarProps) {
    const pathname = usePathname()

    // Landing page and flow screens manage their own navs
    const hideOnRoutes = ['/', '/login', '/onboarding', '/verify']
    if (hideOnRoutes.includes(pathname)) return null

    // Authenticated users → full Navbar component
    if (user && profile) return <Navbar user={user} profile={profile} />

    // Public pages when logged out (about, contact, feedback, jobs)
    return (
        <header style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(5,10,20,0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0,240,255,0.08)',
        }}>
            <div style={{ maxWidth:1200, margin:'0 auto', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <Link href="/" style={{ fontFamily:'var(--font-head)', fontSize:'1.15rem', fontWeight:800, textDecoration:'none' }}>
                    <span style={{ color:'#00F0FF' }}>Refer</span>
                    <span style={{ color:'#E8EDF5' }}>Karo</span>
                </Link>

                <nav style={{ display:'flex', alignItems:'center', gap:28 }}>
                    {[['About','/about'],['Jobs','/jobs'],['Contact','/contact']].map(([label, href]) => (
                        <Link key={href} href={href} style={{
                            fontSize:'0.875rem', fontWeight:500,
                            color: pathname === href ? '#00F0FF' : '#6B7A99',
                            textDecoration:'none', transition:'color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#E8EDF5')}
                            onMouseLeave={e => (e.currentTarget.style.color = pathname === href ? '#00F0FF' : '#6B7A99')}
                        >{label}</Link>
                    ))}
                </nav>

                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Link href="/login" style={{ fontSize:'0.875rem', fontWeight:500, color:'#6B7A99', textDecoration:'none', padding:'8px 14px' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#E8EDF5')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}
                    >Log in</Link>
                    <Link href="/login" className="dk-btn-primary" style={{ padding:'9px 18px', fontSize:'0.875rem' }}>
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    )
}
