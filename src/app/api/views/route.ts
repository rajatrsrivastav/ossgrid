import { NextResponse } from "next/server";

/**
 * Deprecated proxy. The footer counts views in the browser against CountAPI
 * so Hobby function timeouts / quota soft-blocks do not break the counter.
 * Kept as a thin redirect-style hint for any old clients.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Use the CountAPI host directly from the client.",
      upstream: "https://abacus.jasoncameron.dev",
      namespace: "ossgrid",
      key: "prod_visits",
    },
    { status: 410 },
  );
}

export async function GET() {
  return POST();
}
