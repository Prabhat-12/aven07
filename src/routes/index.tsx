import { createFileRoute } from "@tanstack/react-router";
import { AvennDashboard } from "@/components/avenn-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clinical Dashboard | Avenn" },
      { name: "description", content: "Avenn clinical dashboard for schedules, follow-ups, results, and patient messages." },
      { property: "og:title", content: "Clinical Dashboard | Avenn" },
      { property: "og:description", content: "A connected overview of today’s patient care priorities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AvennDashboard initialPage="dashboard" />,
});
