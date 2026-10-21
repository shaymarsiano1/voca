"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "recording" | "stopped";

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 16 }, () => 0.08));
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const urlRef = useRef<string | null>(null);
  const mimeRef = useRef("");

  const releaseStream = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    releaseStream();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setAudioUrl(null);
    setElapsedMs(0);
    setLevel(0);
    setBars(Array.from({ length: 16 }, () => 0.08));
    setStatus("idle");
    setError(null);
  }, [releaseStream]);

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      releaseStream();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [releaseStream]);

  const start = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser cannot record audio. Type your explanations instead.");
      return;
    }

    try {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
      setAudioUrl(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      mimeRef.current = mimeType;
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;

      const context = new AudioContext();
      audioContextRef.current = context;
      if (context.state === "suspended") await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let lastPaint = 0;

      const tick = (time: number) => {
        frameRef.current = requestAnimationFrame(tick);
        if (time - lastPaint < 80) return;
        lastPaint = time;
        analyser.getByteFrequencyData(data);
        const samples = Array.from({ length: 16 }, (_, index) => {
          const startIndex = Math.floor((index / 16) * data.length);
          const endIndex = Math.max(startIndex + 1, Math.floor(((index + 1) / 16) * data.length));
          let sum = 0;
          for (let cursor = startIndex; cursor < endIndex; cursor += 1) sum += data[cursor] ?? 0;
          return Math.min(1, sum / (endIndex - startIndex) / 170);
        });
        setBars(samples.map((sample) => Math.max(0.08, sample)));
        setLevel(samples.reduce((total, sample) => total + sample, 0) / samples.length);
      };
      frameRef.current = requestAnimationFrame(tick);

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      timerRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 200);
      recorder.start(250);
      setStatus("recording");
    } catch (err) {
      releaseStream();
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setError("Microphone access was blocked. You can type your explanations instead.");
      } else if (name === "NotFoundError" || name === "NotReadableError") {
        setError("No microphone was available. Type your explanations instead.");
      } else {
        setError("Could not start recording. Type your explanations instead.");
      }
      setStatus("idle");
    }
  }, [releaseStream]);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return null;
    const elapsed = Date.now() - startedAtRef.current;

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeRef.current || "audio/webm";
        resolve(new Blob(chunksRef.current, { type }));
      };
      recorder.stop();
    });

    releaseStream();
    recorderRef.current = null;
    setLevel(0);
    setElapsedMs(elapsed);

    if (elapsed < 1200 || blob.size < 800) {
      setStatus("idle");
      setBars(Array.from({ length: 16 }, () => 0.08));
      setError("That take was too short. Record at least a couple of seconds.");
      return null;
    }

    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    setAudioUrl(url);
    setStatus("stopped");
    return blob;
  }, [releaseStream]);

  return { status, elapsedMs, level, bars, error, audioUrl, start, stop, reset };
}
