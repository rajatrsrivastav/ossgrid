import { redirect } from "next/navigation";

/** Contributors directory removed from the product surface; credit lives as “built in the open”. */
export default function ContributorsPage() {
  redirect("/community");
}
