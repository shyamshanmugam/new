"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pageCopy } from "../../lib/demo-copy";
import { AppLanguage, readLanguage, saveLanguage, startDemoSession } from "../../lib/demo-session";

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>("English");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const text = pageCopy[language];

  useEffect(() => {
    const storedLanguage = readLanguage();
    setLanguage(storedLanguage);
    document.documentElement.lang = storedLanguage === "Hindi" ? "hi" : storedLanguage === "Kannada" ? "kn" : storedLanguage === "Tamil" ? "ta" : "en";
  }, []);

  function changeLanguage(next: AppLanguage) {
    setLanguage(next);
    saveLanguage(next);
    document.documentElement.lang = next === "Hindi" ? "hi" : next === "Kannada" ? "kn" : next === "Tamil" ? "ta" : "en";
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!String(form.get("identifier") || "").trim() || !String(form.get("password") || "")) {
      setMessage(text.loginError);
      return;
    }
    startDemoSession(remember);
    router.replace("/dashboard");
  }

  const createAccount = language === "Hindi" ? "खाता बनाएँ" : language === "Kannada" ? "ಖಾತೆ ರಚಿಸಿ" : language === "Tamil" ? "கணக்கை உருவாக்கு" : "Create account";

  return (
    <main className="auth-page">
      <header className="auth-brand">
        <a href="/" aria-label="Kisan Soil Advisor home">
          <img src="/soil-icon.svg" alt="" width="44" height="44" />
          <span>Kisan Soil Advisor</span>
        </a>
        <label className="page-language">
          <span>{text.language}</span>
          <select value={language} onChange={(event) => changeLanguage(event.target.value as AppLanguage)} aria-label={text.language}>
            <option value="English">English</option><option value="Hindi">हिन्दी</option>
            <option value="Kannada">ಕನ್ನಡ</option><option value="Tamil">தமிழ்</option>
          </select>
        </label>
      </header>
      <section className="auth-content" aria-labelledby="login-heading">
        <p className="eyebrow">KISAN SOIL ADVISOR</p>
        <h1 id="login-heading">{text.loginTitle}</h1>
        <p className="auth-subtitle">{text.loginSubtitle}</p>
        <form className="auth-form" onSubmit={submit}>
          <label>{text.identifier}<input name="identifier" type="text" autoComplete="username" placeholder={text.identifierPlaceholder} required /></label>
          <label>{text.password}
            <span className="password-control">
              <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? text.hidePassword : text.showPassword}>
                {showPassword ? text.hidePassword : text.showPassword}
              </button>
            </span>
          </label>
          <div className="login-options">
            <label className="remember-option"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> {text.remember}</label>
            <button type="button" className="text-command" onClick={() => setMessage(text.recoveryUnavailable)}>{text.forgot}</button>
          </div>
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="primary auth-submit" type="submit">{text.login}</button>
        </form>
        <p className="demo-disclosure">{text.demoNotice}</p>
        <button type="button" className="text-command registration-link" onClick={() => setMessage(text.registrationUnavailable)}>{createAccount}</button>
      </section>
    </main>
  );
}