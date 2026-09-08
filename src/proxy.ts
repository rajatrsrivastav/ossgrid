import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory sliding-window rate limiter (sufficient for serverless edge)
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string, maxRequests = 30, windowMs = 10000): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > now - windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > maxRequests;
}

export async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

  // Rate limit API and dynamic organization routes
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/organization/")
  ) {
    if (isRateLimited(ip)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // Validate organization slugs
  if (request.nextUrl.pathname.startsWith("/organization/")) {
    const slug = request.nextUrl.pathname.split("/").pop() || "";

    if (slug.length > 100) {
      return new NextResponse("Invalid Organization ID", { status: 400 });
    }
    if (slug && !/^[a-zA-Z0-9\-_]+$/.test(slug)) {
      return new NextResponse("Invalid Organization ID Format", { status: 400 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/organization/:path*",
  ],
};
