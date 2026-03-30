"use client";
import { useState } from "react";
import { featuredCompanies } from "../../data/companies";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

export default function Prepare() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [loadingCompany, setLoadingCompany] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [tab, setTab] = useState("hr");
  const [aiCompany, setAiCompany] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [shuffled] = useState(() => {
    const arr = [...featuredCompanies];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  if (!user) return <LoginPrompt page="Interview Preparation" />;

  const fetchCompanyData = async (companyName, role = "", difficulty = "") => {
    setLoadingCompany(companyName + role);
    setSelectedData(null);
    try {
      const res = await fetch("/api/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName, role, difficulty }),
      });
      const data = await res.json();
      setSelectedData({ ...data, companyName });
      setTab("hr");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCompany(null);
    }
  };

  const isFiltered =
    activeCategory !== "All" ||
    activeDifficulty !== "All" ||
    packageFilter !== "All" 
    

  const filtered = (isFiltered || sortBy !== "default" ? featuredCompanies : shuffled)
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || c.category === activeCategory;
      const matchDiff = activeDifficulty === "All" || c.difficulty === activeDifficulty;
      const matchPackage =
        packageFilter === "All" ||
        (packageFilter === "0-10" && parseInt(c.package) <= 10) ||
        (packageFilter === "10-20" && parseInt(c.package) >= 10 && parseInt(c.package) <= 20) ||
        (packageFilter === "20+" && parseInt(c.package) >= 20);
      return matchSearch && matchCat && matchDiff && matchPackage;
    })
    
  // Company Detail View
  if (selectedData) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-2xl mx-auto">

          <button
            onClick={() => setSelectedData(null)}
            className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
          >
            ← Back to Companies
          </button>

          <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">AI Generated</div>
                <h1 className="text-2xl font-semibold text-gray-900">{selectedData.fullName}</h1>
                <p className="text-gray-500 text-sm mt-1">{selectedData.role}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">{selectedData.package}</div>
                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block
                  ${selectedData.difficulty === "Very Hard" ? "bg-red-50 text-red-600"
                  : selectedData.difficulty === "Hard" ? "bg-orange-50 text-orange-600"
                  : selectedData.difficulty === "Medium" ? "bg-yellow-50 text-yellow-600"
                  : "bg-green-50 text-green-600"}`}>
                  {selectedData.difficulty}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              <span className="font-medium text-gray-500">Process:</span> {selectedData.process}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {["hr", "technical"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all
                  ${tab === t
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {t === "hr" ? "🤝 HR Questions" : "💻 Technical Questions"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {selectedData.questions[tab]?.map((q, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
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
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            AI-Powered Preparation
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Interview Preparation</h1>
          <p className="text-gray-500">Click any company — AI generates real questions instantly</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">

          <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="All">🏢 All Categories</option>
            <option value="Indian IT">Indian IT</option>
            <option value="Product">Product</option>
            <option value="Global MNC">Global MNC</option>
          </select>

          <select value={activeDifficulty} onChange={(e) => setActiveDifficulty(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="All">🎯 All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Very Hard">Very Hard</option>
          </select>

          <select value={packageFilter} onChange={(e) => setPackageFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-white focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="All">💰 All Packages</option>
            <option value="0-10">0 - 10 LPA</option>
            <option value="10-20">10 - 20 LPA</option>
            <option value="20+">20+ LPA</option>
          </select>


          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-400">{filtered.length} companies</span>
            {(activeCategory !== "All" || activeDifficulty !== "All" || packageFilter !== "All" || sortBy !== "default" || search !== "") && (
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setActiveDifficulty("All");
                  setPackageFilter("All");
                  setSortBy("default");
                  setSearch("");
                }}
                className="text-xs text-red-400 hover:text-red-600 transition-all"
              >
                Reset ✕
              </button>
            )}
          </div>

        </div>

        {/* Company Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {filtered.map((company) => {
            const c = colorMap[company.color];
            const isLoading = loadingCompany === company.name + company.role;
            return (
              <div
                key={company.id}
                onClick={() => !loadingCompany && fetchCompanyData(company.name, company.role, company.difficulty)}
                className={`bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all
                  ${isLoading ? "opacity-70 cursor-wait" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center`}>
                    {isLoading
                      ? <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      : <span className={`text-xs font-bold ${c.text}`}>{company.name.slice(0, 2)}</span>
                    }
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${company.difficulty === "Very Hard" ? "bg-red-50 text-red-500"
                    : company.difficulty === "Hard" ? "bg-orange-50 text-orange-500"
                    : company.difficulty === "Medium" ? "bg-yellow-50 text-yellow-600"
                    : "bg-green-50 text-green-600"}`}>
                    {company.difficulty}
                  </span>
                </div>

                <div className="text-sm font-semibold text-gray-800">{company.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 mb-2">{company.category}</div>
                <div className="text-xs text-gray-500 mb-1 truncate">💼 {company.role}</div>
                <div className={`text-xs font-medium ${c.text}`}>💰 {company.package}</div>

                {isLoading && (
                  <div className="text-xs text-blue-500 mt-2 animate-pulse">Generating questions...</div>
                )}
              </div>
            );
          })}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm mb-6">
            No companies found — try AI search below!
          </div>
        )}

        {/* AI Custom Search */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span>🤖</span>
            <h2 className="text-gray-900 font-semibold">Search Any Company</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            Type any company worldwide — AI generates questions instantly
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. Salesforce, Goldman Sachs, Paytm..."
              value={aiCompany}
              onChange={(e) => setAiCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !aiLoading && fetchCompanyData(aiCompany)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 transition-all"
            />
            <button
              onClick={() => fetchCompanyData(aiCompany)}
              disabled={!aiCompany.trim() || !!loadingCompany}
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-all disabled:opacity-40"
            >
              {loadingCompany === aiCompany ? "Generating..." : "Generate →"}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}