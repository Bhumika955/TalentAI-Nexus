"use client";
import { useState } from "react";
import { companies } from "../../data/companies";

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", dot: "bg-teal-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
};

export default function Prepare() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("hr");

  if (selected) {
    const company = companies.find((c) => c.id === selected);
    const c = colorMap[company.color];
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-2xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
          >
            ← Back to Companies
          </button>

          {/* Header */}
          <div className={`${c.bg} border ${c.border} rounded-xl p-6 mb-6`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className={`text-2xl font-semibold ${c.text}`}>{company.name}</h1>
                <p className="text-gray-500 text-sm mt-1">{company.fullName}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">{company.package}</div>
                <div className="text-xs text-gray-400 mt-1">{company.role}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <span className="font-medium">Process:</span> {company.process}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {["hr", "technical"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all
                  ${tab === t ? `${c.bg} ${c.text}` : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                {t === "hr" ? "HR Questions" : "Technical Questions"}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {company.questions[tab].map((q, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full ${c.bg} ${c.text} text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5`}>
                  {i + 1}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{q}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Company-wise Prep
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Interview Preparation</h1>
          <p className="text-gray-500">Choose a company to see curated HR + Technical questions</p>
        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companies.map((company) => {
            const c = colorMap[company.color];
            return (
              <div
                key={company.id}
                onClick={() => setSelected(company.id)}
                className="bg-white border border-gray-100 rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center`}>
                    <span className={`text-sm font-bold ${c.text}`}>
                      {company.name.slice(0, 2)}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${c.bg} ${c.text}`}>
                    {company.difficulty}
                  </span>
                </div>
                <h3 className="text-gray-900 font-medium mb-1">{company.name}</h3>
                <p className="text-gray-400 text-xs mb-3">{company.role}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{company.package}</span>
                  <span className={`text-xs font-medium ${c.text}`}>View Questions →</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}