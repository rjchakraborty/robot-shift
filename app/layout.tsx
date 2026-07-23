import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { THEME_INITIALIZER } from "./theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#f3f0e7",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Robot/Shift — 180-Day Robotics Field Manual";
  const description = "A practical 180-day robotics course, progress tracker, and AI tutor for a software engineer moving into embodied AI.";

  return {
    title,
    description,
    applicationName: "Robot/Shift",
    keywords: ["robotics course", "robotics curriculum", "ROS 2", "robot learning", "embodied AI", "AI tutor", "career roadmap"],
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: `${origin}/og.png`, width: 1680, height: 941, alt: "Robot/Shift 180-day robotics field manual" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INITIALIZER }}
        />
        {children}
      </body>
    </html>
  );
}
