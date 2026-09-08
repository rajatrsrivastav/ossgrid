import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LFX Organizations — Linux Foundation Mentorship Explorer",
  description:
    "Explore and discover Linux Foundation Mentorship (LFX) organizations, projects, technologies, and mentors. Filter by term, category, and technology stack.",
  keywords: [
    "LFX Mentorship",
    "Linux Foundation",
    "CNCF",
    "open source",
    "mentorship",
    "cloud native",
    "Kubernetes",
    "internship",
  ],
  openGraph: {
    title: "LFX Organizations — Linux Foundation Mentorship Explorer",
    description:
      "Discover LFX Mentorship organizations and projects. Search, filter, and apply.",
    type: "website",
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-inter, 'Inter', sans-serif)" }}
      >
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
