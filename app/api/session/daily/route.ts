import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createDaily, getDaily } from "@/lib/daily";
import { isIsoDate } from "@/lib/dates";
import { isDomainId } from "@/lib/domains";

export const maxDuration = 60;

function failure(error: unknown, fallback: string) {
  console.error(error);
  const message = error instanceof Error && error.message ? error.message : fallback;
  const status = message === "Choose a supported domain." || message === "No terms were available for today." ? 400 : 500;
  return NextResponse.json({ error: status === 400 ? message : fallback }, { status });
}

export async function GET(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const localDate = new URL(request.url).searchParams.get("localDate") ?? "";
  if (!isIsoDate(localDate)) {
    return NextResponse.json({ error: "A local date is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getDaily(supabase, user, localDate));
  } catch (error) {
    return failure(error, "Could not load today's set.");
  }
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const domain = typeof (body as { domain?: unknown }).domain === "string" ? (body as { domain: string }).domain : "";
  const localDate =
    typeof (body as { localDate?: unknown }).localDate === "string"
      ? (body as { localDate: string }).localDate
      : "";

  if (!isDomainId(domain)) {
    return NextResponse.json({ error: "Choose a supported domain." }, { status: 400 });
  }
  if (!isIsoDate(localDate)) {
    return NextResponse.json({ error: "A local date is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await createDaily(supabase, user, domain, localDate));
  } catch (error) {
    return failure(error, "Could not build today's set.");
  }
}
