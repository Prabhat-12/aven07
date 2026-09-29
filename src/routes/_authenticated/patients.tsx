import { createFileRoute } from "@tanstack/react-router";
import { AppEntry } from "@/components/app-entry";

export const Route = createFileRoute("/_authenticated/patients")({
  head: () => ({ meta: [
    { title: "Patients | Avenn" },
    { name: "description", content: "Review patient records, care plans, visits, and clinical notes in Avenn." },
    { property: "og:title", content: "Patients | Avenn" },
    { property: "og:description", content: "Connected patient records and care planning for clinical teams." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AppEntry page="patients" />,
});