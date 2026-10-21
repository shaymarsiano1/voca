import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Voca",
    short_name: "Voca",
    description: "Daily technical English for software engineers.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fb",
    theme_color: "#2f6fed",
    icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }],
  };
}
