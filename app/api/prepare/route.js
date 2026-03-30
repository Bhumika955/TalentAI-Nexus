import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { company, role, difficulty } = await request.json();

    const prompt = `You are an expert technical recruiter with deep knowledge of hiring processes at top companies worldwide.

Generate comprehensive and detailed interview preparation data for "${company}" specifically for the role of "${role || 'Software Engineer'}" at "${difficulty || 'Medium'}" difficulty level.

Respond ONLY in this exact JSON format, nothing else, no extra text:
{
  "fullName": "official full company name",
  "role": "most common fresher/entry level role",
  "package": "realistic salary range (LPA for Indian companies, USD for global)",
  "difficulty": "Easy or Medium or Hard or Very Hard",
  "process": "step by step interview process",
  "questions": {
    "hr": [
      "question 1",
      "question 2",
      "...atleast 15 HR behavioral questions total"
    ],
    "technical": [
      "question 1",
      "question 2",
      "...atleast 20 technical questions covering DSA, system design, core CS concepts, language specific, and project based questions"
    ]
  }
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
       max_tokens: 4000,
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}