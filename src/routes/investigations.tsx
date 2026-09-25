import { createFileRoute } from "@tanstack/react-router";
import { AvennDashboard } from "@/components/avenn-dashboard";

export const Route = createFileRoute("/investigations")({
  head: () => ({ meta: [
    { title: "Investigations | Avenn" },
    { name: "description", content: "Track assigned investigations, incoming results, and clinical reviews." },
    { property: "og:title", content: "Investigations | Avenn" },
    { property: "og:description", content: "Patient investigation tracking and result review for clinical teams." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AvennDashboard initialPage="investigations" />,
});