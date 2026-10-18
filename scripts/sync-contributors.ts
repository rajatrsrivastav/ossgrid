import fs from "node:fs/promises";
import { fetchContributors } from "../src/lib/fetch-contributors";
import { mergeContributors } from "../src/lib/contributors";
import { ossgridRepo } from "../src/data/contributors";
import snapshot from "../src/data/contributors-history.json";

// Fetch all pages successfully before writing; preserve previously recognized people.
async function main() {
const contributors = mergeContributors(snapshot.contributors, await fetchContributors());
await fs.writeFile(new URL("../src/data/contributors-history.json", import.meta.url), JSON.stringify({ repository: ossgridRepo, verifiedAt: new Date().toISOString().slice(0, 10), contributors }, null, 2) + "\n");
console.log(`Saved ${contributors.length} OSSGrid contributors.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
