"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import LoginPrompt from "../components/LoginPrompt";

const roles = [
  { id: "frontend", label: "Frontend Developer", icon: "🖥️", gradient: "from-blue-500 to-cyan-400" },
  { id: "react", label: "React Developer", icon: "⚛️", gradient: "from-violet-500 to-purple-400" },
  { id: "backend", label: "Backend Developer", icon: "🔧", gradient: "from-orange-500 to-amber-400" },
  { id: "nodejs", label: "Node.js Developer", icon: "🟢", gradient: "from-green-500 to-emerald-400" },
  { id: "fullstack", label: "Full Stack Developer", icon: "⚡", gradient: "from-yellow-500 to-orange-400" },
  { id: "dsa", label: "DSA & Problem Solving", icon: "🧠", gradient: "from-pink-500 to-rose-400" },
  { id: "systemdesign", label: "System Design", icon: "🏗️", gradient: "from-indigo-500 to-blue-400" },
  { id: "dataanalyst", label: "Data Analyst", icon: "📊", gradient: "from-teal-500 to-cyan-400" },
  { id: "devops", label: "DevOps Engineer", icon: "🚀", gradient: "from-red-500 to-orange-400" },
  { id: "hr", label: "HR Role", icon: "🤝", gradient: "from-fuchsia-500 to-pink-400" },
];

// Common connector/filler words — never highlighted, never counted toward score
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "has",
  "have", "had", "with", "and", "or", "but", "that", "this", "these", "those",
  "of", "in", "on", "at", "to", "for", "from", "by", "as", "it", "its", "if",
  "then", "so", "not", "no", "do", "does", "did", "which", "who", "whom",
  "whose", "when", "where", "while", "than", "also", "into", "you", "your",
  "i", "we", "our", "they", "their", "them", "he", "she", "doesnt", "doesn't",
  "value", "changes", "change",
]);

const normalizeWord = (w) => w.toLowerCase().replace(/[^\w]/g, "");

// Small Levenshtein distance — lets typos like "gloabl" still match "global"
function editDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyIncludes(word, userWordsArr) {
  const maxDist = word.length <= 4 ? 1 : 2;
  return userWordsArr.some(
    (uw) =>
      uw === word ||
      (Math.abs(uw.length - word.length) <= maxDist &&
        editDistance(word, uw) <= maxDist)
  );
}

// Matches the "Note: ... final question ..." line so we can pull it out
// of the inline chat flow and show it as a popup instead.
const FINAL_QUESTION_REGEX = /final question/i;

export default function MockInterview() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [ended, setEnded] = useState(false);
  const [continued, setContinued] = useState(false);
  const [showFinalQuestionPopup, setShowFinalQuestionPopup] = useState(false);
  const continuedRef = useRef(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return <LoginPrompt page="Mock Interview" />;

  const activeRole = customRole.trim() || roles.find(r => r.id === selectedRole)?.label || selectedRole;

  // ✅ Word-level diff: highlights concept words the user covered (green) vs
  // missed (amber). Filler/connector words are skipped entirely and never
  // counted. Typos are still matched via edit-distance ("gloabl" ~ "global").
  // Returns { nodes, score } so callers can render a coverage % badge too.
  const renderIdealAnswerDiff = (idealText, userAnswerText) => {
    if (!userAnswerText) return { nodes: idealText, score: null };

    const userWordsArr = userAnswerText
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);

    let total = 0;
    let covered = 0;

    const nodes = idealText.split(/(\s+)/).map((token, idx) => {
      if (/^\s+$/.test(token) || !token) return token;

      const norm = normalizeWord(token);
      if (!norm || norm.length <= 2 || STOPWORDS.has(norm)) return token;

      total += 1;
      const isCovered = fuzzyIncludes(norm, userWordsArr);
      if (isCovered) covered += 1;

      return (
        <span
          key={idx}
          className={
            isCovered
              ? "bg-emerald-400/15 text-emerald-300 rounded-md px-1.5 py-0.5 mx-0.5 inline-block font-medium"
              : "bg-amber-400/15 text-amber-200 rounded-md px-1.5 py-0.5 mx-0.5 inline-block border border-amber-400/20"
          }
        >
          {token}
        </span>
      );
    });

    const score = total > 0 ? Math.round((covered / total) * 100) : null;
    return { nodes, score };
  };

  // Pulls "Ideal Answer: ..." out of a 💡 line and returns its diff/score.
  // Computed once per message so the Missing box can also reference the score.
  const extractIdealAnswer = (line, userAnswerText) => {
    const rest = line.slice(2).split(":").slice(1).join(":").trim();
    const idealMatch = rest.match(/Ideal Answer:\s*(.*)/i);
    const tipPart = idealMatch ? rest.slice(0, idealMatch.index).trim() : rest;
    const idealPart = idealMatch ? idealMatch[1].trim() : null;
    const diffResult = idealPart
      ? renderIdealAnswerDiff(idealPart, userAnswerText)
      : null;
    return { tipPart, idealPart, diffResult };
  };

  // ✅ formatAIMessage — component level pe, sendAnswer ke bahar
  const formatAIMessage = (text, userAnswerText) => {
    if (!text) return null;

    if (text.includes("INTERVIEW_COMPLETE")) {
      return (
        <div className="px-4 py-3 text-sm text-purple-300 font-medium">
          🎯 Interview Complete! See your results.
        </div>
      );
    }

    const lines = text.split("\n").filter(line => line.trim());
    const hasFeedback = lines.some(l =>
      l.startsWith("✅") || l.startsWith("❌") || l.startsWith("💡")
    );

    if (!hasFeedback) {
      return (
        <div className="px-4 py-3 text-sm leading-relaxed text-slate-200">
          {text}
        </div>
      );
    }

    // Precompute the ideal-answer diff once (if this message has a 💡 line)
    // so the ❌ Missing box can also reference the coverage %.
    const suggestionLine = lines.find(l => l.startsWith("💡"));
    const idealInfo = suggestionLine
      ? extractIdealAnswer(suggestionLine, userAnswerText)
      : null;

    // Guards against the AI occasionally duplicating a "Next Question:" line
    // within the same message — only the first one is rendered.
    let nextQuestionShown = false;

    return (
      <div className="p-3 space-y-3">
        {lines.map((line, i) => {
          if (line.startsWith("✅")) {
            return (
              <div
                key={i}
                className="rounded-2xl border border-green-400/20 bg-green-500/[0.07] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-400/15 text-sm">
                    ✅
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide text-green-300 mb-0.5">
                      {line.slice(2).split(":")[0]}
                    </div>
                    <div className="text-[13px] text-slate-200 leading-relaxed">
                      {line.slice(2).split(":").slice(1).join(":").trim()}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          if (line.startsWith("❌")) {
            return (
              <div
                key={i}
                className="rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-400/15 text-sm">
                    ❌
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide text-red-300 mb-0.5">
                      {line.slice(2).split(":")[0]}
                    </div>
                    <div className="text-[13px] text-slate-200 leading-relaxed">
                      {line.slice(2).split(":").slice(1).join(":").trim()}
                    </div>
                    {idealInfo?.diffResult?.score !== null &&
                      idealInfo?.diffResult?.score !== undefined &&
                      idealInfo.diffResult.score < 50 && (
                        <div className="text-[11px] text-red-300/80 mt-2 flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-red-400" />
                          You covered only {idealInfo.diffResult.score}% of the ideal answer — check the highlighted terms below.
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          }
          if (line.startsWith("💡")) {
            const label = line.slice(2).split(":")[0].trim();
            const { tipPart, idealPart, diffResult } = idealInfo || extractIdealAnswer(line, userAnswerText);

            return (
              <div
                key={i}
                className="rounded-2xl border border-yellow-400/20 bg-yellow-500/[0.07] p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400/15 text-sm">
                    💡
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wide text-yellow-300 mb-0.5">
                      {label}
                    </div>
                    {tipPart && (
                      <p className="text-[13px] text-slate-200 leading-relaxed">
                        {tipPart}
                      </p>
                    )}

                    {idealPart && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[11px] font-bold uppercase tracking-wide text-yellow-200/90 flex items-center gap-1.5">
                            <span>✓</span> Ideal Answer
                          </div>
                          {diffResult.score !== null && (
                            <span
                              className={`${diffResult.score >= 80
                                  ? "bg-emerald-500/90"
                                  : diffResult.score >= 50
                                    ? "bg-amber-500/90"
                                    : "bg-red-500/90"
                                } text-white text-[10px] font-semibold rounded-full px-2.5 py-1 shadow-sm`}
                            >
                              {diffResult.score}% covered
                            </span>
                          )}
                        </div>

                        {diffResult.score !== null && (
                          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-3">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                diffResult.score >= 80
                                  ? "bg-emerald-400"
                                  : diffResult.score >= 50
                                    ? "bg-amber-400"
                                    : "bg-red-400"
                              }`}
                              style={{ width: `${diffResult.score}%` }}
                            />
                          </div>
                        )}

                        <p className="text-[13px] leading-[2.1] text-slate-300">
                          {diffResult.nodes}
                        </p>

                        {userAnswerText && (
                          <div className="text-[10px] text-slate-500 mt-3 pt-2.5 border-t border-white/5 flex gap-4">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/15 border border-emerald-400/30" /> covered
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/15 border border-amber-400/30" /> missed
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          if (line.startsWith("Next Question:")) {
            // Only render the FIRST "Next Question:" line in this message.
            if (nextQuestionShown) return null;
            nextQuestionShown = true;
            return (
              <div
                key={i}
                className="rounded-2xl border border-purple-400/25 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5 p-4"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-purple-300 mb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-400/20 text-[11px]">💬</span>
                  Next Question
                </div>
                <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                  {line.replace("Next Question:", "").trim()}
                </p>
              </div>
            );
          }
          // "Note: ... final question ..." — pulled out into a centered popup
          // instead of being shown as a plain inline line (see showFinalQuestionPopup).
          if (FINAL_QUESTION_REGEX.test(line)) {
            return null;
          }
          return (
            <div key={i} className="px-1 text-sm text-slate-300 leading-relaxed">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  const parseFinalResult = (text) => {
    if (!text) return {};
    const lines = text.split("\n").filter(l => l.trim());
    const result = {};
    lines.forEach(line => {
      if (line.includes("Overall Score:") || line.includes("score is"))
        result.score = line.split(/Overall Score:|score is/)[1]?.trim().split(" ")[0]?.replace(/[^0-9\/]/g, "") || "—";
      if (line.includes("Strengths:") || line.startsWith("✅"))
        result.strengths = line.split(/Strengths:|✅/)[1]?.trim();
      if (line.includes("Weak Areas:") || line.includes("improvement") || line.startsWith("❌"))
        result.weak = line.split(/Weak Areas:|❌/)[1]?.trim();
      if (line.includes("Tips:") || line.startsWith("💡"))
        result.tips = line.split(/Tips:|💡/)[1]?.trim();
    });

    // Fallback — agar kuch parse na ho
    if (!result.score) result.score = "—";
    if (!result.strengths) result.strengths = "Good effort! Keep practicing.";
    if (!result.weak) result.weak = "Review core concepts.";
    if (!result.tips) result.tips = "Practice more mock interviews!";

    return result;
  };

  const startInterview = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: activeRole, messages: [], action: "start" }),
      });
      const data = await res.json();
      setMessages([{ role: "ai", text: data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: activeRole, messages: updated, action: "continue" }),
      });
      const data = await res.json();
      const finalMessages = [...updated, { role: "ai", text: data.reply }];
      setMessages(finalMessages);

      if (
        data.reply &&
        (data.reply.includes("INTERVIEW_COMPLETE") || data.reply.includes("Overall Score:"))
      ) {
        setFinalResult(data.reply);
        setShowPopup(true);
      }

      // Final question of this round — show a centered popup instead of
      // burying it as a plain inline line.
      if (data.reply && FINAL_QUESTION_REGEX.test(data.reply)) {
        setShowFinalQuestionPopup(true);
      }

      const session = {
        id: Date.now(),
        role: activeRole,
        date: new Date().toLocaleDateString(),
        messages: finalMessages,
        userEmail: user.email,
      };
      const prev = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
      localStorage.setItem("interviewHistory", JSON.stringify([session, ...prev].slice(0, 10)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Role Selection Screen
  if (!started) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-14">
        {/* animated background glow blobs — pure CSS, no extra deps */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-600/30 blur-[100px] animate-blob-a" />
        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px] animate-blob-b" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[100px] animate-blob-c" />

        <div className="relative max-w-xl mx-auto">
          <div className="mb-8 text-center sm:text-left animate-fade-up" style={{ animationDelay: "0ms" }}>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs px-3 py-1.5 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              AI Interviewer
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-cyan-200 bg-clip-text text-transparent mb-2">
              Mock Interview
            </h1>
            <p className="text-slate-400 text-sm">
              Choose a role or type your own — AI will ask real questions and give feedback
            </p>
          </div>

          <div
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 mb-6 animate-fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-2">
              ✏️ Type any custom role
            </div>
            <input
              type="text"
              placeholder="e.g. Machine Learning Engineer, iOS Developer..."
              value={customRole}
              onChange={(e) => {
                setCustomRole(e.target.value);
                if (e.target.value) setSelectedRole(null);
              }}
              className={`w-full rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all border
                ${customRole
                  ? "border-purple-400/60 bg-purple-500/10 ring-4 ring-purple-500/20"
                  : "border-white/10 bg-white/5 focus:border-purple-400/60 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20"}`}
            />
            {customRole && (
              <div className="text-xs text-purple-300 mt-2">
                ✓ Custom role: <span className="font-medium">{customRole}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs uppercase tracking-widest text-slate-500">or choose from below</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {roles.map((r, i) => {
              const isSelected = selectedRole === r.id && !customRole;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRole(r.id);
                    setCustomRole("");
                  }}
                  className={`group relative overflow-hidden rounded-2xl border p-4 cursor-pointer backdrop-blur-xl transition-all duration-300 animate-fade-up hover:-translate-y-1
                    ${isSelected
                      ? "border-purple-400/60 bg-white/10 shadow-lg shadow-purple-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"}`}
                  style={{ animationDelay: `${160 + i * 40}ms` }}
                >
                  <div
                    className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${r.gradient} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25 ${isSelected ? "opacity-30" : ""}`}
                  />
                  <div className="relative flex items-start justify-between">
                    <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {r.icon}
                    </div>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-slate-100">{r.label}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={startInterview}
            disabled={!selectedRole && !customRole.trim()}
            className="group w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-[length:200%_100%] text-white py-3.5 rounded-2xl text-sm font-semibold transition-all duration-500 hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-purple-900/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2 animate-fade-up"
            style={{ animationDelay: "500ms" }}
          >
            Start Interview
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>

        <style jsx>{`
          @keyframes blobA {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(40px, 30px); }
          }
          @keyframes blobB {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-30px, -40px); }
          }
          @keyframes blobC {
            0%, 100% { transform: translate(-50%, 0); }
            50% { transform: translate(calc(-50% + 20px), -20px); }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-blob-a { animation: blobA 12s ease-in-out infinite; }
          .animate-blob-b { animation: blobB 14s ease-in-out infinite; }
          .animate-blob-c { animation: blobC 10s ease-in-out infinite; }
          .animate-fade-up { opacity: 0; animation: fadeUp 0.5s ease-out forwards; }
        `}</style>
      </main>
    );
  }

  // Chat Screen
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">

      {/* Top Bar */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-900/40">AI</div>
          <div>
            <div className="text-sm font-medium text-slate-100">AI Interviewer</div>
            <div className="text-xs text-slate-500">{activeRole}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-300 bg-green-500/10 border border-green-400/20 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => {
          // For an AI feedback message, find the user's answer that came right before it
          const prevUserAnswer =
            msg.role === "ai" && i > 0 && messages[i - 1].role === "user"
              ? messages[i - 1].text
              : null;

          return (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white whitespace-pre-wrap break-words shadow-md shadow-purple-900/30">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                  {formatAIMessage(msg.text, prevUserAnswer)}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!ended && (
        <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-end gap-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading) sendAnswer();
                }
              }}
              placeholder="Type your answer"
              className="flex-1 border border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-purple-400/60 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none overflow-hidden max-h-40"
            />
            <button
              onClick={sendAnswer}
              disabled={loading || !input.trim()}
              className="h-12 px-6 shrink-0 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-900/40 transition-all disabled:opacity-40 flex items-center justify-center"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Ended Message */}
      {ended && (
        <div className="bg-white/5 backdrop-blur-xl border-t border-white/10 px-6 py-6 text-center space-y-2">
          <p className="text-lg">🎉</p>
          <p className="text-slate-100 font-medium text-sm">Thank you for the interview!</p>
          <p className="text-slate-400 text-sm">All the best for your future! 🚀</p>
          <p className="text-slate-600 text-xs mt-2">Redirecting in 3 seconds...</p>
        </div>
      )}

      {/* Final Question (of this round) Popup — centered, dismissible */}
      {showFinalQuestionPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4 pointer-events-none backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center pointer-events-auto">
            <div className="bg-gradient-to-br from-purple-600 to-fuchsia-500 px-6 py-6 text-white">
              <div className="text-4xl mb-2">🏁</div>
              <h2 className="text-lg font-semibold">Final Question!</h2>
              <p className="text-purple-100 text-sm mt-1">
                This is the last question of this round — give it your best shot.
              </p>
            </div>
            <div className="px-6 py-5">
              <button
                onClick={() => setShowFinalQuestionPopup(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-900/40 transition-all"
              >
                Got it, let's finish strong! 💪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Result Popup */}
      {showPopup && finalResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            <div className="bg-gradient-to-br from-purple-600 to-fuchsia-500 px-6 py-5 text-white text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-lg font-semibold">Interview Complete!</h2>
              <div className="text-purple-100 text-sm mt-1">Here's your performance summary</div>
            </div>

            <div className="px-6 py-4 border-b border-white/10 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                {parseFinalResult(finalResult).score || "—"}
              </div>
              <div className="text-xs text-slate-500 mt-1">Overall Score</div>
            </div>

            <div className="px-6 py-4 space-y-3">
              {parseFinalResult(finalResult).strengths && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span>✅</span>
                    <div>
                      <div className="text-xs font-semibold text-green-300 mb-0.5">Strengths</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{parseFinalResult(finalResult).strengths}</p>
                    </div>
                  </div>
                </div>
              )}
              {parseFinalResult(finalResult).weak && (
                <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span>❌</span>
                    <div>
                      <div className="text-xs font-semibold text-red-300 mb-0.5">Weak Areas</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{parseFinalResult(finalResult).weak}</p>
                    </div>
                  </div>
                </div>
              )}
              {parseFinalResult(finalResult).tips && (
                <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span>💡</span>
                    <div>
                      <div className="text-xs font-semibold text-yellow-300 mb-0.5">Tips to Improve</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{parseFinalResult(finalResult).tips}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setEnded(true);
                  setTimeout(() => {
                    window.location.href = "/interview";
                  }, 3000);
                }}
                className="flex-1 border border-white/10 text-slate-300 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-all"
              >
                🏁 End Interview
              </button>
              <button
                onClick={async () => {
                  setShowPopup(false);
                  setContinued(true);
                  continuedRef.current = true;
                  setLoading(true);

                  // Resume message add karo
                  const resumeMsg = {
                    role: "ai",
                    text: "▶️ Interview resumed! Let's continue with more questions."
                  };
                  const resumedMessages = [...messages, resumeMsg];
                  setMessages(resumedMessages);

                  try {
                    const res = await fetch("/api/interview", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        role: activeRole,
                        messages: resumedMessages,
                        action: "resume",
                      }),
                    });
                    const data = await res.json();
                    const finalMessages = [...resumedMessages, { role: "ai", text: data.reply }];
                    setMessages(finalMessages);

                    // New round can also end on a final question — show popup again if so.
                    if (data.reply && FINAL_QUESTION_REGEX.test(data.reply)) {
                      setShowFinalQuestionPopup(true);
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-900/40 transition-all"
              >
                ▶️ Continue
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}