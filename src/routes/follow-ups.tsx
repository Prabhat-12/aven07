import { createFileRoute } from "@tanstack/react-router";
import { AvennDashboard } from "@/components/avenn-dashboard";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({ meta: [
    { title: "Follow-ups | Avenn" },
    { name: "description", content: "Manage due, overdue, upcoming, and completed patient follow-ups." },
    { property: "og:title", content: "Follow-ups | Avenn" },
    { property: "og:description", content: "A clear clinical workspace for patient follow-up appointments." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AvennDashboard initialPage="follow-ups" />,
});