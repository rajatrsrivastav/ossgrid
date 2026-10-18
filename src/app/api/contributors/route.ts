import snapshot from "@/data/contributors-history.json";
import { mergeContributors } from "@/lib/contributors";
import { fetchContributors } from "@/lib/fetch-contributors";

export async function GET() {
  try {
    const contributors = mergeContributors(snapshot.contributors, await fetchContributors());
    return Response.json({ contributors, stale: false }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ contributors: mergeContributors(snapshot.contributors), stale: true, verifiedAt: snapshot.verifiedAt }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  }
}
