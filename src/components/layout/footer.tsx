import Link from 'next/link'

const productLinks = [
    ['Browse jobs', '/jobs'],
    ['Join as an employee', '/login'],
    ['Token packs', '/#pricing'],
    ['Share feedback', '/feedback'],
]

const companyLinks = [
    ['About ReferKaro', '/about'],
    ['Contact', '/contact'],
    ['Support', 'mailto:support@referkaro.app'],
]

const legalLinks = [
    ['Terms', '/terms'],
    ['Privacy', '/privacy'],
    ['Refund policy', '/refund-policy'],
    ['Referral disclaimer', '/referral-disclaimer'],
]

function FooterList({ title, links }: { title: string; links: string[][] }) {
    return (
        <div>
            <h3>{title}</h3>
            <ul>
                {links.map(([label, href]) => (
                    <li key={label}><Link href={href}>{label}</Link></li>
                ))}
            </ul>
        </div>
    )
}

export default function Footer() {
    return (
        <footer className="rk-footer">
            <div className="rk-shell">
                <div className="rk-footer-grid">
                    <div>
                        <Link href="/" className="rk-brand" aria-label="ReferKaro home">
                            <span className="rk-brand-mark">RK</span>
                            <span>ReferKaro</span>
                        </Link>
                        <p className="rk-footer-copy">
                            A beta platform for job seekers to request referrals and employees to review candidates through a tracked workflow.
                        </p>
                    </div>
                    <FooterList title="Product" links={productLinks} />
                    <FooterList title="Company" links={companyLinks} />
                    <FooterList title="Legal" links={legalLinks} />
                </div>
                <div className="rk-footer-bottom">
                    <span>© {new Date().getFullYear()} ReferKaro</span>
                    <span><strong>BETA</strong> · Public preview</span>
                </div>
            </div>
        </footer>
    )
}
