import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { hasOpenAI, transcribeAudio } from "@/lib/openai";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasOpenAI()) {
    return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "The recording could not be read." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
  }
  if (file.size < 800) {
    return NextResponse.json({ error: "Recording was too short." }, { status: 400 });
  }
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "Recording is too large." }, { status: 413 });
  }

  const terms = String(form.get("terms") ?? "")
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 8);

  try {
    const transcript = await transcribeAudio(file, terms);
    if (transcript === null) {
      return NextResponse.json({ error: "OpenAI is not configured." }, { status: 503 });
    }
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Transcription failed. You can type the explanation instead." }, { status: 502 });
  }
}
