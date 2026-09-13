/**
 * SEO and Structured Data Utilities
 */

export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "OSSGrid — Open Source Mentorship Explorer",
};

/**
 * Safely serialize JSON-LD to prevent HTML script termination and injection vulnerabilities.
 * Replaces `<` with `\u003c`, preventing `</script>` breakouts in script tags.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
