import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { jobText } = await request.json();

    const prompt = `You are a job scam detection expert. Analyze this job description and determine if it is legitimate or fake.

Job Description:
${jobText}

Respond ONLY in this exact JSON format, nothing else:
{
  "verdict": "Safe" or "Suspicious" or "Fake",
  "score": (number between 0-100, higher = more legitimate),
  "redFlags": ["flag1", "flag2"],
  "greenFlags": ["flag1", "flag2"],
  "summary": "2-3 line summary of your analysis"
}`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      }
    );

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data));

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 500 }
      );
    }

    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}