import { NextResponse } from "next/server";

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  return NextResponse.json({
    status: "healthy",
    gemini: geminiKey ? "configured" : "missing — set GEMINI_API_KEY",
  });
}
