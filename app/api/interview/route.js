import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { role, messages, action } = await request.json();

    const systemPrompt = `You are a professional technical interviewer conducting a mock interview for a ${role} role for a fresher BTech student in India.

Rules:
- Ask ONE question at a time
- After user answers, give brief feedback (1-2 lines) then ask next question
- Be encouraging but honest
- Keep questions relevant to fresher level
- After 5-6 questions, give a final overall feedback and score out of 10
- Format: feedback first, then next question clearly labeled as "Next Question:"`;

    const history = messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    if (action === "start") {
      history.push({
        role: "user",
        content: `Start my mock interview for ${role} role. Introduce yourself briefly and ask the first question.`,
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
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ reply: data.choices[0].message.content });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}