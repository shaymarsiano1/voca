"use client";

import { useEffect } from "react";
import { LoaderCircle, Mic, RotateCcw, Square } from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { cn } from "@/lib/cn";

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AudioRecorder({
  disabled = false,
  transcribing = false,
  onCapture,
}: {
  disabled?: boolean;
  transcribing?: boolean;
  onCapture: (blob: Blob) => void;
}) {
  const recorder = useAudioRecorder();
  const { start, stop, status } = recorder;
  const recording = status === "recording";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat || disabled || transcribing) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      if (recording) {
        void stop().then((blob) => {
          if (blob) onCapture(blob);
        });
      } else {
        void start();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, onCapture, recording, start, stop, transcribing]);

  async function toggle() {
    if (recording) {
      const blob = await recorder.stop();
      if (blob) onCapture(blob);
      return;
    }
    await recorder.start();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-sheet p-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void toggle()}
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
              {transcribing ? "Transcribing" : recording ? "Listening" : "Record"}
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
      <p className="text-xs text-mute">Hebrew and English together. Space to {recording ? "stop" : "start"}.</p>
      {recorder.error ? (
        <p role="alert" className="px-1 text-sm text-amber-800">
          {recorder.error}
        </p>
      ) : null}
      {recorder.audioUrl ? (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
          <audio controls src={recorder.audioUrl} className="h-9 w-full" />
          <button
            type="button"
            onClick={recorder.reset}
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
