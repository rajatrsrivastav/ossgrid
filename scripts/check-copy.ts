/**
 * Fails when UI copy in src/ contains marketing filler or hype words.
 * Run: npm run check:copy
 */
import fs from "fs";
import path from "path";

const BANNED = [
  "mission control", "launchpad", "telemetry", /\bHUD\b/, /\bmatrix\b/, "intelligence platform", "effortless", "seamless",
  "unlock", "supercharge", "elevate", "empower", "journey", "leverage", "robust", "cutting-edge", "world-class",
  /world.s largest/, "deep-dive", "acquisition-grade", "premier", "flagship", "frictionless", "game-changing",
];

const ROOT = path.join(process.cwd(), "src");
const exts = new Set([".tsx", ".ts", ".json"]);
const failures: string[] = [];

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name))) check(full);
  }
}

function check(file: string) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // comments are fine
    for (const b of BANNED) {
      const re = typeof b === "string" ? new RegExp(b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : new RegExp(b.source, b.flags.includes("i") ? b.flags : b.flags + "i");
      if (re.test(line)) failures.push(`${path.relative(process.cwd(), file)}:${i + 1}  "${line.trim().slice(0, 100)}"  ← ${b.toString()}`);
    }
  });
}

walk(ROOT);
if (failures.length) {
  console.error(`check:copy found ${failures.length} banned word${failures.length === 1 ? "" : "s"}:\n`);
  failures.forEach((f) => console.error("  " + f));
  process.exit(1);
}
console.log("check:copy: no banned words in src/.");
