import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;
    if (!file || !userId) return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });

    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5MB" }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(url, serviceRole);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    // Update users avatar_url
    await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
