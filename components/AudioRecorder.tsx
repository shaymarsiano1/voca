"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, RotateCcw, Square } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/cn";

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type SpeechEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function createRecognizer() {
  const host = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = host.SpeechRecognition ?? host.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = "he-IL";
  recognition.continuous = true;
  recognition.interimResults = true;
  return recognition;
}

export function AudioRecorder({
  disabled = false,
  transcribing = false,
  onTranscript,
  onTranscribe,
}: {
  disabled?: boolean;
  transcribing?: boolean;
  onTranscript: (text: string) => void;
  onTranscribe: (blob: Blob, text: string) => void;
}) {
  const recorder = useAudioRecorder();
  const [canHear, setCanHear] = useState(true);
  const heardRef = useRef("");
  const recordingRef = useRef(false);
  const recognitionRef = useRef<SpeechRec | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const { start, stop, status } = recorder;
  const recording = status === "recording";

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  function publish(text: string) {
    heardRef.current = text;
    if (text) onTranscriptRef.current(text);
  }

  function stopHearing() {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (!recognition) return;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch {
      // The recognizer was already stopped.
    }
  }

  function startHearing() {
    stopHearing();
    publish("");
    const recognition = createRecognizer();
    if (!recognition) {
      setCanHear(false);
      return;
    }
    setCanHear(true);
    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const piece = event.results[index]?.[0]?.transcript ?? "";
        if (event.results[index]?.isFinal) finalText += piece;
        else interim += piece;
      }
      publish(`${finalText} ${interim}`.replace(/\s+/g, " ").trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") setCanHear(false);
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition || !recordingRef.current) return;
      try {
        recognition.start();
      } catch {
        setCanHear(false);
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setCanHear(false);
    }
  }

  async function finish() {
    recordingRef.current = false;
    stopHearing();
    const blob = await stop();
    if (heardRef.current) onTranscriptRef.current(heardRef.current);
    else if (blob) onTranscribe(blob, "");
  }

  function begin() {
    recordingRef.current = true;
    startHearing();
    void start();
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat || disabled || transcribing) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      if (recording) void finish();
      else begin();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // finish and begin close over the latest recorder controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, recording, start, stop, transcribing]);

  useEffect(() => () => stopHearing(), []);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-sheet p-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => (recording ? void finish() : begin())}
          disabled={disabled || transcribing}
          aria-pressed={recording}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className={cn(
            "grid h-16 w-16 shrink-0 place-items-center rounded-full text-white transition disabled:opacity-40",
            recording ? "bg-rose-600" : "bg-accent",
          )}
        >
          {transcribing ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : recording ? (
            <Square className="h-5 w-5 fill-current" />
          ) : (
            <Mic className="h-7 w-7" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">
              {transcribing ? "Transcribing" : recording ? "Listening" : "Tap to record"}
            </p>
            <p className="font-mono text-xs tabular-nums text-mute">{formatTime(recorder.elapsedMs)}</p>
          </div>
          <div className="mt-2 flex h-7 items-end gap-0.5" aria-hidden="true">
            {recorder.bars.map((bar, index) => (
              <span
                key={index}
                className={cn("w-1 rounded-full transition-[height] duration-150", recording ? "bg-accent" : "bg-line")}
                style={{ height: `${Math.round(6 + bar * (recording ? 22 : 8))}px` }}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs leading-5 text-mute">
        {recording
          ? "Speak in Hebrew or English. The words appear below as you talk. Tap the square to stop."
          : canHear
            ? "Tap the microphone and explain the five words. The transcript fills in while you speak."
            : "This browser cannot transcribe speech. Type the explanation in the box below."}
      </p>
      {recorder.error ? (
        <p role="alert" className="text-sm text-amber-800">
          {recorder.error}
        </p>
      ) : null}
      {recorder.audioUrl ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <audio controls src={recorder.audioUrl} className="h-9 w-full" />
          <button
            type="button"
            onClick={() => {
              recordingRef.current = false;
              stopHearing();
              publish("");
              recorder.reset();
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-mute hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard take
          </button>
        </div>
      ) : null}
    </div>
  );
}
