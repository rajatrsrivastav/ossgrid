"use client";

import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Privacy-friendly analytics: Cloudflare Web Analytics, Vercel Web Analytics (page views) and
 * Vercel Speed Insights (Core Web Vitals). None of them set cookies. The Vercel scripts only
 * report when the site runs on Vercel with Analytics enabled for the project.
 */
export default function Analytics() {
  return (
    <>
      <Script
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "73186f75622247c0af91349af1f2e7a7"}'
        strategy="afterInteractive"
      />
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
