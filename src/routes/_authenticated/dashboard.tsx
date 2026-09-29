import { createFileRoute } from "@tanstack/react-router";
import { AppEntry } from "@/components/app-entry";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Clinical Dashboard | Avenn" },
      { name: "description", content: "Avenn clinical dashboard for schedules, follow-ups and patient messages." },
      { property: "og:title", content: "Clinical Dashboard | Avenn" },
      { property: "og:description", content: "A connected overview of today’s patient care priorities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AppEntry page="dashboard" />,
});
