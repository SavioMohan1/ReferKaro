import Link from 'next/link'

export default function TermsPage() {
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
                        Terms of Service
                    </h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem' }}>
                        Last Updated: June 11, 2026
                    </p>
                </div>

                {/* Content */}
                <div style={{ color: '#B3C0D9', fontSize: '0.975rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>1. Agreement to Terms</h2>
                        <p>
                            By accessing or using ReferKaro (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. ReferKaro connects Job Seekers with verified Employees for referral reviews.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>2. Nature of Services</h2>
                        <p>
                            ReferKaro is a <strong>referral-review marketplace</strong>.
                        </p>
                        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li><strong>Job Seekers</strong> pay tokens for a guaranteed, transparent human review of their profile, resume, and qualifications by a verified employee.</li>
                            <li><strong>Employees</strong> screen candidates and earn tokens/payouts for providing feedback and submitting referrals according to their best judgment and employer guidelines.</li>
                            <li style={{ color: '#00F0FF' }}><strong>CRITICAL DISCLAIMER:</strong> ReferKaro guarantees a human review, NOT a referral, interview, job offer, or placement. Referral decisions are entirely up to the employee.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>3. Employee Responsibilities & Policies</h2>
                        <p>
                            Employees listing on the Platform must strictly adhere to their respective employer's internal code of conduct, referral policies, and confidentiality agreements. Referral submissions must be legitimate, honest, and completely compliant with company policy. Impersonation of employees or posting fake referral listings is strictly prohibited and subject to immediate account termination.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>4. Token Purchases & Payments</h2>
                        <p>
                            Payments on the Platform are for application-processing and profile review workflows. Pricing for token plans is governed by our official pricing configuration. Users are prohibited from tampering with client-side payloads. ReferKaro reserves the right to suspend any accounts engaging in fraudulent payment methods or exploitation of system bugs.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>5. Dispute Resolution & Refunds</h2>
                        <p>
                            Disputes are handled manually by the ReferKaro support team. If an employee fails to respond to an application review within the response window, the job seeker's token is returned to their wallet balance. For detailed policies, please read our <Link href="/refund-policy" style={{ color: '#00F0FF', textDecoration: 'underline' }}>Refund Policy</Link>.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>6. Limitation of Liability</h2>
                        <p>
                            ReferKaro is not responsible for hiring outcomes, corporate policy violations by users, or actions taken by employees or seekers. We provide the infrastructure for reviews and status tracking but do not act as an employer, recruiter, or official corporate representative.
                        </p>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(0,240,255,0.08)', paddingTop: 24 }}>
                        <p>
                            If you have questions about these Terms, contact us at <a href="mailto:support@referkaro.app" style={{ color: '#00F0FF' }}>support@referkaro.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
