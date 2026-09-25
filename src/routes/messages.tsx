import { createFileRoute } from "@tanstack/react-router";
import { AvennDashboard } from "@/components/avenn-dashboard";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [
    { title: "Messages | Avenn" },
    { name: "description", content: "Secure patient and care-team conversations in Avenn." },
    { property: "og:title", content: "Messages | Avenn" },
    { property: "og:description", content: "Secure, connected healthcare messaging for continuous care." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AvennDashboard initialPage="messages" />,
});