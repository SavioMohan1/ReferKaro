import Link from 'next/link'
import {
    ArrowRight,
    BellRing,
    BriefcaseBusiness,
    CheckCircle2,
    FileText,
    MailCheck,
    Search,
    ShieldCheck,
    UserRoundCheck,
    UsersRound,
} from 'lucide-react'
import Footer from '@/components/layout/footer'
import { TOKEN_PLANS } from '@/lib/pricing'

const features = [
    {
        icon: Search,
        title: 'Reviewed openings',
        description: 'Browse active employee-posted listings after they pass the platform review flow.',
    },
    {
        icon: FileText,
        title: 'Complete applications',
        description: 'Submit your profile, resume and supporting links through one structured request.',
    },
    {
        icon: UserRoundCheck,
        title: 'Employee decisions',
        description: 'Employees review applications in their workspace and record a clear outcome.',
    },
    {
        icon: UsersRound,
        title: 'Flexible review formats',
        description: 'Listings can use either a single-candidate workflow or a defined candidate pool.',
    },
    {
        icon: BellRing,
        title: 'Status notifications',
        description: 'Follow application changes and see the next required action from your dashboard.',
    },
    {
        icon: MailCheck,
        title: 'Proxy email handoff',
        description: 'Selected applications can receive a dedicated proxy address during completion.',
    },
]

const steps = [
    {
        title: 'Choose your role',
        description: 'Sign in with Google, then continue as a job seeker or an employee who can refer candidates.',
    },
    {
        title: 'Create the connection',
        description: 'Job seekers apply with one token. Employees verify employment, publish listings and review requests.',
    },
    {
        title: 'Follow every handoff',
        description: 'The application records review, selection, payment and referral-completion states in one place.',
    },
]

function Brand() {
    return (
        <Link href="/" className="rk-brand" aria-label="ReferKaro home">
            <span className="rk-brand-mark">RK</span>
            <span>ReferKaro</span>
        </Link>
    )
}

export default function LandingPage() {
    return (
        <div className="rk-landing">
            <header className="rk-landing-nav">
                <div className="rk-shell rk-nav-inner">
                    <Brand />
                    <nav className="rk-nav-links" aria-label="Main navigation">
                        <a className="rk-nav-link" href="#paths">For both sides</a>
                        <a className="rk-nav-link" href="#workflow">How it works</a>
                        <a className="rk-nav-link" href="#pricing">Pricing</a>
                    </nav>
                    <div className="rk-nav-actions">
                        <Link href="/login" className="rk-nav-link">Sign in</Link>
                        <Link href="/login" className="rk-button rk-button-primary">Enter beta</Link>
                    </div>
                </div>
            </header>

            <section className="rk-hero">
                <div className="rk-shell rk-hero-grid">
                    <div className="rk-hero-copy rk-rise">
                        <div className="rk-eyebrow"><span className="rk-beta">BETA</span> A clearer referral workflow</div>
                        <h1>Careers move through <em>people.</em></h1>
                        <p>
                            ReferKaro gives job seekers and referring employees one trustworthy place to create,
                            review and track a referral request from first contact to final status.
                        </p>
                        <div className="rk-hero-actions">
                            <Link href="/login" className="rk-button rk-button-primary">
                                I need a referral <ArrowRight size={17} />
                            </Link>
                            <Link href="/login" className="rk-button rk-button-secondary">
                                I can refer candidates <BriefcaseBusiness size={17} />
                            </Link>
                        </div>
                    </div>

                    <div className="rk-route-card rk-rise-delay" aria-label="Illustration of a tracked referral handoff">
                        <div className="rk-route-label rk-eyebrow">One visible path</div>
                        <div className="rk-route-line" aria-hidden="true" />
                        <div className="rk-route-node" data-node="candidate">
                            <span>Job seeker</span>
                            <strong>Application ready</strong>
                        </div>
                        <div className="rk-route-node" data-node="employee">
                            <span>Verified employee</span>
                            <strong>Review in progress</strong>
                        </div>
                        <div className="rk-route-node" data-node="outcome">
                            <span>Tracked outcome</span>
                            <strong>Status updated</strong>
                        </div>
                    </div>
                </div>
            </section>

            <div className="rk-trust-strip" aria-label="Platform safeguards">
                <div className="rk-shell rk-trust-grid">
                    <div className="rk-trust-item"><strong>Google sign-in</strong><span>One account entry point</span></div>
                    <div className="rk-trust-item"><strong>Employment checks</strong><span>Verification before listing</span></div>
                    <div className="rk-trust-item"><strong>Reviewed listings</strong><span>Admin approval workflow</span></div>
                    <div className="rk-trust-item"><strong>Visible statuses</strong><span>Recorded application progress</span></div>
                </div>
            </div>

            <section className="rk-section" id="paths">
                <div className="rk-shell">
                    <div className="rk-section-heading">
                        <h2>Two sides.<br />One standard of trust.</h2>
                        <p>
                            Equal emphasis does not mean one vague experience. Each role gets a distinct pathway,
                            language and next action while sharing the same application record.
                        </p>
                    </div>
                    <div className="rk-path-grid">
                        <article className="rk-path-card">
                            <div className="rk-path-number">01</div>
                            <h3>Find someone who can open the door.</h3>
                            <p>Browse approved referral listings, submit one complete application and track what happens next.</p>
                            <Link href="/login" className="rk-card-link">Continue as a job seeker <ArrowRight size={15} /></Link>
                        </article>
                        <article className="rk-path-card" data-tone="employee">
                            <div className="rk-path-number">02</div>
                            <h3>Help the right candidate reach your team.</h3>
                            <p>Verify your employment, publish an opening and review referral requests in a dedicated workspace.</p>
                            <Link href="/login" className="rk-card-link">Continue as an employee <ArrowRight size={15} /></Link>
                        </article>
                    </div>
                </div>
            </section>

            <section className="rk-section rk-section-muted">
                <div className="rk-shell">
                    <div className="rk-section-heading">
                        <h2>Built around real handoffs.</h2>
                        <p>Every feature below maps to a workflow currently implemented in the repository. No invented outcomes or traction claims.</p>
                    </div>
                    <div className="rk-feature-grid">
                        {features.map(({ icon: Icon, title, description }) => (
                            <article className="rk-feature-card" key={title}>
                                <Icon className="rk-feature-icon" size={25} strokeWidth={1.8} />
                                <h3>{title}</h3>
                                <p>{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rk-section" id="workflow">
                <div className="rk-shell">
                    <div className="rk-section-heading">
                        <h2>Know where the request stands.</h2>
                        <p>The service is designed around explicit steps and recorded decisions, not promises of a particular hiring result.</p>
                    </div>
                    <div className="rk-steps">
                        {steps.map(step => (
                            <article className="rk-step" key={step.title}>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rk-section rk-section-muted" id="pricing">
                <div className="rk-shell">
                    <div className="rk-section-heading">
                        <h2>Simple token packs.</h2>
                        <p>One token is used for each application. These prices come directly from the packs configured in the application.</p>
                    </div>
                    <div className="rk-price-grid">
                        {TOKEN_PLANS.map(plan => (
                            <article className="rk-price-card" data-featured={plan.popular} key={plan.id}>
                                <div className="rk-price-name">{plan.name}</div>
                                <div className="rk-price">₹{plan.price}</div>
                                <p>{plan.tokens} application tokens</p>
                                <ul>
                                    <li><CheckCircle2 size={14} /> One token per application</li>
                                    <li><CheckCircle2 size={14} /> Resume and profile submission</li>
                                    <li><CheckCircle2 size={14} /> Application status tracking</li>
                                </ul>
                                <Link href="/login" className={`rk-button ${plan.popular ? 'rk-button-secondary' : 'rk-button-primary'}`}>
                                    Choose {plan.name}
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rk-section">
                <div className="rk-shell rk-beta-panel">
                    <div>
                        <div className="rk-eyebrow"><ShieldCheck size={14} /> Product status</div>
                        <h2>Built openly in beta.</h2>
                        <p>Core workflows are being tested and improved. Features, eligibility and pricing may change as ReferKaro develops.</p>
                    </div>
                    <Link href="/login" className="rk-button rk-button-secondary">Explore the beta <ArrowRight size={17} /></Link>
                </div>
            </section>

            <Footer />
        </div>
    )
}
