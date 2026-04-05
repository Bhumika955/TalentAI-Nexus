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
💡 Suggestion: [how to improve]

Next Question: [question here]

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