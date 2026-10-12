import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageRoot } from "@/components/shared/language";
import { cn } from "@/lib/utils";

const sans = localFont({ src: "./fonts/geist-latin.woff2", variable: "--font-sarj-sans", display: "swap" });
const mono = localFont({ src: "./fonts/geist-mono-latin.woff2", variable: "--font-geist-mono", display: "swap" });
export const metadata: Metadata = {
  title: { default: "Sarj Real Estate | Your next chapter in Riyadh", template: "%s | Sarj Real Estate" },
  description: "Discover land opportunities across Riyadh. Find the right residential or commercial land for your ambition with Sarj Real Estate.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={cn("h-full antialiased font-sans", sans.variable, mono.variable)}><body className="min-h-full flex flex-col"><LanguageRoot>{children}</LanguageRoot></body></html>;
}
