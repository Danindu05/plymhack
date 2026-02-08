import { NextResponse } from "next/server";

// Using a stable model name (Check Google AI Studio for the latest available)
const endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    console.error("Missing GEMINI_API_KEY in environment variables");
    return NextResponse.json(
      { error: "GEMINI_API_KEY missing" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { description, category, severity, kind } = body;

    if (!description) {
      return NextResponse.json(
        { error: "description required" },
        { status: 400 }
      );
    }

    const prompt =
      kind === "action"
        ? `You are a municipal operations lead. Suggest a short, actionable next step for this issue. Issue category: ${category}. Severity: ${severity}. Description: ${description}. Return 1-3 sentences.`
        : kind === "category"
        ? `Guess the best SDG waste/pollution category for this report: ${description}. Choose from GARBAGE_WASTE, AIR_POLLUTION, WATER_POLLUTION, SOIL_POLLUTION, NOISE_POLLUTION, PLASTIC_POLLUTION, LIGHT_POLLUTION, POTHOLE_ROAD, OTHER. Answer with the category key only.`
        : `Rewrite the citizen report as a concise, official incident summary (max 3 sentences). Category: ${category}. Severity: ${severity}. Description: ${description}.`;

    const res = await fetch(`${endpoint}?key=${key}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        // Safety settings to ensure response is not blocked for waste reports
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API Error Response:", data);
      return NextResponse.json(
        { error: data.error?.message || "Gemini API rejected the request" },
        { status: res.status }
      );
    }

    // Safely parse the text from response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "No text generated. Possible safety block." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: text.trim() });

  } catch (e: any) {
    console.error("Internal API Error:", e);
    return NextResponse.json(
      { error: "Server failed to process AI request" },
      { status: 500 }
    );
  }
}