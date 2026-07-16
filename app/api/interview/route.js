import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { role, messages, action } = await request.json();

    const systemPrompt = `You are a strict technical interviewer for ${role} role.

IMPORTANT RULES:
- Ask exactly 5 questions total
- After each answer give feedback in EXACTLY this format (no extra text):

✅ Correct: [what was right]
❌ Missing: [what was wrong]
💡 Suggestion: [how to improve in 1 short line]. Ideal Answer: [a concise, correct, exam-ready answer to the question that was just asked, in 2-3 lines max]

Next Question: [question here]

- The Suggestion line MUST always include "Ideal Answer:" inside it as shown above, on the same line, so the candidate can immediately see the correct answer.
- Keep the Ideal Answer factually accurate, concise, and directly usable for revision — no fluff.

- After the 6th answer, give ONLY this (no Next Question):

🎯 INTERVIEW_COMPLETE
📊 Overall Score: [X/10]
✅ Strengths: [strengths here]
❌ Weak Areas: [weak areas here]
💡 Tips: [improvement tips here]

STRICTLY follow these formats. No extra lines.`;

    const history = messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    if (action === "start") {
      history.push({
        role: "user",
        content: `Start mock interview for ${role}. Introduce yourself in one line and ask question 1 of 5.`,
      });
    }

    if (action === "resume") {
      history.push({
        role: "user",
        content: `The candidate wants to continue practicing. Ask 5 more fresh questions for ${role} role. Start with question 1.`,
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...history],
        max_tokens: 600,
        temperature: 0.5,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}