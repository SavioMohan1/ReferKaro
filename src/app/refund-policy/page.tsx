export default function RefundPolicyPage() {
    return (
        <div className="page-wrapper" style={{
            paddingTop: '80px', position: 'relative', overflow: 'hidden',
        }}>
            <div className="glow-orb glow-cyan" style={{ width:500, height:500, top:-100, right:-100, opacity:0.3 }} />
            <div className="glow-orb glow-violet" style={{ width:400, height:400, bottom:-100, left:-80, opacity:0.2 }} />

            <div className="page-container" style={{ paddingBottom: 80, position:'relative', zIndex:1, maxWidth: 800 }}>
                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <span className="dk-chip" style={{ marginBottom: 16, display: 'inline-block' }}>Legal Policy</span>
                    <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#E8EDF5', marginBottom: 16 }}>
                        Refund Policy
                    </h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem' }}>
                        Last Updated: June 11, 2026
                    </p>
                </div>

                {/* Content */}
                <div style={{ color: '#B3C0D9', fontSize: '0.975rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>1. Application & Token Refunds</h2>
                        <p>
                            At ReferKaro, we want to maintain the highest levels of accountability. Our token refund policy operates as follows:
                        </p>
                        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li>If an employee fails to review or respond to your application within the <strong>72-hour response deadline</strong>, the application is marked as expired, and the 1 application token is automatically returned to your wallet balance.</li>
                            <li>If an employee accepts your application but fails to submit a referral verification link or email, any success tokens/fees are eligible for refund/credit back upon dispute review.</li>
                            <li>If an employee reviews your profile and decides to **reject** the referral, tokens are **not** refunded. The token is spent on the employee's genuine screening and review effort.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>2. Cash Refunds</h2>
                        <p>
                            Purchased tokens are generally non-refundable once bought from the Token Store, unless there is a payment processing error or proven platform failure. In the case of duplicate transactions or billing discrepancies, cash refunds will be credited back via Razorpay within 5–7 working days, subject to payment gateway terms and provider rules.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>3. Incomplete Submissions</h2>
                        <p>
                            Refunds or token credits are not guaranteed if a job seeker uploads incorrect, misleading, or blank resumes, files, or links. Please verify your profile info carefully before applying.
                        </p>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(0,240,255,0.08)', paddingTop: 24 }}>
                        <p>
                            To report an issue or file a payment dispute, please contact support at <a href="mailto:support@referkaro.app" style={{ color: '#00F0FF' }}>support@referkaro.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
