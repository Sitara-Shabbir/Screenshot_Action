import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env.local");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});



export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { image, mimeType } = body;

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image and mimeType are required." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: image,
          },
        },
        {
          text: `
Analyze this screenshot for our "Screenshot → Action" application.

Your job is to understand the screenshot and identify actionable information.

Classify it as exactly one of:
TASK
EVENT
DEADLINE
REMINDER
INFORMATION

Extract the most useful information.

Return ONLY valid JSON in this exact structure:

{
  "type": "TASK",
  "title": "",
  "description": "",
  "date": "",
  "time": "",
  "source": "",
  "urgency": "low",
  "action": "",
  "confidence": 0
}

Rules:

- type must be one of TASK, EVENT, DEADLINE, REMINDER, INFORMATION.
- title should be short and clear.
- description should explain the important context.
- date should contain the relevant date if one exists.
- time should contain the relevant time if one exists.
- source should identify the apparent source such as WhatsApp, Email, Website, SMS, or Unknown.
- urgency must be low, medium, or high.
- action should describe what the user should do.
- confidence should be a number between 0 and 1.
- If information is missing, use an empty string.
- Do not invent information that is not supported by the screenshot.
          `,
        },
      ],
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        { error: "The AI returned an empty response." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: text,
    });
   } catch (error) {
    console.error("Gemini analysis error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown Gemini API error",
      },
      { status: 500 }
    );
  }
}