'use client'

import Link from "next/link"
import { useEffect, useRef } from "react"
import Footer from "@/components/layout/footer"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function LandingPage() {

    // Scroll-reveal via IntersectionObserver
    useEffect(() => {
        const targets = document.querySelectorAll('.reveal')
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
            { threshold: 0.1 }
        )
        targets.forEach(el => observer.observe(el))

        // Counter animation
        const counters = document.querySelectorAll('.counter')
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement
                    const target = parseInt(el.dataset.target || '0')
                    const suffix = el.dataset.suffix || ''
                    let current = 0
                    const step = Math.ceil(target / 60)
                    const interval = setInterval(() => {
                        current = Math.min(current + step, target)
                        el.textContent = current.toLocaleString() + suffix
                        if (current >= target) clearInterval(interval)
                    }, 20)
                    counterObserver.unobserve(el)
                }
            })
        }, { threshold: 0.5 })
        counters.forEach(el => counterObserver.observe(el))

        // Sticky navbar scroll effect
        const navbar = document.getElementById('landing-nav')
        const handleScroll = () => {
            if (window.scrollY > 30) navbar?.classList.add('scrolled')
            else navbar?.classList.remove('scrolled')
        }
        window.addEventListener('scroll', handleScroll)

        return () => {
            observer.disconnect()
            counterObserver.disconnect()
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const features = [
        { icon: '⚡', title: 'Instant Match', desc: 'Our system matches your profile to open roles in seconds using smart keyword analysis.' },
        { icon: '🔒', title: 'Proxy Email Shield', desc: 'A unique proxy email protects your identity until the referral is verified and confirmed.' },
        { icon: '🌊', title: 'Pooling System', desc: '10 candidates, 1 referral. AI ranks the best applicant so the employee can pick with confidence.' },
        { icon: '💎', title: 'Premium Track', desc: 'Skip the queue. Pay 10 tokens for direct 1-on-1 review by the employee of your choice.' },
        { icon: '🏦', title: 'Token Economy', desc: 'Start with just 1 token (₹99). Guaranteed response — no ghosting, no lost applications.' },
        { icon: '✉️', title: 'Email Tracking', desc: 'Get notified the moment the company accepts your referral application via our live tracking.' },
    ]

    const testimonials = [
        { quote: '"Landed my Google SWE role after 2 failed ATS attempts. ReferKaro changed everything."', name: 'Aryan M.', role: 'Software Engineer, Google' },
        { quote: '"As an employee, I earn ₹500 per referral. I\'ve referred 18 people this quarter alone."', name: 'Priya S.', role: 'Staff Engineer, Microsoft' },
        { quote: '"The Pooling system is genius. I got 10 qualified applicants and picked the perfect fit."', name: 'Rahul T.', role: 'Engineering Manager, Razorpay' },
    ]

    const plans = [
        { name: 'Explorer', price: '₹99', note: '1 Token', featured: false, features: ['1 application attempt', 'Profile review by employee', 'Email status tracking', 'Standard queue placement'] },
        { name: 'Premium', price: '₹990', note: '10 Tokens', featured: true, features: ['Direct 1-on-1 referral review', 'Priority placement', 'AI resume match score', '24-hour response guarantee', 'Proxy email tracking'] },
        { name: 'Team', price: 'Custom', note: 'For Companies', featured: false, features: ['Bulk employee onboarding', 'Verified employee dashboard', 'Referral analytics', 'Dedicated account manager'] },
    ]

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

                :root {
                    --bg: #050A14;
                    --accent: #00F0FF;
                    --violet: #7B5EFF;
                    --text: #E8EDF5;
                    --muted: #6B7A99;
                    --card-border: rgba(0,240,255,0.15);
                    --glow: 0 0 24px rgba(0,240,255,0.12);
                    --radius-card: 16px;
                    --radius-btn: 8px;
                    --font-head: 'Syne', sans-serif;
                    --font-body: 'DM Sans', sans-serif;
                }

                .lp-root {
                    background: var(--bg);
                    color: var(--text);
                    font-family: var(--font-body);
                    overflow-x: hidden;
                }

                /* Navbar */
                #landing-nav {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 100;
                    padding: 20px 0;
                    transition: background 0.4s, padding 0.4s, box-shadow 0.4s;
                }
                #landing-nav.scrolled {
                    background: rgba(5,10,20,0.88);
                    backdrop-filter: blur(12px);
                    padding: 12px 0;
                    box-shadow: 0 1px 0 rgba(0,240,255,0.08);
                }
                .nav-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .nav-logo {
                    font-family: var(--font-head);
                    font-size: 1.3rem;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .nav-logo span.accent { color: var(--accent); }
                .nav-logo span.white { color: var(--text); }
                .nav-links {
                    display: flex;
                    gap: 36px;
                    list-style: none;
                    margin: 0; padding: 0;
                }
                .nav-links a {
                    font-size: 14px;
                    color: var(--muted);
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .nav-links a:hover { color: var(--text); }
                .nav-actions { display: flex; gap: 12px; align-items: center; }
                .btn-ghost {
                    background: none;
                    border: none;
                    color: var(--muted);
                    font-family: var(--font-body);
                    font-size: 14px;
                    cursor: pointer;
                    text-decoration: none;
                    padding: 8px 16px;
                    border-radius: var(--radius-btn);
                    transition: color 0.2s;
                }
                .btn-ghost:hover { color: var(--text); }
                .btn-primary {
                    background: var(--accent);
                    color: #050A14;
                    font-family: var(--font-body);
                    font-weight: 700;
                    font-size: 14px;
                    padding: 10px 22px;
                    border-radius: var(--radius-btn);
                    border: none;
                    cursor: pointer;
                    text-decoration: none;
                    position: relative;
                    overflow: hidden;
                    display: inline-block;
                    transition: box-shadow 0.2s;
                }
                .btn-primary::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.5s ease;
                }
                .btn-primary:hover::after { transform: translateX(100%); }
                .btn-primary:hover { box-shadow: 0 0 20px rgba(0,240,255,0.4); }
                .btn-outline {
                    background: transparent;
                    color: var(--accent);
                    border: 1px solid rgba(0,240,255,0.4);
                    font-family: var(--font-body);
                    font-weight: 500;
                    font-size: 14px;
                    padding: 10px 22px;
                    border-radius: var(--radius-btn);
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .btn-outline:hover {
                    border-color: var(--accent);
                    box-shadow: 0 0 14px rgba(0,240,255,0.2);
                }

                /* Container */
                .lp-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* Reveal */
                .reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }
                .reveal.visible { opacity: 1; transform: none; }
                .reveal-1 { transition-delay: 0.1s; }
                .reveal-2 { transition-delay: 0.2s; }
                .reveal-3 { transition-delay: 0.3s; }

                /* HERO */
                .hero {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    padding: 120px 24px 80px;
                    background-image: url('/images/hero_bg_mesh.png');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(5,10,20,0.6);
                    z-index: 0;
                    pointer-events: none;
                }
                .glow-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    will-change: transform;
                    filter: blur(80px);
                    z-index: 1;
                }
                .glow-orb-cyan {
                    width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(0,240,255,0.22) 0%, transparent 70%);
                    filter: blur(80px);
                    top: -100px; right: -100px;
                    animation: pulse 6s ease-in-out infinite;
                }
                .glow-orb-violet {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(123,94,255,0.2) 0%, transparent 70%);
                    filter: blur(80px);
                    bottom: -100px; left: -100px;
                    animation: pulse 8s ease-in-out infinite reverse;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .hero-chip {
                    display: inline-block;
                    border: 1px solid rgba(0,240,255,0.3);
                    color: var(--accent);
                    font-size: 13px;
                    font-weight: 500;
                    padding: 6px 16px;
                    border-radius: 999px;
                    margin-bottom: 28px;
                    letter-spacing: 0.03em;
                }
                .hero h1 {
                    font-family: var(--font-head);
                    font-size: clamp(2.8rem, 7vw, 5.5rem);
                    font-weight: 800;
                    line-height: 1.1;
                    color: var(--text);
                    margin-bottom: 24px;
                }
                .hero h1 .accent { color: var(--accent); }
                .hero-sub {
                    font-size: 1.15rem;
                    color: var(--muted);
                    max-width: 520px;
                    margin: 0 auto 36px;
                    line-height: 1.7;
                }
                .hero-btns {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-bottom: 48px;
                }
                .hero-btns .btn-primary, .hero-btns .btn-outline {
                    font-size: 15px;
                    padding: 14px 32px;
                }
                .hero-social-proof {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    color: var(--muted);
                    font-size: 13px;
                }
                .avatar-stack { display: flex; }
                .avatar {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    border: 2px solid var(--bg);
                    margin-left: -8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700;
                    color: #050A14;
                }
                .avatar:first-child { margin-left: 0; }
                .hero-divider {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(0,240,255,0.15), rgba(0,240,255,0.35), rgba(0,240,255,0.15), transparent);
                }

                /* Logo Bar */
                .logo-bar { padding: 48px 0; overflow: hidden; }
                .logo-bar-label {
                    text-align: center;
                    font-size: 11px;
                    letter-spacing: 0.15em;
                    color: var(--muted);
                    text-transform: uppercase;
                    margin-bottom: 32px;
                }
                .marquee-track {
                    display: flex;
                    gap: 56px;
                    animation: marquee 28s linear infinite;
                    width: max-content;
                }
                .marquee-wrap {
                    display: flex;
                    overflow: hidden;
                    mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
                }
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                .logo-item {
                    font-family: var(--font-head);
                    font-size: 1rem;
                    color: var(--muted);
                    opacity: 0.38;
                    white-space: nowrap;
                    transition: opacity 0.3s;
                    cursor: default;
                    letter-spacing: 0.04em;
                }
                .logo-item:hover { opacity: 0.75; }

                /* Section common */
                .section { padding: 96px 0; }
                .section-title {
                    font-family: var(--font-head);
                    font-size: clamp(1.8rem, 4vw, 2.8rem);
                    font-weight: 800;
                    color: var(--text);
                    text-align: center;
                    margin-bottom: 12px;
                }
                .section-sub {
                    font-size: 1rem;
                    color: var(--muted);
                    text-align: center;
                    max-width: 500px;
                    margin: 0 auto 56px;
                    line-height: 1.7;
                }

                /* Features */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                }
                .feature-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(0,240,255,0.1);
                    border-radius: var(--radius-card);
                    padding: 32px;
                    box-shadow: var(--glow);
                    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
                }
                .feature-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 0 32px rgba(0,240,255,0.2);
                    border-color: rgba(0,240,255,0.3);
                }
                .feature-icon {
                    width: 44px; height: 44px;
                    background: rgba(0,240,255,0.1);
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px;
                    margin-bottom: 20px;
                }
                .feature-card h3 {
                    font-family: var(--font-head);
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--text);
                    margin-bottom: 10px;
                }
                .feature-card p { font-size: 0.9rem; color: var(--muted); line-height: 1.65; }

                /* Stats */
                .stats-strip {
                    background: rgba(0,240,255,0.03);
                    border-top: 1px solid var(--card-border);
                    border-bottom: 1px solid var(--card-border);
                    padding: 56px 0;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    text-align: center;
                }
                .stat-block {
                    padding: 0 32px;
                    border-right: 1px solid rgba(0,240,255,0.1);
                }
                .stat-block:last-child { border-right: none; }
                .stat-num {
                    font-family: var(--font-head);
                    font-size: 2.6rem;
                    font-weight: 800;
                    color: var(--accent);
                    display: block;
                }
                .stat-label { font-size: 0.85rem; color: var(--muted); margin-top: 6px; }

                /* How It Works */
                .how-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 0;
                    position: relative;
                }
                .how-grid::before {
                    content: '';
                    position: absolute;
                    top: 28px; left: calc(16.66% + 20px); right: calc(16.66% + 20px);
                    border-top: 1px dashed rgba(0,240,255,0.25);
                    z-index: 0;
                }
                .how-step {
                    text-align: center;
                    padding: 0 32px;
                    position: relative;
                    z-index: 1;
                }
                .how-num {
                    width: 56px; height: 56px;
                    border: 2px solid var(--accent);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-family: var(--font-head);
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--accent);
                    margin: 0 auto 20px;
                    background: var(--bg);
                }
                .how-step h3 {
                    font-family: var(--font-head);
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: var(--text);
                    margin-bottom: 10px;
                }
                .how-step p { font-size: 0.9rem; color: var(--muted); line-height: 1.65; }

                /* Testimonials */
                .testimonial-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }
                .testimonial-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(0,240,255,0.1);
                    border-radius: var(--radius-card);
                    padding: 32px;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .testimonial-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 0 24px rgba(0,240,255,0.13);
                }
                .testimonial-card p {
                    font-size: 0.95rem;
                    color: var(--text);
                    line-height: 1.7;
                    margin-bottom: 24px;
                    font-style: italic;
                }
                .testimonial-divider { height: 1px; background: rgba(0,240,255,0.1); margin-bottom: 20px; }
                .testimonial-author { display: flex; align-items: center; gap: 12px; }
                .testimonial-avatar {
                    width: 36px; height: 36px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; font-weight: 800;
                    color: #050A14;
                    flex-shrink: 0;
                }
                .testimonial-name {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--text);
                }
                .testimonial-role { font-size: 0.8rem; color: var(--muted); }

                /* Pricing */
                .pricing-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    align-items: center;
                }
                .pricing-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(0,240,255,0.1);
                    border-radius: var(--radius-card);
                    padding: 36px 32px;
                    position: relative;
                    transition: box-shadow 0.3s;
                }
                .pricing-card.featured {
                    border-color: rgba(0,240,255,0.5);
                    box-shadow: 0 0 40px rgba(0,240,255,0.12), inset 0 0 40px rgba(0,240,255,0.03);
                    transform: scale(1.04);
                }
                .pricing-badge {
                    display: inline-block;
                    background: rgba(0,240,255,0.12);
                    color: var(--accent);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    padding: 4px 12px;
                    border-radius: 999px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(0,240,255,0.25);
                }
                .pricing-name {
                    font-family: var(--font-head);
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--muted);
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin-bottom: 12px;
                }
                .pricing-price {
                    font-family: var(--font-head);
                    font-size: 2.6rem;
                    font-weight: 800;
                    color: var(--text);
                    margin-bottom: 4px;
                }
                .pricing-note { font-size: 0.85rem; color: var(--muted); margin-bottom: 28px; }
                .pricing-features { list-style: none; padding: 0; margin: 0 0 28px; }
                .pricing-features li {
                    font-size: 0.9rem;
                    color: var(--muted);
                    padding: 8px 0;
                    display: flex; align-items: center; gap: 10px;
                    border-bottom: 1px solid rgba(0,240,255,0.06);
                }
                .pricing-features li:last-child { border-bottom: none; }
                .check { color: var(--accent); font-size: 14px; }

                .cta-banner {
                    padding: 96px 24px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    background-image: url('/images/city_silhouette_bg.png');
                    background-size: cover;
                    background-position: center 40%;
                    background-repeat: no-repeat;
                }
                .cta-banner::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(5,10,20,0.65);
                    z-index: 0;
                    pointer-events: none;
                }
                .cta-banner .glow-orb-cyan {
                    width: 700px; height: 700px;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.5;
                }
                .cta-banner h2 {
                    font-family: var(--font-head);
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    font-weight: 800;
                    color: var(--text);
                    margin-bottom: 16px;
                    position: relative;
                }
                .cta-banner p { font-size: 1rem; color: var(--muted); margin-bottom: 36px; position: relative; }
                .cta-banner .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; position: relative; }

                /* Dark footer override */
                .lp-footer-wrap footer {
                    background: #050A14 !important;
                    border-top: 1px solid rgba(0,240,255,0.08) !important;
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .nav-links { display: none; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .stat-block { margin-bottom: 32px; border-right: none; border-bottom: 1px solid rgba(0,240,255,0.1); }
                    .how-grid { grid-template-columns: 1fr; gap: 40px; }
                    .how-grid::before { display: none; }
                    .testimonial-grid { grid-template-columns: 1fr; }
                    .pricing-grid { grid-template-columns: 1fr; }
                    .pricing-card.featured { transform: none; }
                    .features-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="lp-root">
                {/* ── NAVBAR ── */}
                <nav id="landing-nav">
                    <div className="nav-inner">
                        <a href="/" className="nav-logo">
                            <span className="accent">Refer</span><span className="white">Karo</span>
                        </a>
                        <ul className="nav-links">
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how">How It Works</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#about">About</a></li>
                        </ul>
                        <div className="nav-actions">
                            <Link href="/login" className="btn-ghost">Log in</Link>
                            <Link href="/login" className="btn-primary">Get Started</Link>
                        </div>
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="hero">
                    <div className="glow-orb glow-orb-cyan" style={{ position: 'absolute' }} />
                    <div className="glow-orb glow-orb-violet" style={{ position: 'absolute' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div className="hero-chip">✦ Now in Public Beta</div>
                        <h1>
                            Get <span className="accent">Referred</span>,<br />
                            Not Ignored.
                        </h1>
                        <p className="hero-sub">
                            Connect directly with verified employees at top companies. Submit a real referral — not just another ATS upload that disappears.
                        </p>
                        <div className="hero-btns">
                            <Link href="/login" className="btn-primary">
                                Request a Referral →
                            </Link>
                            <Link href="#how" className="btn-outline">
                                See How It Works
                            </Link>
                        </div>
                        <div className="hero-social-proof">
                            <div className="avatar-stack">
                                {[['A','#00F0FF'],['P','#7B5EFF'],['R','#00F0FF'],['S','#7B5EFF']].map(([l, c], i) => (
                                    <div key={i} className="avatar" style={{ background: c }}>{l}</div>
                                ))}
                            </div>
                            <span>Trusted by 12,000+ job seekers &amp; employees</span>
                        </div>
                    </div>
                    <div className="hero-divider" />
                </section>

                {/* ── LOGO BAR ── */}
                <section className="logo-bar">
                    <div className="logo-bar-label">Trusted by teams at</div>
                    <div className="marquee-wrap">
                        <div className="marquee-track">
                            {['Google','Microsoft','Amazon','Razorpay','Zepto','Meesho','PhonePe','CRED','Swiggy','Atlassian',
                              'Google','Microsoft','Amazon','Razorpay','Zepto','Meesho','PhonePe','CRED','Swiggy','Atlassian'].map((co, i) => (
                                <span key={i} className="logo-item">{co}</span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section className="section" id="features">
                    <div className="lp-container">
                        <h2 className="section-title reveal">Everything You Need to Land the Role</h2>
                        <p className="section-sub reveal reveal-1">One platform across the entire referral lifecycle — from application to confirmation.</p>
                        <div className="features-grid">
                            {features.map((f, i) => (
                                <div key={i} className={`feature-card reveal reveal-${(i % 3) + 1}`}>
                                    <div className="feature-icon">{f.icon}</div>
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── STATS ── */}
                <div className="stats-strip">
                    <div className="lp-container">
                        <div className="stats-grid">
                            {[
                                { val: 12000, label: 'Applications Submitted', suffix: '+' },
                                { val: 500,   label: 'Verified Employees', suffix: '+' },
                                { val: 98,    label: 'Response Rate', suffix: '%' },
                                { val: 24,    label: 'Avg. Response Hours', suffix: 'h' },
                            ].map((s, i) => (
                                <div key={i} className="stat-block reveal">
                                    <span
                                        className="stat-num counter"
                                        data-target={s.val}
                                        data-suffix={s.suffix}
                                    >0</span>
                                    <span className="stat-label">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── HOW IT WORKS ── */}
                <section className="section" id="how">
                    <div className="lp-container">
                        <h2 className="section-title reveal">How It Works</h2>
                        <p className="section-sub reveal reveal-1">Three steps. Zero ghosting. One real referral.</p>
                        <div className="how-grid">
                            {[
                                { n: '01', title: 'Buy Tokens', desc: 'Start with 1 token (₹99). Tokens filter out bots and ensure only serious candidates apply.' },
                                { n: '02', title: 'Apply & Get Reviewed', desc: 'Use a token to submit your profile. The employee reviews it. No match = no extra charge.' },
                                { n: '03', title: 'Get Referred', desc: 'If selected, your proxy email is activated. The employee submits a real referral in your company portal.' },
                            ].map((step, i) => (
                                <div key={i} className={`how-step reveal reveal-${i + 1}`}>
                                    <div className="how-num">{step.n}</div>
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section className="section" style={{ background: 'rgba(0,240,255,0.02)' }} id="about">
                    <div className="lp-container">
                        <h2 className="section-title reveal">What People Are Saying</h2>
                        <p className="section-sub reveal reveal-1">Real results from real referrals.</p>
                        <div className="testimonial-grid">
                            {testimonials.map((t, i) => (
                                <div key={i} className={`testimonial-card reveal reveal-${i + 1}`}>
                                    <p>{t.quote}</p>
                                    <div className="testimonial-divider" />
                                    <div className="testimonial-author">
                                        <div className="testimonial-avatar" style={{ background: i % 2 === 0 ? '#00F0FF' : '#7B5EFF' }}>
                                            {t.name[0]}
                                        </div>
                                        <div>
                                            <div className="testimonial-name">{t.name}</div>
                                            <div className="testimonial-role">{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section className="section" id="pricing">
                    <div className="lp-container">
                        <h2 className="section-title reveal">Simple, Transparent Pricing</h2>
                        <p className="section-sub reveal reveal-1">No hidden fees. Pay only when you see results.</p>
                        <div className="pricing-grid">
                            {plans.map((plan, i) => (
                                <div key={i} className={`pricing-card reveal reveal-${i + 1} ${plan.featured ? 'featured' : ''}`}>
                                    {plan.featured && <div className="pricing-badge">★ MOST POPULAR</div>}
                                    <div className="pricing-name">{plan.name}</div>
                                    <div className="pricing-price">{plan.price}</div>
                                    <div className="pricing-note">{plan.note}</div>
                                    <ul className="pricing-features">
                                        {plan.features.map((f, j) => (
                                            <li key={j}><span className="check">✓</span> {f}</li>
                                        ))}
                                    </ul>
                                    <Link href="/login" className={plan.featured ? 'btn-primary' : 'btn-outline'} style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                                        {plan.name === 'Team' ? 'Contact Us' : 'Get Started'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BANNER ── */}
                <section className="cta-banner">
                    <div className="glow-orb glow-orb-cyan" />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2>Ready to Skip the ATS Black Hole?</h2>
                        <p>Join thousands of job seekers getting real referrals from real employees.</p>
                        <div className="cta-btns">
                            <Link href="/login" className="btn-primary" style={{ fontSize: '15px', padding: '14px 32px' }}>
                                Start with 1 Token →
                            </Link>
                            <Link href="#features" className="btn-outline" style={{ fontSize: '15px', padding: '14px 32px' }}>
                                Learn More
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <div className="lp-footer-wrap">
                    <Footer />
                </div>
            </div>
        </>
    )
}
