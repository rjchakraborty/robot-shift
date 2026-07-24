import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AuthProvider } from "./auth/auth-context";
import { CourseDataProvider } from "./data/course-data-context";
import { FirebaseObservability } from "./firebase-observability";
import {
  HOME_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from "./seo";
import { THEME_INITIALIZER } from "./theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const homeStructuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL.origin}/#organization`,
      name: SITE_NAME,
      url: SITE_URL.origin,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL.origin}/#website`,
      name: SITE_NAME,
      url: SITE_URL.origin,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: {
        "@id": `${SITE_URL.origin}/#organization`,
      },
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL.origin}/#course`,
      name: HOME_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL.origin,
      inLanguage: "en",
      provider: {
        "@id": `${SITE_URL.origin}/#organization`,
      },
    },
  ],
}).replace(/</g, "\\u003c");

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "robotics course",
    "robotics curriculum",
    "ROS 2",
    "robot learning",
    "embodied AI",
    "AI tutor",
    "career roadmap",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INITIALIZER }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: homeStructuredData }}
        />
        <AuthProvider>
          <CourseDataProvider>
            <FirebaseObservability />
            {children}
          </CourseDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
