import { NextRequest, NextResponse } from "next/server";
import { analyzeSkillGap } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const { currentSkills, targetCareer } = await request.json();

    if (!currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json(
        { error: "Current skills array is required" },
        { status: 400 }
      );
    }

    if (!targetCareer || typeof targetCareer !== "string") {
      return NextResponse.json(
        { error: "Target career is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeSkillGap(currentSkills, targetCareer);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gap. Please try again." },
      { status: 500 }
    );
  }
}
