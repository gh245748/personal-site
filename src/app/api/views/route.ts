import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug || typeof slug !== "string") {
    return Response.json({ error: "slug required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_views", { post_slug: slug });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
