"use client";

import Script from "next/script";

export default function Analytics() {
  // Replace YOUR_WEBSITE_ID below with the actual data-website-id from the Umami Cloud snippet
  // The src URL is usually something like https://cloud.umami.is/script.js or your custom domain.
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "YOUR_WEBSITE_ID";
  const scriptSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";

  if (websiteId === "YOUR_WEBSITE_ID") {
    return null;
  }

  return (
    <Script
      src={scriptSrc}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
