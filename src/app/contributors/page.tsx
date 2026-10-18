import type { Metadata } from "next";
import Header from "@/components/Header";
import ContributorsClient from "./ContributorsClient";
import snapshot from "@/data/contributors-history.json";
import { mergeContributors } from "@/lib/contributors";

export const metadata: Metadata = {
  title: "OSSGrid contributors",
  description: "Recognizing the people who build and maintain OSSGrid, including past contributors.",
  alternates: { canonical: "/contributors" },
};

export default function ContributorsPage() {
  return <><Header /><ContributorsClient initialContributors={mergeContributors(snapshot.contributors)} /></>;
}
