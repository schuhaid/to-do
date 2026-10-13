import { redirect } from "next/navigation";

// proxy.ts sends logged-out visitors to /login before this runs.
export default function Home() {
  redirect("/todos");
}
