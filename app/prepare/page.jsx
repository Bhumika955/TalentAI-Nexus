"use client";
import { useState } from "react";
import { companies } from "../../data/companies";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", badge: "bg-teal-100 text-teal-800" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", badge: "bg-purple-100 text-purple-800" },
  green: { bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100 text-green-800" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", badge: "bg-orange-100 text-orange-800" },
};

export default function Prepare() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("hr");
 
  if (!user) {
  return <LoginPrompt page="Interview Preparation" />;
}

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Company Wise Prep
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Prepare for Your Interview
          </h1>
          <p className="text-gray-500">
            Choose a company — get curated HR + Technical questions
          </p>
        </div>

        {/* Company Cards */}
        {!selected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {companies.map((company) => {
              const colors = colorMap[company.color];
              return (
                <div
                  key={company.id}
                  onClick={() => setSelected(company)}
                  className="bg-white border border-gray-100 rounded-xl p-6 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  {/* Logo */}
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                    <span className={`font-bold text-lg ${colors.text}`}>
                      {company.name[0]}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-gray-400 text-xs mb-3">{company.fullName}</p>

                  {/* Info */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Package</span>
                      <span className="text-gray-700 font-medium">{company.package}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Difficulty</span>
                      <span className="text-gray-700 font-medium">{company.difficulty}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Role</span>
                      <span className="text-gray-700 font-medium">{company.role}</span>
                    </div>
                  </div>

                  <div className={`text-xs px-3 py-1.5 rounded-full ${colors.badge} inline-block`}>
                    {company.questions.hr.length + company.questions.technical.length} Questions
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Questions View */}
        {selected && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-gray-900 transition-all"
            >
              ← Back to Companies
            </button>

            {/* Company Header */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 ${colorMap[selected.color].bg} rounded-xl flex items-center justify-center`}>
                  <span className={`font-bold text-xl ${colorMap[selected.color].text}`}>
                    {selected.name[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selected.name}</h2>
                  <p className="text-gray-500 text-sm">{selected.fullName}</p>
                </div>
              </div>

              {/* Process */}
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <span className="text-xs text-gray-500">Interview Process: </span>
                <span className="text-xs text-gray-700 font-medium">{selected.process}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab("hr")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all
                  ${tab === "hr"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                HR Questions ({selected.questions.hr.length})
              </button>
              <button
                onClick={() => setTab("technical")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all
                  ${tab === "technical"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Technical ({selected.questions.technical.length})
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {selected.questions[tab].map((question, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-blue-600 font-medium text-sm mt-0.5">
                      Q{index + 1}.
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{question}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}