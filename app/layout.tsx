import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "GarageBoost", description: "Pilotage de la fidélisation garage", applicationName: "GarageBoost", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "GarageBoost", statusBarStyle: "default" }, icons: { icon: "/icon.svg", apple: "/icon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }
