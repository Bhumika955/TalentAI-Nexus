"use client";
import { useRouter } from "next/navigation";

const stats = [
  { value: "500+", label: "Questions" },
  { value: "8+", label: "Companies" },
  { value: "3", label: "AI Features" },
  { value: "Free", label: "Always" },
];

const features = [
  {
    icon: "🔍",
    title: "Fake Job Verifier",
    desc: "Paste any job description — AI detects red flags instantly",
    link: "/verify",
    linkText: "Verify now →",
    color: { bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-200" },
  },
  {
    icon: "📚",
    title: "Interview Preparation",
    desc: "TCS, Infosys, Wipro — curated questions with tips & tricks",
    link: "/prepare",
    linkText: "Start preparing →",
    color: { bg: "bg-green-50", text: "text-green-600", border: "hover:border-green-200" },
  },
  {
    icon: "🤖",
    title: "AI Mock Interview",
    desc: "Real-time AI questions + instant feedback on your answers",
    link: "/interview",
    linkText: "Practice now →",
    color: { bg: "bg-purple-50", text: "text-purple-600", border: "hover:border-purple-200" },
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 px-6 py-20">
        <div className="max-w-4xl mx-auto">

          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
            AI-powered career platform for freshers
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-semibold text-gray-900 leading-tight mb-5">
            Land your first job <br />
            <span className="text-blue-600">smarter & safer</span>
          </h1>

          {/* Subtext */}
          <p className="text-gray-500 text-lg mb-10 max-w-xl leading-relaxed">
            Verify fake jobs before applying, prepare company-wise, and practice
            with an AI interviewer — all free, all in one place.
          </p>

          {/* CTA Buttons — linked */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => router.push("/interview")}
              className="bg-blue-600 text-white px-7 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
            >
              🤖 Start Mock Interview
            </button>
            <button
              onClick={() => router.push("/verify")}
              className="border border-gray-200 text-gray-700 px-7 py-3 rounded-lg text-sm hover:bg-gray-50 transition-all"
            >
              🔍 Verify a Job
            </button>
            <button
              onClick={() => router.push("/prepare")}
              className="border border-gray-200 text-gray-700 px-7 py-3 rounded-lg text-sm hover:bg-gray-50 transition-all"
            >
              📚 Interview Preparation
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-6 py-14 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-8 text-center">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Paste a job or pick a company", "AI analyzes or asks you questions", "Get instant results or feedback"].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards — clickable */}
      <section className="px-6 pb-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Everything you need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              onClick={() => router.push(f.link)}
              className={`bg-white border border-gray-100 rounded-xl p-6 cursor-pointer transition-all ${f.color.border} hover:shadow-sm`}
            >
              <div className={`w-10 h-10 ${f.color.bg} rounded-lg flex items-center justify-center mb-4 text-lg`}>
                {f.icon}
              </div>
              <h3 className="text-gray-900 font-medium mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
              <span className={`${f.color.text} text-xs font-medium`}>{f.linkText}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-semibold text-blue-600">{s.value}</div>
                <div className="text-gray-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}