import { NextRequest, NextResponse } from "next/server";
import { matchMentors } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, careerGoal, skills, industryInterest, learningGoals } = body;

    if (!name || !careerGoal || !skills) {
      return NextResponse.json(
        { error: "Name, career goal, and skills are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: alumni, error: fetchError } = await supabase
      .from("alumni_profiles")
      .select("*")
      .eq("available_for_mentorship", true);

    if (fetchError) {
      console.error("Error fetching alumni:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch alumni data" },
        { status: 500 }
      );
    }

    if (!alumni || alumni.length === 0) {
      return NextResponse.json({
        matches: [],
        message: "No available mentors found at this time.",
      });
    }

    const result = await matchMentors(
      {
        name,
        careerGoal,
        skills,
        industryInterest: industryInterest || "",
        learningGoals: learningGoals || [],
      },
      alumni
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Mentor match error:", error);
    return NextResponse.json(
      { error: "Failed to match mentors. Please try again." },
      { status: 500 }
    );
  }
}
