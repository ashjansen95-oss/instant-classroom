import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Instant Classroom",
    short_name: "Instant",
    description: "Shake your phone. Get a classroom activity. Run it.",
    // Straight to the generator — the whole product is one screen away.
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffbf4",
    theme_color: "#5b3df5",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Surprise me", short_name: "Surprise", url: "/?need=surprise" },
      { name: "Calm them down", short_name: "Calm", url: "/?need=calm" },
      { name: "Wake them up", short_name: "Wake", url: "/?need=wake" },
    ],
  };
}
