import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { role, messages, action } = await request.json();

    const systemPrompt = `You are a strict technical interviewer for ${role} role.

IMPORTANT RULES:
- Ask exactly 10 questions total
- After each answer give feedback in EXACTLY this format (no extra text):

✅ Correct: [what was right]
❌ Missing: [what was wrong]
💡 Suggestion: [how to improve in 1 short line]. Ideal Answer: [a concise, correct, exam-ready answer to the question that was just asked, in 2-3 lines max]

Next Question: [question here]

- When the question you are about to ask is the 10th (last) question of the current round, add this exact line right after the "Next Question:" line, on its own line:
Note: This is the final question.
- Do NOT add that line on questions 1-9. Only the 10th question of each round gets it — every single time, without exception.

- The Suggestion line MUST always include "Ideal Answer:" inside it as shown above, on the same line, so the candidate can immediately see the correct answer.
- Keep the Ideal Answer factually accurate, concise, and directly usable for revision — no fluff.

- After the 10th answer, give ONLY this (no Next Question):

🎯 INTERVIEW_COMPLETE
📊 Overall Score: [X/10]
✅ Strengths: [strengths here]
❌ Weak Areas: [weak areas here]
💡 Tips: [improvement tips here]

- If the conversation history contains a message saying a NEW round has started, treat that as a hard reset: forget how many questions/answers came before that message, and count only from question 1 of the new round. Only declare INTERVIEW_COMPLETE after 10 fresh answers within that new round — never based on the total across rounds.

STRICTLY follow these formats. No extra lines.`;

    const history = messages.map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));

    if (action === "start") {
      history.push({
        role: "user",
        content: `Start mock interview for ${role}. Introduce yourself in one line and ask question 1 of 10.`,
      });
    }

    if (action === "resume") {
      history.push({
        role: "user",
        content: `NEW ROUND START. The candidate wants to continue practicing with a completely fresh set of exactly 10 questions for ${role} role. This round is independent of any previous round in this conversation — do NOT count any questions or answers from before this message, and do NOT declare INTERVIEW_COMPLETE based on the total across rounds. Only complete this round after 10 new answers are given within it. Ask new, non-repeated questions. Start with question 1 of this new round now.`,
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