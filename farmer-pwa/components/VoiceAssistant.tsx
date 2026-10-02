"use client";

import { useEffect, useRef, useState } from "react";
import { AppLanguage } from "../lib/demo-session";
import { getSpeechLocale } from "../lib/voice";

type VoiceLabels = {
  read: string;
  pause: string;
  resume: string;
  stop: string;
  playing: string;
  paused: string;
  unavailable: string;
  disabled: string;
};

type VoiceAssistantProps = {
  text: string;
  language: AppLanguage;
  enabled: boolean;
  labels: VoiceLabels;
};

type PlaybackState = "idle" | "speaking" | "paused";

export default function VoiceAssistant({ text, language, enabled, labels }: VoiceAssistantProps) {
  const [playback, setPlayback] = useState<PlaybackState>("idle");
  const [message, setMessage] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (enabled) return;
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlayback("idle");
    setMessage("");
  }, [enabled]);

  function readAloud() {
    if (!enabled) {
      setMessage(labels.disabled);
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      setMessage(labels.unavailable);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLocale(language);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => {
        utteranceRef.current = utterance;
        setMessage("");
        setPlayback("speaking");
      };
      utterance.onend = () => {
        if (utteranceRef.current !== utterance) return;
        utteranceRef.current = null;
        setPlayback("idle");
      };
      utterance.onerror = (event) => {
        if (utteranceRef.current !== utterance) return;
        utteranceRef.current = null;
        setPlayback("idle");
        if (event.error !== "canceled" && event.error !== "interrupted") setMessage(labels.unavailable);
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setMessage("");
      setPlayback("speaking");
    } catch {
      utteranceRef.current = null;
      setPlayback("idle");
      setMessage(labels.unavailable);
    }
  }

  function pause() {
    if (typeof window === "undefined" || !window.speechSynthesis || playback !== "speaking") return;
    try {
      window.speechSynthesis.pause();
      setPlayback("paused");
    } catch {
      setMessage(labels.unavailable);
    }
  }

  function resume() {
    if (typeof window === "undefined" || !window.speechSynthesis || playback !== "paused") return;
    try {
      window.speechSynthesis.resume();
      setPlayback("speaking");
    } catch {
      setMessage(labels.unavailable);
    }
  }

  function stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlayback("idle");
    setMessage("");
  }

  return (
    <div className="voice-assistant">
      <div className="voice-controls" role="group" aria-label={labels.read}>
        <button type="button" onClick={readAloud} disabled={!enabled || !text.trim()} aria-label={labels.read} aria-pressed={playback === "speaking"}>
          <span aria-hidden="true">🔊</span> {labels.read}
        </button>
        <button type="button" onClick={pause} disabled={!enabled || playback !== "speaking"} aria-label={labels.pause}>
          <span aria-hidden="true">⏸</span> {labels.pause}
        </button>
        <button type="button" onClick={resume} disabled={!enabled || playback !== "paused"} aria-label={labels.resume}>
          <span aria-hidden="true">▶</span> {labels.resume}
        </button>
        <button type="button" onClick={stop} disabled={!enabled || playback === "idle"} aria-label={labels.stop}>
          <span aria-hidden="true">⏹</span> {labels.stop}
        </button>
      </div>
      <p className="voice-status" role="status" aria-live="polite" aria-atomic="true">
        {message || (playback === "speaking" ? labels.playing : playback === "paused" ? labels.paused : "")}
      </p>
    </div>
  );
}
