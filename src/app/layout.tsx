import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Newsreader, Manrope } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { safeJsonLd } from "@/lib/seo";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

// Cinematic display serif (optical size axis for very large settings) and a geometric UI sans.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050506" },
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ossgrid.tech"),
  title: {
    default: "OSSGrid: GSoC, LFX and open-source mentorship orgs in one place",
    template: "%s | OSSGrid",
  },
  description:
    "A free index of open-source mentorship programs. Browse LFX Mentorship and Google Summer of Code organizations by technology, year and project history.",
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
    title: "OSSGrid: GSoC, LFX and open-source mentorship orgs in one place",
    description:
      "A free index of open-source mentorship programs. Browse LFX Mentorship and Google Summer of Code organizations by technology, year and project history.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OSSGrid: GSoC, LFX and open-source mentorship orgs in one place",
    description:
      "A free index of open-source mentorship programs. Browse LFX Mentorship and Google Summer of Code organizations by technology, year and project history.",
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
  applicationName: "OSSGrid",
  category: "education",
  formatDetection: { telephone: false, email: false, address: false },
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
      "alternateName": ["OSS Grid", "GSoC Dashboard", "LFX Mentorship Dashboard"],
      "description": "Open Source Mentorship & Ecosystem Explorer",
      "inLanguage": "en-US",
      "publisher": { "@id": "https://www.ossgrid.tech/#organization" },
      // Lets search engines offer a search box for the site; the GSoC dashboard reads ?q=.
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://www.ossgrid.tech/gsoc?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
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
      className={`${jetbrainsMono.variable} ${newsreader.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
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
