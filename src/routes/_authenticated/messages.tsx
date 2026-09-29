import { createFileRoute } from "@tanstack/react-router";
import { AppEntry } from "@/components/app-entry";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({ meta: [
    { title: "Messages | Avenn" },
    { name: "description", content: "Secure patient and care-team conversations in Avenn." },
    { property: "og:title", content: "Messages | Avenn" },
    { property: "og:description", content: "Secure, connected healthcare messaging for continuous care." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AppEntry page="messages" />,
});