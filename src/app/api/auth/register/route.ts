import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, first_name, last_name, role, college, department, degree, graduation_year, skills, location, about } = body;

    if (!email || !password || !first_name || !last_name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAdmin = createClient(url, serviceRoleKey || anonKey, { auth: { autoRefreshToken: false, persistSession: false } });

    // Try admin createUser if service role available (bypasses email confirmation and rate limits)
    let userId: string | null = null;
    if (serviceRoleKey) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { role, first_name, last_name, full_name: `${first_name} ${last_name}` }
      });
      if (error) {
        // If already exists, try to fetch
        if (error.message.includes("already exists") || error.message.includes("already registered")) {
          return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      userId = data.user.id;
      // Ensure public.users
      await supabaseAdmin.from("users").upsert({ id: userId, email, role, full_name: `${first_name} ${last_name}` }, { onConflict: "id" });
    } else {
      // Fallback: use anon signUp (requires patch to be applied for RLS)
      const supabaseAnon = createClient(url, anonKey);
      const { data, error } = await supabaseAnon.auth.signUp({
        email, password,
        options: { data: { role, first_name, last_name, full_name: `${first_name} ${last_name}` } }
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data.user) return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
      userId = data.user.id;
      // Wait for trigger
      await new Promise(r => setTimeout(r, 800));
      // Fallback ensure users row
      await supabaseAnon.from("users").upsert({ id: userId, email, role, full_name: `${first_name} ${last_name}` }, { onConflict: "id" });
    }

    if (!userId) return NextResponse.json({ error: "No user id" }, { status: 500 });

    // Create profile
    const adminClient = serviceRoleKey ? supabaseAdmin : createClient(url, anonKey);
    if (role === "student") {
      const { error } = await adminClient.from("student_profiles").upsert({
        user_id: userId, college: college || "", department: department || "", degree: degree || "",
        graduation_year: parseInt(graduation_year) || new Date().getFullYear(),
        skills: skills || [], location: location || "", about: about || ""
      }, { onConflict: "user_id" });
      if (error) return NextResponse.json({ error: "Profile creation failed: " + error.message }, { status: 500 });
    } else if (role === "alumni") {
      const { error } = await adminClient.from("alumni_profiles").upsert({
        user_id: userId, degree: degree || "", department: department || "", graduation_year: parseInt(graduation_year) || 2020,
        skills: skills || [], location: location || "", about: about || "", current_company: "", current_designation: ""
      }, { onConflict: "user_id" });
      if (error) return NextResponse.json({ error: "Profile creation failed: " + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}
