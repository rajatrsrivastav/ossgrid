import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import MotionProvider from "@/components/MotionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://ossgrid.dev"
  ),
  title: {
    default: "LFX Organizations — Open Source Mentorship Explorer",
    template: "%s — LFX Organizations",
  },
  description:
    "Discover 80+ organizations and 560+ projects from the LFX Mentorship program. Filter by technology, year, and term. Find open-source projects to contribute to.",
  keywords: [
    "LFX Mentorship",
    "open source",
    "mentorship",
    "Linux Foundation",
    "CNCF",
    "internship",
    "developer",
  ],
  authors: [{ name: "OSSGrid Contributors" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ossgrid.dev",
    siteName: "LFX Organizations",
    title: "LFX Organizations — Open Source Mentorship Explorer",
    description:
      "Discover 80+ organizations and 560+ projects from the LFX Mentorship program. Filter by technology, year, and term.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LFX Organizations — Explore Mentorship Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LFX Organizations — Open Source Mentorship Explorer",
    description:
      "Discover 80+ organizations and 560+ projects from the LFX Mentorship program.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
