import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, full_name, avatar_url, about, location, college, department, graduation_year, linkedin, github } = body;
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const supabase = getAdmin();

    // Get user role to know which profile table
    const { data: userRow } = await supabase.from("users").select("role").eq("id", userId).single();
    const role = (userRow as any)?.role || "student";

    // Update users (bypasses RLS via service_role)
    if (full_name !== undefined || avatar_url !== undefined) {
      const updates: any = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (Object.keys(updates).length) {
        const { error } = await supabase.from("users").update(updates).eq("id", userId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Update profile table
    const table = role === "alumni" ? "alumni_profiles" : "student_profiles";
    const payload: any = {};
    if (about !== undefined) payload.about = about;
    if (location !== undefined) payload.location = location;
    if (linkedin !== undefined) payload.linkedin = linkedin;
    if (github !== undefined) payload.github = github;
    if (role === "student") {
      if (college !== undefined) payload.college = college;
      if (department !== undefined) payload.department = department;
      if (graduation_year !== undefined) payload.graduation_year = graduation_year ? parseInt(String(graduation_year)) : null;
    }
    if (Object.keys(payload).length) {
      const { error } = await supabase.from(table).update(payload).eq("user_id", userId);
      // If no row, upsert
      if (error && error.message.includes("0 rows")) {
        await supabase.from(table).upsert({ user_id: userId, ...payload }, { onConflict: "user_id" });
      } else if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
