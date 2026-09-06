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

    try {
      const result = await calculateCareerReadiness({
        name,
        education,
        skills,
        experience: experience || "No professional experience yet",
        projects: projects || "No projects listed",
        certifications: certifications || "No certifications",
      });
      // Validate shape
      if (result && typeof result.overall_score === 'number' && result.categories && typeof result.categories === 'object') {
        return NextResponse.json(result);
      }
      throw new Error("Invalid AI response shape");
    } catch (aiError) {
      console.error("Gemini failed, returning mock", aiError);
      // Mock fallback for demo when GEMINI_API_KEY is invalid/missing
      const mock = {
        overall_score: 68,
        categories: {
          technical_skills: { score: 72, breakdown: { programming: 75, tools: 70 }, feedback: "Solid foundation, add system design." },
          experience: { score: 55, breakdown: { internships: 50, projects: 60 }, feedback: "Add 1-2 internships or freelance work." },
          soft_skills: { score: 70, breakdown: { communication: 70, teamwork: 70 }, feedback: "Good collaboration, practice presentations." },
          portfolio: { score: 60, breakdown: { github: 60, documentation: 60 }, feedback: "Polish README and add live demos." },
          networking: { score: 65, breakdown: { connections: 60, mentorship: 70 }, feedback: "Connect with 5 alumni this month." },
        },
        improvement_areas: [
          { area: "System Design", priority: "high", action_items: ["Study design patterns", "Build a scalable API project"] },
          { area: "Interview Prep", priority: "medium", action_items: ["Practice DSA daily", "Mock interviews"] },
        ],
        strengths: ["Strong programming basics", "Good project experience", "Clear career direction"],
        summary: `${name}, you have a solid foundation. Focus on system design and internships to reach 80+.`
      };
      return NextResponse.json(mock);
    }
  } catch (error) {
    console.error("Career readiness error:", error);
    return NextResponse.json(
      { error: "Failed to calculate career readiness. Please try again." },
      { status: 500 }
    );
  }
}
