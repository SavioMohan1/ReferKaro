export default function EmployeeCodeOfConductPage() {
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
                        Employee Code of Conduct
                    </h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem' }}>
                        Last Updated: June 11, 2026
                    </p>
                </div>

                {/* Content */}
                <div style={{ color: '#B3C0D9', fontSize: '0.975rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>1. Purpose & Scope</h2>
                        <p>
                            To maintain a high-trust marketplace, employees listing referral review opportunities must behave ethically and professionally. This code outlines standards to protect both employees' employers and job seekers.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>2. Rules of Engagement</h2>
                        <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li><strong>Follow Employer Policies:</strong> Employees must strictly comply with their employer's internal referral rules, gift policies, and employee handbook.</li>
                            <li><strong>Genuine Verification:</strong> Employees must verify candidates' profiles and only submit a referral in their corporate portal if they find the candidate suitable.</li>
                            <li><strong>No Sale of Referrals:</strong> Do not advertise "guaranteed referrals for sale." Your service is profile screening and review.</li>
                            <li><strong>Response Deadlines:</strong> Respond to all applications within the 72-hour limit. Overdue applications will trigger automated token refunds to the seeker.</li>
                            <li><strong>Professional Integrity:</strong> Provide constructive, professional notes and feedback if a candidate is rejected. Abuse, spam, or hostile behavior is prohibited.</li>
                        </ul>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(0,240,255,0.08)', paddingTop: 24 }}>
                        <p>
                            Violating this Code of Conduct can lead to warning, deactivation of listings, or permanent ban from the Platform. Contact support at <a href="mailto:support@referkaro.app" style={{ color: '#00F0FF' }}>support@referkaro.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
