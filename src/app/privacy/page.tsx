export default function PrivacyPage() {
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
                        Privacy Policy
                    </h1>
                    <p style={{ color: '#6B7A99', fontSize: '0.9rem' }}>
                        Last Updated: June 11, 2026
                    </p>
                </div>

                {/* Content */}
                <div style={{ color: '#B3C0D9', fontSize: '0.975rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us when creating an account, posting reviews, or submitting applications:
                        </p>
                        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li><strong>Job Seekers:</strong> Name, email address, role, resume files, LinkedIn URL, portfolio URL, cover letters, and application history.</li>
                            <li><strong>Employees:</strong> Name, work email address, company details, job postings, and verification proof files.</li>
                            <li><strong>Transaction Data:</strong> Razorpay order and payment IDs, token ledger data, and purchase history.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>2. How We Use Your Information</h2>
                        <p>
                            We process collected data to operate the marketplace safely:
                        </p>
                        <ul style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <li>To authenticate accounts via Google OAuth.</li>
                            <li>To share resumes and application metadata with verified employees whose listings you apply to.</li>
                            <li>To process token purchases securely through Razorpay.</li>
                            <li>To verify employment status using official work domains.</li>
                            <li>To audit token transactions and detect fraudulent activity.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>3. Resume Security & Signed URLs</h2>
                        <p>
                            We value candidate privacy. Resumes uploaded to the Platform are saved in private Supabase storage buckets. Employees and candidates access them through securely signed, expiring URLs. Unauthorized users cannot browse or search public resumes.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ color: '#E8EDF5', fontFamily: 'var(--font-head)', fontSize: '1.4rem', marginBottom: 12 }}>4. Data Deletion and Deletion Requests</h2>
                        <p>
                            You have the right to request deletion of your account and personal data. To trigger a data deletion request or export your profile history, please email us directly.
                        </p>
                    </section>

                    <section style={{ borderTop: '1px solid rgba(0,240,255,0.08)', paddingTop: 24 }}>
                        <p>
                            If you have questions about this Policy or our data security practices, contact us at <a href="mailto:support@referkaro.app" style={{ color: '#00F0FF' }}>support@referkaro.app</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
