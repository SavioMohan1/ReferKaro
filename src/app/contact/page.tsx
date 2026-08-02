import { ArrowUpRight, Mail, MessageSquareText } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
    return <main className="rk-contact-page"><section className="rk-contact-hero"><div className="rk-shell"><span className="rk-kicker">Contact</span><h1>Tell us what<br />needs attention.</h1><p>For account, product, or technical questions, use the support address below. No response-time commitment was found in the repository.</p></div></section><section className="rk-section"><div className="rk-shell rk-contact-grid"><a href="mailto:support@referkaro.app" className="rk-contact-card"><Mail size={24} /><span>Support email</span><h2>support@referkaro.app</h2><p>Account access, application flow, payments, or technical issues.</p><strong>Open email <ArrowUpRight size={16} /></strong></a><Link href="/feedback" className="rk-contact-card"><MessageSquareText size={24} /><span>Product feedback</span><h2>Help improve the beta.</h2><p>Share a confusing moment, a missing feature, or a workflow problem.</p><strong>Share feedback <ArrowUpRight size={16} /></strong></Link></div></section></main>
}
