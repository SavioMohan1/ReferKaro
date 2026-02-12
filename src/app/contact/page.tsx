export default function ContactPage() {
    return (
        <div className="container mx-auto py-20 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 mb-8">
                Have questions? We'd love to hear from you.
            </p>
            <div className="inline-block bg-slate-100 p-8 rounded-lg">
                <p className="font-semibold">Email us at:</p>
                <a href="mailto:support@referkaro.com" className="text-blue-600 text-lg hover:underline">
                    support@referkaro.com
                </a>
            </div>
        </div>
    )
}
