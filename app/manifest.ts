import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "GarageBoost", short_name: "GarageBoost", description: "Pilotage de la fidélisation garage", start_url: "/dashboard", display: "standalone", background_color: "#f6f7fb", theme_color: "#101b35", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] }; }
