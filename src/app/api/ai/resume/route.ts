import { NextRequest, NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (resumeText.length < 50) {
      return NextResponse.json(
        { error: "Resume text too short. Please provide more content." },
        { status: 400 }
      );
    }

    if (resumeText.length > 10000) {
      return NextResponse.json(
        { error: "Resume text too long. Maximum 10000 characters." },
        { status: 400 }
      );
    }

    const analysis = await analyzeResume(resumeText);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
