import { NextRequest, NextResponse } from "next/server";
import { generateCareerRoadmap } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const { goal, currentSkills } = await request.json();

    if (!goal || typeof goal !== "string") {
      return NextResponse.json(
        { error: "Career goal is required" },
        { status: 400 }
      );
    }

    if (!currentSkills || !Array.isArray(currentSkills)) {
      return NextResponse.json(
        { error: "Current skills array is required" },
        { status: 400 }
      );
    }

    const roadmap = await generateCareerRoadmap(goal, currentSkills);

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap. Please try again." },
      { status: 500 }
    );
  }
}
