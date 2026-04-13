import { Mail, MessageSquareText, MapPin } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="page-wrapper" style={{
            paddingTop: 80, position: 'relative', overflow: 'hidden',
            backgroundImage: "url('/images/hero_bg_mesh.png')",
            backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(5,10,20,0.55)', zIndex:0 }} />

            <div className="page-container" style={{ paddingBottom:80, position:'relative', zIndex:1 }}>
                <div style={{ textAlign:'center', marginBottom:56 }}>
                    <span className="dk-chip" style={{ marginBottom:14, display:'inline-block' }}>Get In Touch</span>
                    <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'#E8EDF5', marginBottom:12 }}>
                        We'd Love to Hear From You
                    </h1>
                    <p style={{ fontSize:'1rem', color:'#6B7A99', maxWidth:500, margin:'0 auto', lineHeight:1.7 }}>
                        Questions about pricing, platform, or technical support — our team responds within 24 hours.
                    </p>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24, marginBottom:48 }}>
                    {[
                        { icon: <MessageSquareText size={24} color="#00F0FF" />, title:'Chat Support', desc:"We're here to help you navigate our platform and resolve any issues fast.", extra:null },
                        { icon: <Mail size={24} color="#7B5EFF" />, title:'Email Us', desc:'Drop us a line and we\'ll get back within 24 hours.', extra:<a href="mailto:support@referkaro.com" style={{ color:'#00F0FF', fontWeight:600, fontSize:'0.875rem', marginTop:12, display:'block' }}>support@referkaro.com</a> },
                        { icon: <MapPin size={24} color="#00F0FF" />, title:'Our Office', desc:'Come say hello at our headquarters in the heart of Bangalore.', extra:<p style={{ color:'#E8EDF5', fontWeight:600, fontSize:'0.875rem', marginTop:12 }}>Bangalore, India</p> },
                    ].map(item => (
                        <div key={item.title} className="dk-card" style={{ padding:32, textAlign:'center' }}>
                            <div style={{ width:56,height:56,borderRadius:'50%',background:'rgba(0,240,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px' }}>
                                {item.icon}
                            </div>
                            <h3 style={{ fontSize:'1rem', fontFamily:'var(--font-head)', color:'#E8EDF5', marginBottom:8 }}>{item.title}</h3>
                            <p style={{ fontSize:'0.875rem', color:'#6B7A99', lineHeight:1.65 }}>{item.desc}</p>
                            {item.extra}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="dk-card" style={{ padding:'40px 32px', textAlign:'center', background:'rgba(0,240,255,0.04)' }}>
                    <h2 style={{ fontFamily:'var(--font-head)', fontSize:'1.4rem', color:'#E8EDF5', marginBottom:10 }}>
                        Something Urgent?
                    </h2>
                    <p style={{ fontSize:'0.9rem', color:'#6B7A99', marginBottom:20 }}>
                        For critical account issues, reach us directly.
                    </p>
                    <a href="mailto:support@referkaro.com" className="dk-btn-primary" style={{ display:'inline-flex' }}>
                        Email Support Now →
                    </a>
                </div>
            </div>
        </div>
    )
}
