import { NextRequest, NextResponse } from "next/server";

// Node.js runtime (default) — reliable outbound HTTP on Vercel
// Do NOT add: export const runtime = "edge"

const NAMESPACE = "ossgrid";
const KEY = "prod_visits";
const UPSTREAM = "https://abacus.jasoncameron.dev";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { increment?: boolean };
    const isIncrement = body.increment === true;
    const url = isIncrement
      ? `${UPSTREAM}/hit/${NAMESPACE}/${KEY}`
      : `${UPSTREAM}/get/${NAMESPACE}/${KEY}`;

    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "ossgrid/1.0 (+https://ossgrid.dev)",
        Accept: "application/json",
      },
      // 5s timeout — keep it fast
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!upstream.ok) {
      throw new Error(`CountAPI returned ${upstream.status}`);
    }

    const data = await upstream.json() as { value?: unknown };

    if (typeof data.value !== "number") {
      throw new Error("Unexpected CountAPI response shape");
    }

    return NextResponse.json(
      { views: data.value },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[views] proxy error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
