"use client";

import Script from "next/script";

export default function Analytics() {
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "73186f75622247c0af91349af1f2e7a7"}'
      strategy="afterInteractive"
    />
  );
}
