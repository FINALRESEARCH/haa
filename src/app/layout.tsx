import type { Metadata } from "next";
import localFont from "next/font/local";
import { getSiteContent } from "@/sanity/content";
import "./globals.css";

const nudge = localFont({
  src: "../fonts/NudgeNormal-Medium.ttf",
  variable: "--font-nudge",
  weight: "500",
  display: "swap",
});

const groteskMono = localFont({
  src: "../fonts/Px-Grotesk-Mono-Regular.otf",
  variable: "--font-px-mono",
  weight: "400",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSiteContent();
  return { title: settings.title, description: settings.description };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nudge.variable} ${groteskMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
