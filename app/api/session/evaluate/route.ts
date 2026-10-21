import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { evaluateDaily } from "@/lib/daily";
import { isIsoDate, localDateString } from "@/lib/dates";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const record = body as {
    sessionId?: unknown;
    transcript?: unknown;
    writtenInputs?: unknown;
    localDate?: unknown;
  };

  if (typeof record.sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(record.sessionId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  if (record.transcript !== undefined && typeof record.transcript !== "string") {
    return NextResponse.json({ error: "Invalid transcript." }, { status: 400 });
  }
  const transcript = typeof record.transcript === "string" ? record.transcript.slice(0, 20_000) : "";
  const localDate = typeof record.localDate === "string" && isIsoDate(record.localDate) ? record.localDate : localDateString();

  const notes: Record<string, string> = {};
  if (record.writtenInputs && typeof record.writtenInputs === "object") {
    for (const [term, value] of Object.entries(record.writtenInputs)) {
      if (typeof value === "string" && term.length < 80) notes[term] = value.slice(0, 4_000);
    }
  }

  try {
    const daily = await evaluateDaily(supabase, user, record.sessionId, transcript, notes, localDate);
    return NextResponse.json({
      ...daily,
      evaluation: daily.session?.evaluation ?? null,
    });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Could not evaluate the set.";
    const status = message === "Today's set could not be found." ? 404 : 500;
    return NextResponse.json({ error: status === 404 ? message : "Could not evaluate the set." }, { status });
  }
}
