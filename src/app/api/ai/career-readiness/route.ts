import { NextRequest, NextResponse } from "next/server";
import { calculateCareerReadiness } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, education, skills, experience, projects, certifications } =
      body;

    if (!name || !education || !skills) {
      return NextResponse.json(
        { error: "Name, education, and skills are required" },
        { status: 400 }
      );
    }

    const result = await calculateCareerReadiness({
      name,
      education,
      skills,
      experience: experience || "No professional experience yet",
      projects: projects || "No projects listed",
      certifications: certifications || "No certifications",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Career readiness error:", error);
    return NextResponse.json(
      { error: "Failed to calculate career readiness. Please try again." },
      { status: 500 }
    );
  }
}
