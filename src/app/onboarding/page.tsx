'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, User, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employee' | null>(null)
    const router = useRouter()

    const handleRoleSelection = async () => {
        if (!selectedRole) return
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { error } = await supabase.from('profiles').insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name || user.email?.split('@')[0],
            role: selectedRole,
            token_balance: selectedRole === 'job_seeker' ? 0 : null,
        })

        if (error) {
            console.error('Error creating profile:', error)
            alert('Error creating profile. Please try again.')
            setLoading(false)
            return
        }
        router.push('/dashboard')
    }

    const roles = [
        {
            id: 'job_seeker' as const,
            icon: <User size={28} color="#00F0FF" />,
            title: "I'm Looking for a Job",
            desc: 'Get referred to top companies by verified employees.',
            perks: ['Buy application tokens', 'Apply for referrals', 'Track application status'],
            accent: '#00F0FF',
        },
        {
            id: 'employee' as const,
            icon: <Briefcase size={28} color="#7B5EFF" />,
            title: 'I Can Refer Candidates',
            desc: 'Earn money by reviewing profiles and providing referrals.',
            perks: ['Review applications', 'Earn per referral', 'Help job seekers'],
            accent: '#7B5EFF',
        },
    ]

    return (
        <div style={{
            minHeight:'100vh', background:'#050A14', display:'flex',
            alignItems:'center', justifyContent:'center', padding:24,
            position:'relative', overflow:'hidden',
        }}>
            <div className="glow-orb glow-cyan"   style={{ width:400, height:400, top:-80, right:-80, opacity:0.4 }} />
            <div className="glow-orb glow-violet"  style={{ width:350, height:350, bottom:-80, left:-80, opacity:0.35 }} />

            <div style={{ width:'100%', maxWidth:640, position:'relative', zIndex:1 }}>
                {/* Logo */}
                <div style={{ textAlign:'center', marginBottom:40 }}>
                    <div style={{ fontFamily:'var(--font-head)', fontSize:'1.6rem', fontWeight:800, marginBottom:8 }}>
                        <span style={{ color:'#00F0FF' }}>Refer</span>
                        <span style={{ color:'#E8EDF5' }}>Karo</span>
                    </div>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', color:'#E8EDF5', marginBottom:8 }}>Welcome aboard!</h1>
                    <p style={{ color:'#6B7A99', fontSize:'0.95rem' }}>How would you like to use ReferKaro?</p>
                </div>

                {/* Role cards */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20, marginBottom:28 }}>
                    {roles.map(role => {
                        const isSelected = selectedRole === role.id
                        return (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                style={{
                                    padding:28, borderRadius:16, textAlign:'left', cursor:'pointer',
                                    background: isSelected ? `rgba(${role.id === 'job_seeker' ? '0,240,255' : '123,94,255'},0.08)` : 'rgba(255,255,255,0.035)',
                                    border: `2px solid ${isSelected ? role.accent : 'rgba(0,240,255,0.12)'}`,
                                    boxShadow: isSelected ? `0 0 24px ${role.accent}26` : 'none',
                                    transition:'all 0.25s ease',
                                }}
                            >
                                <div style={{ width:48,height:48,borderRadius:12,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                                    {role.icon}
                                </div>
                                <h3 style={{ fontFamily:'var(--font-head)', fontSize:'1rem', color:'#E8EDF5', marginBottom:6 }}>{role.title}</h3>
                                <p style={{ fontSize:'0.85rem', color:'#6B7A99', marginBottom:16, lineHeight:1.6 }}>{role.desc}</p>
                                <ul style={{ listStyle:'none', padding:0, margin:0 }}>
                                    {role.perks.map(p => (
                                        <li key={p} style={{ fontSize:'0.82rem', color:'#6B7A99', padding:'4px 0', display:'flex', alignItems:'center', gap:8 }}>
                                            <span style={{ color: role.accent }}>✓</span> {p}
                                        </li>
                                    ))}
                                </ul>
                            </button>
                        )
                    })}
                </div>

                {/* Submit */}
                <button
                    onClick={handleRoleSelection}
                    disabled={!selectedRole || loading}
                    className="dk-btn-primary"
                    style={{ width:'100%', justifyContent:'center', padding:'14px 24px', fontSize:'0.95rem', opacity: (!selectedRole || loading) ? 0.5 : 1 }}
                >
                    {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} /> Creating profile...</> : 'Continue →'}
                </button>
            </div>
        </div>
    )
}
