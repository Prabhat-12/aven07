export type Task = { title: string; note: string; done: boolean; kind?: "follow-up" };
export type Medication = { name: string; dosage: string; frequency: string; status: string };
export type Note = { id?: string; date: string; author: string; text: string };
export type Metric = { label: string; value: string; note: string; date: string; icon: string; tone: string };
export type Comparison = {
  name: string; unit: string; previous: number | null; latest: number | null; previousLabel?: string; latestLabel?: string;
  previousDate: string; latestDate: string; low: number; high: number; max: number; lowerIsBetter: boolean;
  status: string; note: string; icon: string;
};
export type Point = { month: string; value: number };
export type Patient = {
  dbId: string; name: string; id: string; phone: string; age: number; gender: string; condition: string; image?: string | undefined;
  tags: string[]; slot: string; followUp: string; followUpIso: string; followUpStatus: string; summary: string;
  metrics: Metric[]; trend: Point[]; creatTrend: Point[]; cholesterol: { value: number; date: string; trend: Point[] };
  comparisons: Comparison[]; tasks: Task[]; medications: Medication[];
  activities: { date: string; title: string; note: string }[];
  visits: { date: string; title: string; summary: string; actions: string[] }[];
  notes: Note[]; rawData: Record<string, unknown>;
  careTasks?: CareTask[]; checkins?: CheckIn[]; appointmentStatus?: string;
};
import type { CareTask, CheckIn } from "./care-loop";

export const TODAY_ISO = "2026-09-25";
export const STATUS_LOST = "Lost to Follow-up";

export function formatIso(iso: string | null | undefined) {
  if (!iso) return "Not scheduled";
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function followUpStatusFor(iso: string) {
  const diff = Math.round((new Date(`${iso}T00:00:00Z`).getTime() - new Date(`${TODAY_ISO}T00:00:00Z`).getTime()) / 86400000);
  if (diff < 0) return STATUS_LOST;
  return diff <= 7 ? "Due this week" : "Upcoming";
}
