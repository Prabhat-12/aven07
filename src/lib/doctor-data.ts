import { supabase } from "@/integrations/supabase/client";
import ashaImage from "@/assets/asha-sharma.jpg";
import { followUpStatusFor, formatIso, type Comparison, type Metric, type Patient, type Point } from "./patient-types";

const images: Record<string, string> = { asha: ashaImage };

export async function loadDoctorPatients(): Promise<Patient[]> {
  const [patientsRes, notesRes] = await Promise.all([
    supabase.from("patients").select("*, patient_clinical(*)"),
    supabase.from("patient_notes").select("*").order("note_date", { ascending: false }),
  ]);
  if (patientsRes.error) throw patientsRes.error;
  const notes = notesRes.data ?? [];
  const list: Patient[] = [];
  for (const row of patientsRes.data ?? []) {
    const clinical = Array.isArray(row.patient_clinical) ? row.patient_clinical[0] : row.patient_clinical;
    if (!clinical) continue;
    const data = (clinical.data ?? {}) as Record<string, unknown>;
    list.push({
      dbId: row.id, name: row.name, id: clinical.uhid, phone: clinical.phone, age: clinical.age, gender: clinical.gender,
      condition: clinical.condition, image: row.image_key ? images[row.image_key] : undefined, tags: clinical.tags,
      slot: String(data["slot"] ?? ""), followUp: formatIso(row.follow_up_date), followUpIso: row.follow_up_date ?? "",
      followUpStatus: row.follow_up_status, summary: clinical.summary,
      metrics: (data["metrics"] as Metric[]) ?? [], trend: (data["trend"] as Point[]) ?? [],
      creatTrend: (data["creatTrend"] as Point[]) ?? [],
      cholesterol: (data["cholesterol"] as Patient["cholesterol"]) ?? { value: 0, date: "", trend: [] },
      comparisons: (data["comparisons"] as Comparison[]) ?? [], tasks: (data["tasks"] as Patient["tasks"]) ?? [],
      medications: (data["medications"] as Patient["medications"]) ?? [],
      activities: (data["activities"] as Patient["activities"]) ?? [], visits: (data["visits"] as Patient["visits"]) ?? [],
      notes: notes.filter((n) => n.patient_id === row.id).map((n) => ({ id: n.id, date: formatIso(n.note_date), author: n.author_name, text: n.text })),
      rawData: data,
    });
  }
  return list.sort((a, b) => a.slot.localeCompare(b.slot));
}

export async function saveFollowUp(patientId: string, iso: string) {
  const { error } = await supabase.from("patients").update({ follow_up_date: iso, follow_up_status: followUpStatusFor(iso) }).eq("id", patientId);
  if (error) throw error;
}

export async function saveClinicalPatch(patient: Patient, patch: Record<string, unknown>) {
  const next = { ...patient.rawData, ...patch };
  patient.rawData = next;
  const { error } = await supabase.from("patient_clinical").update({ data: next as never }).eq("patient_id", patient.dbId);
  if (error) throw error;
}

export async function addPatientNote(patientId: string, author: string, text: string) {
  const { error } = await supabase.from("patient_notes").insert({ patient_id: patientId, author_name: author, text });
  if (error) throw error;
}
