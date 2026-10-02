export type AppLanguage = "English" | "Hindi" | "Kannada" | "Tamil";

const sessionKey = "kisan-soil-advisor-demo-session";
const languageKey = "soil-advisor-language";

export function isDemoAuthenticated(): boolean {
  return sessionStorage.getItem(sessionKey) === "active" || localStorage.getItem(sessionKey) === "active";
}

export function startDemoSession(remember: boolean): void {
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(sessionKey);
  (remember ? localStorage : sessionStorage).setItem(sessionKey, "active");
}

export function endDemoSession(): void {
  sessionStorage.removeItem(sessionKey);
  localStorage.removeItem(sessionKey);
}

export function readLanguage(): AppLanguage {
  const language = localStorage.getItem(languageKey);
  return language === "Hindi" || language === "Kannada" || language === "Tamil" ? language : "English";
}

export function saveLanguage(language: AppLanguage): void {
  localStorage.setItem(languageKey, language);
}