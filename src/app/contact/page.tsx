import { Mail, MessageSquareText, MapPin } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="container mx-auto py-16 px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Whether you have a question about our platform, pricing, or need technical support, our team is ready to answer all your questions.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageSquareText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Chat with Support</h3>
                    <p className="text-slate-600 text-sm">We're here to help you navigate our platform and resolve issues.</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold">Email Us</h3>
                    <p className="text-slate-600 text-sm">Drop us a line and we'll get back to you within 24 hours.</p>
                    <a href="mailto:support@referkaro.com" className="inline-block mt-4 text-purple-600 font-semibold hover:underline">
                        support@referkaro.com
                    </a>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
                    <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold">Office Location</h3>
                    <p className="text-slate-600 text-sm">Come say hello at our headquarters in Bangalore.</p>
                    <p className="font-semibold text-sm mt-4">Bangalore, India</p>
                </div>
            </div>
        </div>
    )
}
