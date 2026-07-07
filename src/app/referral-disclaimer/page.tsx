export default function ReferralDisclaimerPage() {
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
                        Referral Disclaimer
                    </h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem' }}>
                        Last Updated: June 11, 2026
                    </p>
                </div>

                {/* Content */}
                <div style={{ color: '#B3C0D9', fontSize: '0.975rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>1. Corporate Affiliations</h2>
                        <p>
                            ReferKaro is an independent referral review marketplace. We are <strong>not affiliated, associated, authorized, endorsed by, or in any way officially connected</strong> with any companies listed on job listings, posts, or employee profiles unless explicitly declared otherwise. All company names, logos, and trademarks are the property of their respective owners.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>2. Nature of Referrals</h2>
                        <p>
                            Employees listing on ReferKaro act in their individual capacities as industry professionals. Referrals are subject to their companies' internal referral guidelines.
                        </p>
                        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li>An application or payment on ReferKaro guarantees a **human review** of your credentials by a verified employee.</li>
                            <li>A review **does not guarantee** a referral submission.</li>
                            <li>A referral submission **does not guarantee** a recruiter screen, phone review, or official interview.</li>
                            <li>An interview **does not guarantee** a job offer, hiring outcome, or placement.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>3. Compensation and Incentives</h2>
                        <p>
                            Payment on ReferKaro is for the **screening effort and time** spent by the employee reviewing the candidate's resume, portfolio, and credentials. It is not a transaction for employment or access to corporate systems. ReferKaro does not monetize hiring outcomes.
                        </p>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(0,240,255,0.08)', paddingTop: 24 }}>
                        <p>
                            If you have questions about this Disclaimer, contact us at <a href="mailto:support@referkaro.app" style={{ color: '#00F0FF' }}>support@referkaro.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
