import Link from 'next/link'
import { Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react'

export default function Footer() {
    return (
        <footer style={{
            background: '#050A14',
            borderTop: '1px solid rgba(0,240,255,0.08)',
            color: '#6B7A99',
            fontFamily: "'DM Sans', sans-serif",
            padding: '64px 0 0',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '48px' }}>

                    {/* Brand */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: '12px' }}>
                            <span style={{ color: '#00F0FF' }}>Refer</span>
                            <span style={{ color: '#E8EDF5' }}>Karo</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '20px', color: '#6B7A99' }}>
                            ReferKaro bridges the gap between talent and opportunity. Every application gets a real human review.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <Link key={i} href="#" style={{ color: '#6B7A99', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#00F0FF')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}>
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 style={{ color: '#E8EDF5', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>Product</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[['Browse Jobs', '/jobs'], ['For Employees', '/employee'], ['Pricing', '#pricing'], ['Feedback', '/feedback']].map(([label, href]) => (
                                <li key={href}><Link href={href} style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#00F0FF')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}>{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 style={{ color: '#E8EDF5', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>Company</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[['About Us', '/about'], ['Contact', '/contact'], ['Terms of Service', '#'], ['Privacy Policy', '#']].map(([label, href]) => (
                                <li key={label}><Link href={href} style={{ color: '#6B7A99', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#00F0FF')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#6B7A99')}>{label}</Link></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ color: '#E8EDF5', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>Contact</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem' }}>
                                <MapPin size={16} style={{ color: '#00F0FF', marginTop: 2, flexShrink: 0 }} />
                                <span>Bangalore, Karnataka 560100</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
                                <Mail size={16} style={{ color: '#00F0FF', flexShrink: 0 }} />
                                <a href="mailto:support@referkaro.com" style={{ color: '#6B7A99', textDecoration: 'none' }}>support@referkaro.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                    borderTop: '1px solid rgba(0,240,255,0.08)',
                    padding: '24px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: '#6B7A99',
                    flexWrap: 'wrap',
                    gap: '8px',
                }}>
                    <span>&copy; {new Date().getFullYear()} ReferKaro. All rights reserved.</span>
                    <span>Built with ❤ in India</span>
                </div>
            </div>
        </footer>
    )
}
