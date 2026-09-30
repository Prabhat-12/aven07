import { AlertCircle, CalendarClock, Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LOST } from "@/lib/patient-types";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const lost = status === STATUS_LOST;
  const tone = lost
    ? "bg-critical-surface text-critical"
    : status === "Due this week"
      ? "bg-warning-surface text-warning"
      : status === "Completed" || status === "Confirmed" ? "bg-success-surface text-success" : "bg-secondary text-muted-foreground";
  const Icon = lost ? AlertCircle : status === "Due this week" ? CalendarClock : status === "Completed" || status === "Confirmed" ? Check : Circle;
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold", tone, className)}><Icon className="size-3" />{status}</span>;
}
