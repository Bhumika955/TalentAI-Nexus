"use client";
import { useState, useEffect } from "react";

const roleLabels = {
  frontend: "Frontend Developer",
  fullstack: "Full Stack Developer",
  hr: "HR Round",
  dsa: "DSA & Logic",
};

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
    setSessions(data);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("interviewHistory");
    setSessions([]);
    setSelected(null);
  };

  // Empty State
  if (sessions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-gray-700 font-medium mb-2">No interviews yet</h2>
          <p className="text-gray-400 text-sm mb-6">Complete a mock interview to see your history here</p>
          <a
            href="/interview"
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
          >
            Start Mock Interview
          </a>
        </div>
      </main>
    );
  }

  // Session Detail View
  if (selected !== null) {
    const session = sessions[selected];
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-2xl mx-auto">

          <button
            onClick={() => setSelected(null)}
            className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1"
          >
            ← Back to History
          </button>

          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-900 font-medium">{roleLabels[session.role] || session.role}</h2>
                <p className="text-gray-400 text-xs mt-1">{session.date}</p>
              </div>
              <div className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full">
                {session.messages.length} messages
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {session.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                  ${msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-sm"
                    : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  // History List
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">Interview History</h1>
            <p className="text-gray-500 text-sm">{sessions.length} session{sessions.length > 1 ? "s" : ""} completed</p>
          </div>
          <button
            onClick={clearHistory}
            className="text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 px-3 py-1.5 rounded-lg transition-all"
          >
            Clear All
          </button>
        </div>

        {/* Sessions */}
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <div
              key={session.id}
              onClick={() => setSelected(i)}
              className="bg-white border border-gray-100 rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-lg">
                    {session.role === "frontend" ? "🖥️"
                      : session.role === "fullstack" ? "⚡"
                      : session.role === "hr" ? "🤝"
                      : "🧠"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {roleLabels[session.role] || session.role}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{session.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{session.messages.length} msgs</span>
                  <span className="text-purple-500 text-sm">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}