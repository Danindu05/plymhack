import { NextResponse } from "next/server";

const endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;

  if (!key)
    return NextResponse.json(
      { error: "GEMINI_API_KEY missing" },
      { status: 500 }
    );

  const body = await request.json();
  const { description, category, severity, kind } = body;

  if (!description)
    return NextResponse.json(
      { error: "description required" },
      { status: 400 }
    );

  const prompt =
    kind === "action"
      ? `You are a municipal operations lead. Suggest a short, actionable next step for this issue. Issue category: ${category}. Severity: ${severity}. Description: ${description}. Return 1-3 sentences.`
      : kind === "category"
      ? `Guess the best SDG waste/pollution category for this report: ${description}. Choose from GARBAGE_WASTE, AIR_POLLUTION, WATER_POLLUTION, SOIL_POLLUTION, NOISE_POLLUTION, PLASTIC_POLLUTION, LIGHT_POLLUTION, POTHOLE_ROAD, OTHER. Answer with the category key only.`
      : `Rewrite the citizen report as a concise, official incident summary (max 3 sentences). Category: ${category}. Severity: ${severity}. Description: ${description}.`;

  try {
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
        generationConfig: {
          temperature: 0.2, // more deterministic for classification
          maxOutputTokens: 200,
        },
      }),
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ text });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Gemini call failed" },
      { status: 500 }
    );
  }
}
