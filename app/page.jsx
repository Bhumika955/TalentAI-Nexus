export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 px-6 py-16">
        <div className="max-w-4xl mx-auto">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            AI-powered career platform
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-semibold text-gray-900 leading-tight mb-4">
            Your smartest <br />
            <span className="text-blue-600">career companion</span>
          </h1>

          {/* Subtext */}
          <p className="text-gray-500 text-lg mb-8 max-w-xl">
            Verify fake jobs, prepare company-wise, and practice AI mock
            interviews — all in one place. Free forever.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
              Start Mock Interview
            </button>
            <button className="border border-gray-200 text-gray-700 px-6 py-3 rounded-lg text-sm hover:bg-gray-50 transition-all">
              Verify a Job
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-lg">🔍</span>
            </div>
            <h3 className="text-gray-900 font-medium mb-2">Fake Job Verifier</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Paste any job description — AI detects red flags instantly
            </p>
            <span className="text-blue-600 text-xs mt-4 block">Verify now →</span>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-lg">📚</span>
            </div>
            <h3 className="text-gray-900 font-medium mb-2">Company Prep</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              TCS, Infosys, Wipro — curated questions with tips & tricks
            </p>
            <span className="text-green-600 text-xs mt-4 block">Start preparing →</span>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-all cursor-pointer">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-lg">🤖</span>
            </div>
            <h3 className="text-gray-900 font-medium mb-2">AI Mock Interview</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Real-time AI questions + instant feedback on your answers
            </p>
            <span className="text-purple-600 text-xs mt-4 block">Practice now →</span>
          </div>

        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">500+</div>
            <div className="text-gray-500 text-xs mt-1">Questions</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">8+</div>
            <div className="text-gray-500 text-xs mt-1">Companies</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">3</div>
            <div className="text-gray-500 text-xs mt-1">AI Features</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5 text-center">
            <div className="text-2xl font-semibold text-gray-900">Free</div>
            <div className="text-gray-500 text-xs mt-1">Always</div>
          </div>
        </div>
      </section>

    </main>
  );
}