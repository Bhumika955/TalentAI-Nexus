"use client";
import { useState, useRef, useEffect } from "react";

const roles = [
  { id: "frontend", label: "Frontend Developer", icon: "🖥️" },
  { id: "fullstack", label: "Full Stack Developer", icon: "⚡" },
  { id: "hr", label: "HR Round", icon: "🤝" },
  { id: "dsa", label: "DSA & Logic", icon: "🧠" },
];

export default function MockInterview() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startInterview = async () => {
    setStarted(true);
    setLoading(true);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole, messages: [], action: "start" }),
    });
    const data = await res.json();
    setMessages([{ role: "ai", text: data.reply }]);
    setLoading(false);
  };

  const sendAnswer = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole, messages: updated, action: "continue" }),
    });
    const data = await res.json();
    setMessages([...updated, { role: "ai", text: data.reply }]);

    // Save to localStorage
    const session = {
      id: Date.now(),
      role: selectedRole,
      date: new Date().toLocaleDateString(),
      messages: [...updated, { role: "ai", text: data.reply }],
    };
    const prev = JSON.parse(localStorage.getItem("interviewHistory") || "[]");
    localStorage.setItem("interviewHistory", JSON.stringify([session, ...prev].slice(0, 10)));

    setLoading(false);
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
            <p className="text-gray-500">Choose your role — AI will ask real questions and give feedback</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all
                  ${selectedRole === r.id
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
            disabled={!selectedRole}
            className="w-full bg-purple-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Interview →
          </button>
        </div>
      </main>
    );
  }

  // Interview Chat Screen
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">AI</div>
          <div>
            <div className="text-sm font-medium text-gray-800">AI Interviewer</div>
            <div className="text-xs text-gray-400">{roles.find(r => r.id === selectedRole)?.label}</div>
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
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === "user"
                ? "bg-purple-600 text-white rounded-br-sm"
                : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm"}`}>
              {msg.text}
            </div>
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

    </main>
  );
}