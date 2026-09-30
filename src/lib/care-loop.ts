import { TODAY_ISO } from "./patient-types";

// Shared care-loop vocabulary used by the doctor, patient and reception views.
export type CareTask = { id: string; title: string; detail: string; dueIso: string | null; status: string };
export type CheckIn = { id?: string; status: string; message: string; date: string };

export const CHECKIN_OPTIONS = ["On track", "Some difficulty", "I haven't been able to follow it"] as const;
export const APPOINTMENT_STATUSES = ["Scheduled", "Confirmed", "Arrived", "Waiting", "Completed", "No-show", "Reschedule requested"] as const;

const dayDiff = (iso: string) => Math.round((new Date(`${iso}T00:00:00Z`).getTime() - new Date(`${TODAY_ISO}T00:00:00Z`).getTime()) / 86400000);

// Displayed state combines the stored status with the due date. Always shown as text, never colour alone.
export function taskState(t: CareTask): { label: string; tone: "done" | "active" | "due" | "overdue" | "idle" } {
  if (t.status === "Completed") return { label: "Completed", tone: "done" };
  if (t.dueIso) {
    const d = dayDiff(t.dueIso);
    if (d < 0) return { label: "Overdue", tone: "overdue" };
    if (d === 0) return { label: "Due today", tone: "due" };
    if (d <= 7) return { label: "Due this week", tone: "due" };
  }
  if (t.status === "In progress") return { label: "In progress", tone: "active" };
  return { label: t.status === "Pending" ? "Pending" : "Not started", tone: "idle" };
}

export const isOpenTask = (t: CareTask) => t.status !== "Completed";
export const progressOf = (tasks: CareTask[]) => ({ done: tasks.filter((t) => !isOpenTask(t)).length, total: tasks.length });
export const latestDifficulty = (checkins: CheckIn[] | undefined) => checkins?.find((c) => c.status !== "On track");

export function guestCareTasks(prefix: string): CareTask[] {
  return [
    { id: `${prefix}-1`, title: "Attend consultation and review care plan", detail: "Completed on 18 Sep", dueIso: "2026-09-18", status: "Completed" },
    { id: `${prefix}-2`, title: "Follow meal plan", detail: "Regular meal times, half a plate of vegetables", dueIso: null, status: "Completed" },
    { id: `${prefix}-3`, title: "Walk regularly", detail: "30 minutes on most days", dueIso: null, status: "Completed" },
    { id: `${prefix}-4`, title: "Complete ophthalmology visit", detail: "Annual eye examination", dueIso: "2026-09-28", status: "Not started" },
    { id: `${prefix}-5`, title: "Share latest blood test", detail: "Upload or bring the report", dueIso: "2026-10-01", status: "In progress" },
  ];
}
