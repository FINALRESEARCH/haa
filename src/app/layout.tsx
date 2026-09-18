import type { Metadata, Viewport } from "next";
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
  const { title, description, favicon, ogImage } = settings;

  // `ogImage` is deliberately `null` until the client supplies one — see the
  // "SEO & sharing" group in Site Settings. Omitting `images` entirely means
  // shares fall back to no preview rather than a placeholder standing in as
  // if it were final artwork.
  const shareImage = ogImage ? [{ url: ogImage }] : undefined;

  return {
    title,
    description,
    icons: {
      icon: [
        { url: favicon, type: favicon.endsWith(".svg") ? "image/svg+xml" : undefined },
      ],
    },
    openGraph: {
      title,
      description,
      siteName: title,
      type: "website",
      images: shareImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: shareImage,
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { settings } = await getSiteContent();
  return { themeColor: settings.theme.brand };
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
