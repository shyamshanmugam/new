"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { pageCopy } from "../../lib/demo-copy";
import { AppLanguage, endDemoSession, isDemoAuthenticated, readLanguage, saveLanguage } from "../../lib/demo-session";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function DashboardPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>("English");
  const [ready, setReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const text = pageCopy[language];

  useEffect(() => {
    const storedLanguage = readLanguage();
    setLanguage(storedLanguage);
    document.documentElement.lang = storedLanguage === "Hindi" ? "hi" : storedLanguage === "Kannada" ? "kn" : storedLanguage === "Tamil" ? "ta" : "en";
    if (!isDemoAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    function captureInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    }
    function clearInstallPrompt() {
      setInstallPrompt(null);
    }
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", clearInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", clearInstallPrompt);
    };
  }, []);

  function changeLanguage(next: AppLanguage) {
    setLanguage(next);
    saveLanguage(next);
    document.documentElement.lang = next === "Hindi" ? "hi" : next === "Kannada" ? "kn" : next === "Tamil" ? "ta" : "en";
  }

  function logout() {
    endDemoSession();
    router.replace("/login");
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  if (!ready) return <main className="page-loading" aria-live="polite">Kisan Soil Advisor</main>;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/dashboard"><img src="/soil-icon.svg" alt="" width="42" height="42" /><span>Kisan Soil Advisor</span></a>
        <div className="dashboard-controls">
          {installPrompt && <button type="button" className="logout-button" onClick={installApp}>{text.install}</button>}
          <label className="page-language"><span>{text.language}</span>
            <select value={language} onChange={(event) => changeLanguage(event.target.value as AppLanguage)} aria-label={text.language}>
              <option value="English">English</option><option value="Hindi">हिन्दी</option>
              <option value="Kannada">ಕನ್ನಡ</option><option value="Tamil">தமிழ்</option>
            </select>
          </label>
          <button type="button" className="logout-button" onClick={logout}>{text.signOut}</button>
        </div>
      </header>
      <section className="dashboard-intro">
        <p className="eyebrow">{text.heroEyebrow}</p>
        <h1>{text.dashboardTitle}</h1>
        <p>{text.dashboardSubtitle}</p>
      </section>
      <section className="dashboard-hero" aria-labelledby="dashboard-hero-heading">
        <div className="dashboard-hero-copy">
          <p className="eyebrow">{text.heroEyebrow}</p>
          <h2 id="dashboard-hero-heading">{text.heroTitle}</h2>
          <p>{text.heroBody}</p>
          <a className="dashboard-cta" href="/#soil-inputs">{text.openAnalysis}</a>
        </div>
        <img src="/field-soil-illustration.svg" alt={text.heroAlt} width="1200" height="560" />
      </section>
      <section className="dashboard-tools" aria-labelledby="tools-heading">
        <h2 id="tools-heading">{text.overview}</h2>
        <div className="tool-grid">
          <article className="tool-item tool-item-primary"><span className="tool-index" aria-hidden="true">01</span><h3>{text.soilAnalysis}</h3><p>{text.soilAnalysisBody}</p><a href="/#soil-inputs">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">02</span><h3>{text.uploadImage}</h3><p>{text.soilAnalysisBody}</p><a href="/#soil-inputs">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">03</span><h3>{text.soilParameters}</h3><p>{text.soilAnalysisBody}</p><a href="/#soil-inputs">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">04</span><h3>{text.soilHealth}</h3><p>{text.heroBody}</p><a href="/#analysis">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">05</span><h3>{text.cropRecommendations}</h3><p>{text.heroBody}</p><a href="/#analysis">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">06</span><h3>{text.fertilizerRecommendations}</h3><p>{text.heroBody}</p><a href="/#analysis">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">07</span><h3>{text.history}</h3><p>{text.soilAnalysisBody}</p><a href="/#recent-analyses">{text.openAnalysis}</a></article>
          <article className="tool-item"><span className="tool-index" aria-hidden="true">08</span><h3>{text.voice}</h3><p>{text.heroBody}</p><a href="/#analysis">{text.openAnalysis}</a></article>
        </div>
      </section>
      <footer className="dashboard-footer">{text.dashboardSubtitle}</footer>
    </main>
  );
}