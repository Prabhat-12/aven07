import { createFileRoute } from "@tanstack/react-router";
import { AvennDashboard } from "@/components/avenn-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asha Sharma — Patient Overview | Avenn" },
      { name: "description", content: "Avenn patient overview for connected diabetes care, investigations, history, and care planning." },
      { property: "og:title", content: "Patient Overview | Avenn" },
      { property: "og:description", content: "A calm, connected doctor workspace for diabetes care continuity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvennDashboard,
});
