import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kisan Soil Advisor",
    short_name: "Soil Advisor",
    description: "Mobile-first soil health and crop advisory",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f6f8f1",
    theme_color: "#2f6e4f",
    icons: [
      { src: "/soil-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/soil-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/soil-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/soil-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
