import type { Partner } from "@/lib/community-types";

/** Partner communities and organisations shown on the community hub and event pages. */
export const PARTNERS: Partner[] = [
  {
    id: "oss-grid",
    name: "OSS Grid",
    role: "organiser",
    url: "https://www.ossgrid.tech",
    blurb: "Community hub and event organiser.",
  },
  {
    id: "devclub-nst",
    name: "DevClub NST",
    role: "co-organiser",
    blurb: "Developer community at NST, Rishihood University.",
  },
  {
    id: "oss-connect",
    name: "OSS Connect",
    role: "community",
    blurb: "Community partner connecting open-source contributors.",
  },
  {
    id: "eagle",
    name: "Eagle",
    role: "sponsor",
    url: "https://github.com/eagle-hq/EAGLE-4",
    blurb: "Sponsor. Teams build on EAGLE-4.",
  },
];
