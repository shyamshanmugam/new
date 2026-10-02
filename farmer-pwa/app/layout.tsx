import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./responsive.css";
import RegisterServiceWorker from "./register-service-worker";

export const metadata: Metadata = {
  title: "Kisan Soil Advisor",
  description: "Soil-health and crop-suitability advisory",
  applicationName: "Kisan Soil Advisor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6ed" },
    { media: "(prefers-color-scheme: dark)", color: "#111a14" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
