import { createFileRoute } from "@tanstack/react-router";
import { AppEntry } from "@/components/app-entry";

export const Route = createFileRoute("/_authenticated/follow-ups")({
  head: () => ({ meta: [
    { title: "Follow-ups | Aven" },
    { name: "description", content: "Manage due, overdue, upcoming, and completed patient follow-ups." },
    { property: "og:title", content: "Follow-ups | Aven" },
    { property: "og:description", content: "A clear clinical workspace for patient follow-up appointments." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AppEntry page="follow-ups" />,
});