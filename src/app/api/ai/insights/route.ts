import { NextRequest, NextResponse } from "next/server";
import { generateCareerInsights } from "@/lib/ai/gemini";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: alumni, error: fetchError } = await supabase
      .from("alumni_profiles")
      .select("*");

    if (fetchError) {
      console.error("Error fetching alumni:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch alumni data" },
        { status: 500 }
      );
    }

    if (!alumni || alumni.length === 0) {
      return NextResponse.json({
        insights: [],
        top_industries: [],
        in_demand_skills: [],
        career_paths: [],
        message: "No alumni data available for analysis.",
      });
    }

    const insights = await generateCareerInsights(alumni);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Insights generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    );
  }
}
