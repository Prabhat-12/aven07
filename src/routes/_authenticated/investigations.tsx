import { createFileRoute } from "@tanstack/react-router";
import { AppEntry } from "@/components/app-entry";

export const Route = createFileRoute("/_authenticated/investigations")({
  head: () => ({ meta: [
    { title: "Investigations | Avenn" },
    { name: "description", content: "Track assigned investigations, incoming results, and clinical reviews." },
    { property: "og:title", content: "Investigations | Avenn" },
    { property: "og:description", content: "Patient investigation tracking and result review for clinical teams." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AppEntry page="investigations" />,
});