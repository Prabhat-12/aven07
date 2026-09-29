import { cn } from "@/lib/utils";
import { STATUS_LOST } from "@/lib/patient-types";

// "Lost to Follow-up" is a solid red box; other states stay calm.
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const lost = status === STATUS_LOST;
  const tone = lost
    ? "bg-red-600 text-white"
    : status === "Due this week"
      ? "bg-amber-100 text-amber-800"
      : "bg-accent text-primary";
  return <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold", tone, className)}>{status}</span>;
}
