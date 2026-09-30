import { AlertCircle, CalendarClock, CalendarDays, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LOST } from "@/lib/patient-types";

// Status meaning is carried by text + icon, never color alone.
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const lost = status === STATUS_LOST;
  const done = status === "Completed" || status === "Confirmed";
  const tone = lost
    ? "bg-critical-surface text-critical"
    : status === "Due this week"
      ? "bg-warning-surface text-warning"
      : done ? "bg-success-surface text-success" : "bg-secondary text-foreground";
  const Icon = lost ? AlertCircle : status === "Due this week" ? CalendarClock : done ? Check : CalendarDays;
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold", tone, className)}><Icon className="size-3" aria-hidden="true" />{status}</span>;
}
