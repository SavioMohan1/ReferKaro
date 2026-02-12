export default function FeedbackPage() {
    return (
        <div className="container mx-auto py-20 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">We Value Your Feedback</h1>
            <p className="text-gray-600 text-center mb-8">
                Help us improve ReferKaro. Let us know what features you'd like to see next!
            </p>

            <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Your Feedback</label>
                    <textarea
                        className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Tell us what you think..."
                    />
                </div>
                <button
                    type="button"
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => alert('Thank you for your feedback!')}
                >
                    Submit Feedback
                </button>
            </form>
        </div>
    )
}
