import { supabase } from "@/integrations/supabase/client";
import type { CareTask, CheckIn } from "./care-loop";
import { formatIso } from "./patient-types";

export type MyCare = {
  patient: { id: string; name: string; follow_up_date: string | null; follow_up_status: string; appointment_status: string } | null;
  tasks: CareTask[]; checkins: CheckIn[]; notes: { id: string; author_name: string; note_date: string; text: string }[];
};

// Patients read only their own rows; database rules enforce this.
export async function loadMyCare(): Promise<MyCare> {
  const [p, n, t, c] = await Promise.all([
    supabase.from("patients").select("id, name, follow_up_date, follow_up_status, appointment_status").maybeSingle(),
    supabase.from("patient_notes").select("id, author_name, note_date, text").order("note_date", { ascending: false }),
    supabase.from("care_tasks").select("*").order("due_date", { ascending: true, nullsFirst: true }),
    supabase.from("patient_checkins").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    patient: p.data, notes: n.data ?? [],
    tasks: (t.data ?? []).map((x) => ({ id: x.id, title: x.title, detail: x.detail, dueIso: x.due_date, status: x.status })),
    checkins: (c.data ?? []).map((x) => ({ id: x.id, status: x.status, message: x.message, date: formatIso(x.created_at.slice(0, 10)) })),
  };
}

export async function setTaskStatus(id: string, status: string) {
  const { error } = await supabase.from("care_tasks").update({ status, completed_at: status === "Completed" ? new Date().toISOString() : null }).eq("id", id);
  if (error) throw error;
}

export async function submitCheckIn(patientId: string, status: string, message: string) {
  const { error } = await supabase.from("patient_checkins").insert({ patient_id: patientId, status, message });
  if (error) throw error;
}
