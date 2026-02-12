import Link from 'next/link'
import { ShieldCheck, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Column 1: Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 font-bold text-xl text-white">
                        <ShieldCheck className="h-6 w-6 text-blue-500" />
                        <span>ReferKaro</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        ReferKaro bridges the gap between talent and opportunity.
                        We ensure your resume gets seen by real employees, not just algorithms.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <Link href="#" className="hover:text-blue-400 transition-colors"><Twitter className="h-5 w-5" /></Link>
                        <Link href="#" className="hover:text-blue-400 transition-colors"><Linkedin className="h-5 w-5" /></Link>
                        <Link href="#" className="hover:text-blue-400 transition-colors"><Instagram className="h-5 w-5" /></Link>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                        <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                        <li><Link href="/jobs" className="hover:text-blue-400 transition-colors">Browse Jobs</Link></li>
                        <li><Link href="/employee" className="hover:text-blue-400 transition-colors">For Employees</Link></li>
                        <li><Link href="/feedback" className="hover:text-blue-400 transition-colors">Feedback</Link></li>
                    </ul>
                </div>

                {/* Column 3: Legal */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-blue-400 transition-colors">Refund Policy</Link></li>
                        <li><Link href="#" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
                    </ul>
                </div>

                {/* Column 4: Contact */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                            <span>123 Tech Park, Cyber City<br />Bangalore, Karnataka 560100</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-blue-500" />
                            <span>+91 98765 43210</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-blue-500" />
                            <a href="mailto:support@referkaro.com" className="hover:text-blue-400">support@referkaro.com</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} ReferKaro. All rights reserved.</p>
            </div>
        </footer>
    )
}
