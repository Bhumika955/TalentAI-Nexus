"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import LoginPrompt from "../components/LoginPrompt";

const roles = [
  { id: "frontend", label: "Frontend Developer", icon: "🖥️" },
  { id: "react", label: "React Developer", icon: "⚛️" },
  { id: "backend", label: "Backend Developer", icon: "🔧" },
  { id: "nodejs", label: "Node.js Developer", icon: "🟢" },
  { id: "fullstack", label: "Full Stack Developer", icon: "⚡" },
  { id: "dsa", label: "DSA & Problem Solving", icon: "🧠" },
  { id: "systemdesign", label: "System Design", icon: "🏗️" },
  { id: "dataanalyst", label: "Data Analyst", icon: "📊" },
  { id: "devops", label: "DevOps Engineer", icon: "🚀" },
  { id: "hr", label: "HR Role", icon: "🤝" },
];

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
  const bottomRef = useRef(null);
  const { user } = useAuth();
const router = useRouter();
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return <LoginPrompt page="Mock Interview" />;

  const activeRole = customRole.trim() || roles.find(r => r.id === selectedRole)?.label || selectedRole;

  // ✅ formatAIMessage — component level pe, sendAnswer ke bahar
  const formatAIMessage = (text) => {
    if (!text) return null;

    if (text.includes("INTERVIEW_COMPLETE")) {
      return (
        <div className="px-4 py-3 text-sm text-purple-700 font-medium">
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
        <div className="px-4 py-3 text-sm leading-relaxed text-gray-700">
          {text}
        </div>
      );
    }

    return (
      <div className="divide-y divide-gray-50">
        {lines.map((line, i) => {
          if (line.startsWith("✅")) {
            return (
              <div key={i} className="px-4 py-3 bg-green-50 border-l-4 border-green-400">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">✅</span>
                  <div>
                    <span className="text-xs font-bold text-green-700">
                      {line.slice(2).split(":")[0]}:{" "}
                    </span>
                    <span className="text-xs text-gray-700 leading-relaxed">
                      {line.slice(2).split(":").slice(1).join(":").trim()}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
          if (line.startsWith("❌")) {
            return (
              <div key={i} className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">❌</span>
                  <div>
                    <span className="text-xs font-bold text-red-700">
                      {line.slice(2).split(":")[0]}:{" "}
                    </span>
                    <span className="text-xs text-gray-700 leading-relaxed">
                      {line.slice(2).split(":").slice(1).join(":").trim()}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
          if (line.startsWith("💡")) {
            return (
              <div key={i} className="px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">💡</span>
                  <div>
                    <span className="text-xs font-bold text-yellow-700">
                      {line.slice(2).split(":")[0]}:{" "}
                    </span>
                    <span className="text-xs text-gray-700 leading-relaxed">
                      {line.slice(2).split(":").slice(1).join(":").trim()}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
          if (line.startsWith("Next Question:")) {
            return (
              <div key={i} className="px-4 py-4 bg-gray-50 border-t-2 border-gray-200">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  💬 Next Question
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                  {line.replace("Next Question:", "").trim()}
                </p>
              </div>
            );
          }
          return (
            <div key={i} className="px-4 py-2 text-sm text-gray-700 leading-relaxed">
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

      if (data.reply && data.reply.includes("INTERVIEW_COMPLETE")) {
        setFinalResult(data.reply);
        setShowPopup(true);
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
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-full mb-4">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
              AI Interviewer
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Mock Interview</h1>
            <p className="text-gray-500">Choose a role or type your own — AI will ask real questions and give feedback</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5">
            <div className="text-xs font-medium text-gray-500 mb-2">✏️ Type any custom role</div>
            <input
              type="text"
              placeholder="e.g. Machine Learning Engineer, iOS Developer..."
              value={customRole}
              onChange={(e) => {
                setCustomRole(e.target.value);
                if (e.target.value) setSelectedRole(null);
              }}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none transition-all
                ${customRole ? "border-purple-400 bg-purple-50" : "border-gray-200 focus:border-purple-400"}`}
            />
            {customRole && (
              <div className="text-xs text-purple-600 mt-2">
                ✓ Custom role: <span className="font-medium">{customRole}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400">or choose from below</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  setSelectedRole(r.id);
                  setCustomRole("");
                }}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all
                  ${selectedRole === r.id && !customRole
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-100 hover:border-gray-300"}`}
              >
                <div className="text-2xl mb-2">{r.icon}</div>
                <div className="text-sm font-medium text-gray-800">{r.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startInterview}
            disabled={!selectedRole && !customRole.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Interview →
          </button>
        </div>
      </main>
    );
  }

  // Chat Screen
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
          <div>
            <div className="text-sm font-medium text-gray-800">AI Interviewer</div>
            <div className="text-xs text-gray-400">{activeRole}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "user" ? (
              <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed bg-purple-600 text-white">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white border border-gray-100 overflow-hidden">
                {formatAIMessage(msg.text)}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!ended && (
        <div className="bg-white border-t border-gray-100 px-6 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendAnswer()}
              placeholder="Type your answer..."
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 transition-all"
            />
            <button
              onClick={sendAnswer}
              disabled={loading || !input.trim()}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Ended Message */}
      {ended && (
        <div className="bg-white border-t border-gray-100 px-6 py-6 text-center space-y-2">
          <p className="text-lg">🎉</p>
          <p className="text-gray-800 font-medium text-sm">Thank you for the interview!</p>
          <p className="text-gray-400 text-sm">All the best for your future! 🚀</p>
          <p className="text-gray-300 text-xs mt-2">Redirecting in 3 seconds...</p>
        </div>
      )}

      {/* Final Result Popup */}
      {showPopup && finalResult && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

            <div className="bg-purple-600 px-6 py-5 text-white text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-lg font-semibold">Interview Complete!</h2>
              <div className="text-purple-200 text-sm mt-1">Here's your performance summary</div>
            </div>

            <div className="px-6 py-4 border-b border-gray-50 text-center">
              <div className="text-4xl font-bold text-purple-600">
                {parseFinalResult(finalResult).score || "—"}
              </div>
              <div className="text-xs text-gray-400 mt-1">Overall Score</div>
            </div>

            <div className="px-6 py-4 space-y-3">
              {parseFinalResult(finalResult).strengths && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span>✅</span>
                    <div>
                      <div className="text-xs font-semibold text-green-700 mb-0.5">Strengths</div>
                      <p className="text-xs text-gray-600 leading-relaxed">{parseFinalResult(finalResult).strengths}</p>
                    </div>
                  </div>
                </div>
              )}
              {parseFinalResult(finalResult).weak && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span>❌</span>
                    <div>
                      <div className="text-xs font-semibold text-red-700 mb-0.5">Weak Areas</div>
                      <p className="text-xs text-gray-600 leading-relaxed">{parseFinalResult(finalResult).weak}</p>
                    </div>
                  </div>
                </div>
              )}
              {parseFinalResult(finalResult).tips && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span>💡</span>
                    <div>
                      <div className="text-xs font-semibold text-yellow-700 mb-0.5">Tips to Improve</div>
                      <p className="text-xs text-gray-600 leading-relaxed">{parseFinalResult(finalResult).tips}</p>
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
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
              >
                🏁 End Interview
              </button>
              <button
                onClick={async () => {
                  setShowPopup(false);
                  setLoading(true);
                  try {
                    const res = await fetch("/api/interview", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        role: activeRole,
                        messages: messages,
                        action: "continue",
                      }),
                    });
                    const data = await res.json();
                    const finalMessages = [...messages, { role: "ai", text: data.reply }];
                    setMessages(finalMessages);
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
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