import Link from 'next/link'

export default function AuthCodeErrorPage() {
    return <main className="rk-product-page"><section className="rk-shell rk-empty-state">
        <span className="rk-kicker">Sign-in issue</span>
        <h1>The sign-in link could not be completed.</h1>
        <p>The link may have expired or already been used. Start a fresh sign-in attempt.</p>
        <Link href="/login" className="rk-button rk-button-primary">Return to sign in</Link>
    </section></main>
}
