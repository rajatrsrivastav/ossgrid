import { livePrograms, type Program } from "./programs";

/** Tool pages that are not programs. `enabled` flips when the route ships. */
export interface ToolPage { id: "proposals" | "guide"; label: string; href: string; verb: string; enabled: boolean }

export const TOOL_PAGES: ToolPage[] = [
  { id: "proposals", label: "Proposals", href: "/proposals", verb: "Read proposals", enabled: true },
  { id: "guide", label: "Playbook", href: "/guide", verb: "Read the playbook", enabled: true },
];

export const enabledTools = () => TOOL_PAGES.filter((t) => t.enabled);

export interface NavLink { label: string; href: string; external?: boolean }

/** Header navigation: Programs anchor, one link per live program, tools, playbook, FAQ. */
export function headerLinks(): NavLink[] {
  const programs = livePrograms().map((p) => ({ label: p.shortName, href: p.dashboardPath! }));
  const tools = enabledTools().filter((t) => t.id !== "guide").map((t) => ({ label: t.label, href: t.href }));
  const guide = TOOL_PAGES.find((t) => t.id === "guide");
  return [
    { label: "Programs", href: "/#programs" },
    ...programs,
    ...tools,
    { label: "Playbook", href: guide?.enabled ? guide.href : "/#playbook" },
    { label: "FAQ", href: "/#faq" },
  ];
}

/** Footer site links: Home, one per live program, tools, Programs, Source. */
export function footerLinks(): NavLink[] {
  const guide = TOOL_PAGES.find((t) => t.id === "guide");
  return [
    { label: "Home", href: "/" },
    ...livePrograms().map((p) => ({ label: `${p.shortName} organizations`, href: p.dashboardPath! })),
    ...enabledTools().filter((t) => t.id !== "guide").map((t) => ({ label: t.label, href: t.href })),
    { label: "Contributor playbook", href: guide?.enabled ? guide.href : "/#playbook" },
    { label: "Programs", href: "/#programs" },
    { label: "Source on GitHub", href: "https://github.com/rajatrsrivastav/ossgrid", external: true },
  ];
}

/** "GSoC data from a, b and c." for each live program, from its registry dataSources. */
export function attributionSentences(programs: Program[] = livePrograms()): { program: Program; sources: Program["dataSources"] }[] {
  return programs.map((p) => ({ program: p, sources: p.dataSources }));
}

export function trademarkLine(programs: Program[]): string {
  const names = [...new Set(programs.flatMap((p) => [p.name, p.runBy]))];
  return `${names.join(", ")} and CNCF are trademarks of their owners. OSSGrid is not affiliated with any of them.`;
}
