import { ShieldCheck, Target, Users, Zap } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="page-wrapper" style={{
            paddingTop: '80px', position: 'relative', overflow: 'hidden',
            backgroundImage: "url('/images/city_silhouette_bg.png')",
            backgroundSize: 'cover', backgroundPosition: 'center 30%',
        }}>
            {/* Dark overlay */}
            <div style={{ position:'absolute', inset:0, background:'rgba(5,10,20,0.6)', zIndex:0 }} />

            <div className="glow-orb glow-cyan" style={{ width:500, height:500, top:-100, right:-100, opacity:0.5 }} />
            <div className="glow-orb glow-violet" style={{ width:400, height:400, bottom:-100, left:-80, opacity:0.4 }} />

            <div className="page-container" style={{ paddingBottom: 80, position:'relative', zIndex:1 }}>
                {/* Header */}
                <div style={{ textAlign:'center', marginBottom:64 }}>
                    <span className="dk-chip" style={{ marginBottom:16, display:'inline-block' }}>Our Story</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:700, color:'#E8EDF5', marginBottom:16 }}>
                        Democratizing <span style={{ color:'#00F0FF' }}>Career Opportunities</span>
                    </h1>
                    <p style={{ fontSize:'1.05rem', color:'#6B7A99', maxWidth:600, margin:'0 auto', lineHeight:1.75 }}>
                        ReferKaro connects ambitious professionals with verified tech insiders, turning the black hole of job applications into a guaranteed human review.
                    </p>
                </div>

                {/* Problem / Solution */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:24, marginBottom:48 }}>
                    <div className="dk-card dk-card-inner">
                        <div style={{ width:44,height:44,background:'rgba(123,94,255,0.12)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
                            <Target size={22} color="#7B5EFF" />
                        </div>
                        <h3 style={{ fontSize:'1.1rem', color:'#E8EDF5', marginBottom:10 }}>The Problem</h3>
                        <p style={{ fontSize:'0.9rem', color:'#6B7A99', lineHeight:1.7 }}>
                            The ATS is broken. Talented individuals send hundreds of applications and never hear back. The only reliable path is a referral — but "who you know" shouldn't dictate your career trajectory.
                        </p>
                    </div>

                    <div className="dk-card dk-card-inner">
                        <div style={{ width:44,height:44,background:'rgba(0,240,255,0.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
                            <Zap size={22} color="#00F0FF" />
                        </div>
                        <h3 style={{ fontSize:'1.1rem', color:'#E8EDF5', marginBottom:10 }}>The Solution</h3>
                        <p style={{ fontSize:'0.9rem', color:'#6B7A99', lineHeight:1.7 }}>
                            We incentivize employees to review and refer. A small verifiable token fee ensures a real human in your target company reviews your profile. Match? You get a referral.
                        </p>
                    </div>
                </div>

                {/* Trust block */}
                <div className="dk-card" style={{ padding:'56px 48px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                    <div className="glow-orb glow-cyan" style={{ width:300, height:300, top:'50%', left:'50%', transform:'translate(-50%,-50%)', opacity:0.3 }} />
                    <Users size={40} color="#00F0FF" style={{ marginBottom:16, position:'relative' }} />
                    <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.8rem', color:'#E8EDF5', marginBottom:14, position:'relative' }}>Built for Trust</h2>
                    <p style={{ fontSize:'1rem', color:'#6B7A99', maxWidth:560, margin:'0 auto', lineHeight:1.75, position:'relative' }}>
                        Our platform relies on a secure "Proxy Email" system. This ensures privacy for both employee and candidate, while automated tracking guarantees transparency and prevents fraud.
                    </p>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:32, marginTop:48, position:'relative' }}>
                        {[['500+','Verified Referrers'],['₹10L+','Bonuses Earned'],['98%','Response Rate'],['24h','Avg. Turnaround']].map(([v,l]) => (
                            <div key={l}>
                                <div style={{ fontFamily:'var(--font-head)', fontSize:'2rem', fontWeight:800, color:'#00F0FF' }}>{v}</div>
                                <div style={{ fontSize:'0.8rem', color:'#6B7A99', marginTop:4 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mission */}
                <div style={{ marginTop:48, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
                    {[
                        { icon:'🏆', title:'Our Mission', desc:'To democratize access to career opportunities so talent always beats connections.' },
                        { icon:'🔒', title:'Our Values', desc:'Transparency, accountability, and privacy at every step of the referral process.' },
                        { icon:'🌏', title:'Our Vision', desc:'A world where every qualified candidate gets a fair shot at their dream job.' },
                    ].map(item => (
                        <div key={item.title} className="dk-card dk-card-inner">
                            <div style={{ fontSize:28, marginBottom:14 }}>{item.icon}</div>
                            <h3 style={{ fontSize:'1rem', color:'#E8EDF5', marginBottom:8 }}>{item.title}</h3>
                            <p style={{ fontSize:'0.875rem', color:'#6B7A99', lineHeight:1.65 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
