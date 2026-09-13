import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { safeJsonLd } from "@/lib/seo";
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
  metadataBase: new URL("https://www.ossgrid.tech"),
  title: {
    default: "OSSGrid — Open Source Mentorship & Ecosystem Explorer",
    template: "%s | OSSGrid",
  },
  description:
    "Explore and discover open-source mentorship programs (LFX Mentorship, CNCF, and upcoming GSoC). Filter projects, technologies, stipends, and mentors.",
  keywords: [
    "OSSGrid",
    "LFX Mentorship",
    "Google Summer of Code",
    "GSoC",
    "Linux Foundation",
    "CNCF",
    "open source",
    "mentorship",
    "cloud native",
    "Kubernetes",
    "internship",
    "open source internship",
    "developer mentorship",
  ],
  authors: [{ name: "OSSGrid", url: "https://www.ossgrid.tech" }],
  creator: "OSSGrid",
  publisher: "OSSGrid",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.ossgrid.tech",
    siteName: "OSSGrid",
    title: "OSSGrid — Open Source Mentorship & Ecosystem Explorer",
    description:
      "Explore and discover open-source mentorship programs (LFX Mentorship, CNCF, and upcoming GSoC). Filter projects, technologies, stipends, and mentors.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OSSGrid — Open Source Mentorship Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSSGrid — Open Source Mentorship & Ecosystem Explorer",
    description:
      "Explore and discover open-source mentorship programs (LFX Mentorship, CNCF, and upcoming GSoC). Filter projects, technologies, stipends, and mentors.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

const globalJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.ossgrid.tech/#website",
      "url": "https://www.ossgrid.tech",
      "name": "OSSGrid",
      "description": "Open Source Mentorship & Ecosystem Explorer",
      "inLanguage": "en-US",
    },
    {
      "@type": "Organization",
      "@id": "https://www.ossgrid.tech/#organization",
      "name": "OSSGrid",
      "url": "https://www.ossgrid.tech",
      "logo": "https://www.ossgrid.tech/icon.svg",
      "sameAs": ["https://github.com/rajatrsrivastav/ossgrid"],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(globalJsonLd) }}
          suppressHydrationWarning
        />
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
