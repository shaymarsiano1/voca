import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listVocabulary } from "@/lib/daily";

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json({ words: await listVocabulary(supabase, user.id) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load your library." }, { status: 500 });
  }
}
