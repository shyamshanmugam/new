export type VoiceLanguage = "English" | "Hindi" | "Kannada" | "Tamil";
export type SpeechLocale = "en-IN" | "hi-IN" | "kn-IN" | "ta-IN";

export type SpeechHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent["error"]) => void;
};

const speechLocales: Record<VoiceLanguage, SpeechLocale> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Kannada: "kn-IN",
  Tamil: "ta-IN",
};

export function getSpeechLocale(language: VoiceLanguage): SpeechLocale {
  return speechLocales[language];
}

export function speakText(text: string, locale: SpeechLocale, handlers: SpeechHandlers = {}): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    return false;
  }

  try {
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.onstart = handlers.onStart ?? null;
    utterance.onend = handlers.onEnd ?? null;
    utterance.onerror = (event) => handlers.onError?.(event.error);
    synthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeech(): void {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch {
    return;
  }
}