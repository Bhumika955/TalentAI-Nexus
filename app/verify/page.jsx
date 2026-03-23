"use client";
import { useState } from "react";

export default function VerifyJob() {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!jobText.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobText }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
            AI Powered
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Fake Job Verifier
          </h1>
          <p className="text-gray-500">
            Paste any job description — AI will detect red flags instantly
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Paste Job Description
          </label>
          <textarea
            rows={8}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste the full job description here — title, company, salary, requirements..."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-blue-400 transition-all"
          />

          <button
            onClick={handleVerify}
            disabled={loading || !jobText.trim()}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Verify This Job"}
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white border border-gray-100 rounded-xl p-6">

            {/* Verdict */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6
              ${result.verdict === "Safe"
                ? "bg-green-50 text-green-700"
                : result.verdict === "Suspicious"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
              }`}>
              <div className={`w-2 h-2 rounded-full
                ${result.verdict === "Safe" ? "bg-green-500"
                : result.verdict === "Suspicious" ? "bg-yellow-500"
                : "bg-red-500"}`}>
              </div>
              {result.verdict}
            </div>

            {/* Score */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Legitimacy Score</span>
                <span className="font-medium text-gray-900">{result.score}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all
                    ${result.score > 70 ? "bg-green-500"
                    : result.score > 40 ? "bg-yellow-500"
                    : "bg-red-500"}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* Red Flags */}
            {result.redFlags?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-red-600 mb-2">
                  Red Flags
                </h3>
                <ul className="space-y-2">
                  {result.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 mt-0.5">✕</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Green Flags */}
            {result.greenFlags?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-green-600 mb-2">
                  Green Flags
                </h3>
                <ul className="space-y-2">
                  {result.greenFlags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.summary}
              </p>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}