export default function JobSeekerCodeOfConductPage() {
    return (
        <div className="page-wrapper" style={{
            paddingTop: '80px', position: 'relative', overflow: 'hidden',
        }}>
            <div className="glow-orb glow-cyan" style={{ width:500, height:500, top:-100, right:-100, opacity:0.3 }} />
            <div className="glow-orb glow-violet" style={{ width:400, height:400, bottom:-100, left:-80, opacity:0.2 }} />

            <div className="page-container" style={{ paddingBottom: 80, position:'relative', zIndex:1, maxWidth: 800 }}>
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <span className="dk-chip" style={{ marginBottom: 16, display: 'inline-block' }}>Compliance</span>
                    <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#E8EDF5', marginBottom: 16 }}>
                        Job Seeker Code of Conduct
                    </h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem' }}>
                        Last Updated: June 11, 2026
                    </p>
                </div>

                {/* Content */}
                <div style={{ color: '#B3C0D9', fontSize: '0.975rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>1. Trust and Authenticity</h2>
                        <p>
                            Job seekers are expected to provide accurate, honest details in their profile and applications to ensure a trust-first environment.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>2. Rules of Engagement</h2>
                        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li><strong>Truthful Profiles:</strong> Resumes, LinkedIn profile links, cover letters, and portfolios must be authentic. Do not lie about work experience, college degrees, or skills.</li>
                            <li><strong>Respect Decisions:</strong> Referral decisions are up to the employee. Do not harass, spam, or threaten employees if they reject your application.</li>
                            <li><strong>Security and Payments:</strong> Do not attempt to bypass payment screens, exploit bugs, or engage in chargeback fraud. </li>
                            <li><strong>Zero Abuse Policy:</strong> Spamming requests or sending abusive messages to employees or support will result in immediate suspension.</li>
                        </ul>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(0,240,255,0.08)', paddingTop: 24 }}>
                        <p>
                            Violating this Code of Conduct can lead to account warnings or permanent suspension. Contact support at <a href="mailto:support@referkaro.app" style={{ color: '#00F0FF' }}>support@referkaro.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
