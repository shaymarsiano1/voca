"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AudioRecorder } from "@/components/AudioRecorder";
import { DOMAIN_META } from "@/components/domains";
import { EvaluationFeedbackModal } from "@/components/EvaluationFeedbackModal";
import { Header } from "@/components/Header";
import { LibraryView } from "@/components/LibraryView";
import { TextInputForm } from "@/components/TextInputForm";
import { WordCard } from "@/components/WordCard";
import { createClient } from "@/lib/supabase/client";
import { completeDemoDay, readDemo, saveDemoDraft, startDemoDay, toDailyResponse } from "@/lib/demo-store";
import { DOMAIN_IDS, isDomainId, type DomainId } from "@/lib/domains";
import { formatLongDate, localDateString } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { buttonPrimary } from "@/lib/ui";
import type { DailyResponse, Evaluation, LibraryWord } from "@/lib/types";

type Phase = "loading" | "ready" | "drill" | "evaluating" | "results" | "error";
type Tab = "today" | "library";

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) return body.error;
  } catch {
    // The response was not JSON.
  }
  return `Request failed (${response.status}).`;
}

export function DrillExperience({ mode }: { mode: "live" | "demo" }) {
  const router = useRouter();
  const [today, setToday] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>(mode === "demo" ? "ready" : "loading");
  const [tab, setTab] = useState<Tab>("today");
  const [domain, setDomain] = useState<DomainId>("Distributed Systems");
  const [payload, setPayload] = useState<DailyResponse | null>(null);
  const [library, setLibrary] = useState<LibraryWord[]>([]);
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [email, setEmail] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [starting, setStarting] = useState(false);
  const [libraryLoaded, setLibraryLoaded] = useState(mode === "demo");

  const applyPayload = useCallback((data: DailyResponse, draftNotes?: Record<string, string>) => {
    setPayload(data);
    setTranscript(data.session?.transcript ?? "");
    if (draftNotes) setNotes(draftNotes);
    if (data.session?.domain && DOMAIN_IDS.includes(data.session.domain as DomainId)) {
      setDomain(data.session.domain as DomainId);
    }
    if (!data.session) setPhase("ready");
    else if (data.session.isCompleted) setPhase("results");
    else setPhase("drill");
  }, []);

  const loadLiveLibrary = useCallback(async () => {
    const response = await fetch("/api/vocabulary");
    if (!response.ok) throw new Error(await readError(response));
    const body = (await response.json()) as { words: LibraryWord[] };
    setLibrary(body.words);
    setLibraryLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const date = localDateString();
      if (cancelled) return;
      setToday(date);

      if (mode === "demo") {
        const state = readDemo();
        if (cancelled) return;
        setLibrary(state.library);
        applyPayload(toDailyResponse(state, date), state.active?.date === date ? state.active.notes : {});
        return;
      }

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!cancelled) setEmail(data.user?.email ?? null);

      const response = await fetch(`/api/session/daily?localDate=${date}`);
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error(await readError(response));
      const body = (await response.json()) as DailyResponse;
      if (!cancelled) applyPayload(body);
    }

    load().catch((error: unknown) => {
      if (cancelled) return;
      toast.error(error instanceof Error ? error.message : "Could not load Voca.");
      setPhase("error");
    });

    return () => {
      cancelled = true;
    };
  }, [applyPayload, mode, router]);

  useEffect(() => {
    if (mode !== "demo" || phase !== "drill" || !today) return;
    const id = window.setTimeout(() => saveDemoDraft(transcript, notes), 400);
    return () => window.clearTimeout(id);
  }, [mode, notes, phase, today, transcript]);

  function openLibrary() {
    setTab("library");
    if (mode === "live" && !libraryLoaded) {
      loadLiveLibrary().catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not load your library.");
      });
    }
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (phase !== "drill") return;
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // submit is recreated each render; the listener is rebound below via the function declaration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, transcript, notes, payload]);

  async function begin() {
    if (!today) return;
    setStarting(true);
    try {
      if (mode === "demo") {
        const state = startDemoDay(domain, today);
        setLibrary(state.library);
        setNotes({});
        applyPayload(toDailyResponse(state, today), {});
        return;
      }
      const response = await fetch("/api/session/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, localDate: today }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const body = (await response.json()) as DailyResponse;
      if (body.session && body.session.domain !== domain) {
        toast("Today's set was already prepared.");
      }
      setNotes({});
      applyPayload(body);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start today's set.");
    } finally {
      setStarting(false);
    }
  }

  const capture = useCallback(
    async (blob: Blob, heard = "") => {
      if (heard.trim()) {
        setTranscript(heard.trim());
        toast.success("Transcript ready. Edit it before you submit.");
        return;
      }
      if (mode === "demo") {
        toast.error("No speech was captured. Speak again, or type in the box.");
        return;
      }
      setTranscribing(true);
      try {
        const form = new FormData();
        const extension = blob.type.includes("mp4") ? "mp4" : "webm";
        form.append("file", blob, `explanation.${extension}`);
        form.append("terms", (payload?.words ?? []).map((word) => word.term).join(","));
        const response = await fetch("/api/session/transcribe", { method: "POST", body: form });
        if (!response.ok) throw new Error(await readError(response));
        const body = (await response.json()) as { transcript?: string };
        const text = body.transcript?.trim() ?? "";
        if (!text) {
          toast.error("Whisper returned an empty transcript. Try again or type instead.");
          return;
        }
        setTranscript(text);
        toast.success("Transcript ready. Edit it before you submit.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Transcription failed.");
      } finally {
        setTranscribing(false);
      }
    },
    [mode, payload?.words],
  );

  async function submit() {
    const hasContent = transcript.trim().length > 0 || Object.values(notes).some((note) => note.trim());
    if (!hasContent) {
      toast.error("Record or write an explanation before submitting.");
      return;
    }
    if (!payload?.session || !today) return;
    setPhase("evaluating");
    try {
      if (mode === "demo") {
        const state = completeDemoDay(transcript, notes, today);
        setLibrary(state.library);
        applyPayload(toDailyResponse(state, today), notes);
        toast.success("Set reviewed");
        return;
      }
      const response = await fetch("/api/session/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: payload.session.id,
          transcript,
          writtenInputs: notes,
          localDate: today,
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const body = (await response.json()) as DailyResponse;
      applyPayload(body);
      setLibraryLoaded(false);
      toast.success("Set reviewed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not evaluate the set.");
      setPhase("drill");
    }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const evaluation: Evaluation | null = payload?.session?.evaluation ?? null;
  const reviewCount = payload?.words.filter((word) => word.role === "review").length ?? 0;
  const freshCount = payload?.words.filter((word) => word.role === "new").length ?? 0;
  const locked = phase === "drill" || phase === "evaluating" || phase === "results";

  return (
    <div className="min-h-full">
      <Header
        homeHref={mode === "demo" ? "/demo" : "/"}
        streak={payload?.streak ?? 0}
        domain={locked ? payload?.session?.domain || domain : domain}
        email={email}
        preview={mode === "demo"}
        onSignOut={mode === "live" ? () => void signOut() : undefined}
      />
      <main className="mx-auto w-full max-w-xl px-5 pt-8 pb-24">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex rounded-xl border border-line bg-sheet p-1 text-sm">
            {(["today", "library"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => (item === "library" ? openLibrary() : setTab(item))}
                className={cn(
                  "rounded-lg px-3 py-1.5 capitalize",
                  tab === item ? "bg-accent font-medium text-white" : "text-mute hover:text-ink",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <p className="text-xs text-mute">
            <span className="text-emerald-600 tabular-nums">{payload?.stats.mastered ?? 0}</span> mastered
            <span className="px-2">·</span>
            <span className="text-amber-600 tabular-nums">{payload?.stats.learning ?? 0}</span> learning
            <span className="px-2">·</span>
            <span className="text-accent tabular-nums">{payload?.stats.due ?? 0}</span> due
          </p>
        </div>

        {tab === "library" && today ? (
          <LibraryView words={library} today={today} />
        ) : null}
        {tab === "today" ? (
          <AnimatePresence mode="wait">
            {phase === "loading" ? (
              <motion.div key="loading" className="grid min-h-64 place-items-center">
                <LoaderCircle className="h-5 w-5 animate-spin text-mute" />
              </motion.div>
            ) : null}

            {phase === "error" ? (
              <div key="error" className="rounded-2xl border border-line bg-sheet px-6 py-10 text-center">
                <p className="text-ink">Could not load the set.</p>
                <button type="button" className={`${buttonPrimary} mt-4`} onClick={() => window.location.reload()}>
                  Try again
                </button>
              </div>
            ) : null}

            {phase === "ready" ? (
              <motion.section key="ready" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <p className="font-mono text-xs text-mute">{today ? formatLongDate(today) : "Today"}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Today&apos;s five</h1>
                  <p className="mt-2 text-sm leading-6 text-mute">
                    Pick one subject, then start. You get five words from that subject. A different subject is a
                    different five.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DOMAIN_IDS.map((item) => {
                    const selected = item === domain;
                    const meta = DOMAIN_META[item];
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDomain(item)}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition",
                          selected ? meta.selected : "border-line bg-sheet text-ink hover:border-mute/40",
                        )}
                      >
                        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} aria-hidden="true" />
                        {item}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-mute">{DOMAIN_META[domain].description}</p>
                <button type="button" className={buttonPrimary} onClick={() => void begin()} disabled={starting}>
                  {starting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  Start
                </button>
              </motion.section>
            ) : null}

            {phase === "drill" && payload ? (
              <motion.section key="drill" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        isDomainId(payload.session?.domain || domain)
                          ? DOMAIN_META[(payload.session?.domain || domain) as DomainId].dot
                          : "bg-accent",
                      )}
                      aria-hidden="true"
                    />
                    {payload.session?.domain || domain}
                  </h1>
                  <p className="text-sm text-mute">
                    <span className="text-amber-700">{reviewCount} review</span>
                    <span className="px-1.5">·</span>
                    <span className="text-sky-700">{freshCount} new</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm text-accent"
                  onClick={() => {
                    setPhase("ready");
                    setTab("today");
                  }}
                >
                  Change subject
                </button>
                <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-sheet">
                  {payload.words.map((word, index) => (
                    <WordCard key={word.id} word={word} index={index} />
                  ))}
                </div>
                <div className="space-y-5">
                  <AudioRecorder
                    disabled={transcribing}
                    transcribing={transcribing}
                    onTranscript={setTranscript}
                    onTranscribe={(blob, text) => void capture(blob, text)}
                  />
                  <TextInputForm
                    transcript={transcript}
                    onTranscript={setTranscript}
                    words={payload.words}
                    notes={notes}
                    onNote={(term, value) => setNotes((current) => ({ ...current, [term]: value }))}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-mute">⌘/Ctrl + Enter to submit</p>
                    <button type="button" className={buttonPrimary} onClick={() => void submit()}>
                      Submit answers
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : null}

            {phase === "evaluating" ? (
              <motion.div key="evaluating" className="rounded-2xl border border-line bg-sheet px-6 py-14 text-center">
                <LoaderCircle className="mx-auto h-5 w-5 animate-spin text-accent" />
                <p className="mt-4 font-medium text-ink">Reading your answers</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-mute">
                  Checking the nuance, then writing a memory hook for anything that slipped.
                </p>
              </motion.div>
            ) : null}

            {phase === "results" && evaluation ? (
              <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <EvaluationFeedbackModal
                  evaluation={evaluation}
                  transcript={payload?.session?.transcript || transcript}
                  note={
                    mode === "demo"
                      ? "Preview scoring stays on this device. A signed-in set uses GPT-4o mini, which can judge Hebrew and English together."
                      : evaluation.evaluator === "fallback"
                        ? "Scored with the local checker because the model was unavailable. The review schedule was still saved."
                        : undefined
                  }
                  onOpenLibrary={openLibrary}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        ) : null}
      </main>
    </div>
  );
}
