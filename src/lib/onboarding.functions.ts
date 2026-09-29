import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("doctor"),
    fullName: z.string().trim().min(2).max(100),
    specialty: z.string().trim().min(2).max(100),
    clinic: z.string().trim().min(2).max(120),
  }),
  z.object({
    role: z.literal("receptionist"),
    fullName: z.string().trim().min(2).max(100),
    clinic: z.string().trim().min(2).max(120),
    doctorEmail: z.string().trim().email().max(255),
  }),
  z.object({
    role: z.literal("patient"),
    fullName: z.string().trim().min(2).max(100),
    uhid: z.string().trim().min(3).max(30),
    phone: z.string().trim().min(6).max(30),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    heightCm: z.number().min(50).max(250),
    weightKg: z.number().min(10).max(400),
  }),
]);

const digits = (value: string) => value.replace(/\D/g, "");

// Roles are only ever written here, on the server, once per account. The browser
// has no permission to create or change roles.
export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const email = String((context.claims as { email?: string }).email ?? "").toLowerCase();

    const existing = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
    if (existing.error) throw new Error("Could not check your account. Please try again.");
    if (existing.data.length > 0) throw new Error("This account has already been set up.");

    if (data.role === "doctor") {
      const profile = await supabaseAdmin.from("profiles").insert({
        id: userId, email, full_name: data.fullName, specialty: data.specialty, clinic: data.clinic, approved: true,
      });
      if (profile.error) throw new Error("Could not save your profile.");
      const role = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "doctor" });
      if (role.error) throw new Error("Could not save your role.");
      // The first doctor to join the clinic takes over the unassigned patient list.
      await supabaseAdmin.from("patients").update({ doctor_id: userId }).is("doctor_id", null);
      return { role: "doctor" as const };
    }

    if (data.role === "receptionist") {
      const doctor = await supabaseAdmin.from("profiles").select("id, email").ilike("email", data.doctorEmail);
      const doctorId = doctor.data?.[0]?.id;
      if (!doctorId) throw new Error("We could not find a doctor with that email. Ask your doctor to sign up first.");
      const doctorRole = await supabaseAdmin.from("user_roles").select("id").eq("user_id", doctorId).eq("role", "doctor");
      if (!doctorRole.data?.length) throw new Error("We could not find a doctor with that email. Ask your doctor to sign up first.");
      const profile = await supabaseAdmin.from("profiles").insert({
        id: userId, email, full_name: data.fullName, clinic: data.clinic, doctor_id: doctorId, approved: false,
      });
      if (profile.error) throw new Error("Could not save your profile.");
      const role = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "receptionist" });
      if (role.error) throw new Error("Could not save your role.");
      return { role: "receptionist" as const };
    }

    // patient: must match an existing record by UHID and phone number
    // Tolerate formatting differences: "sd 00421" == "SD-00421", "98765 40121" == "+91 98765 40121".
    const normUhid = (v: string) => v.replace(/[^a-z0-9]/gi, "").toUpperCase();
    const last10 = (v: string) => digits(v).slice(-10);
    const clinical = await supabaseAdmin.from("patient_clinical").select("patient_id, uhid, phone");
    if (clinical.error) throw new Error("Could not check your record. Please try again.");
    const match = clinical.data.find(
      (row) => normUhid(row.uhid) === normUhid(data.uhid) && last10(row.phone) === last10(data.phone) && last10(data.phone).length >= 10,
    );
    if (!match) throw new Error("We could not match these details to a patient record. Check your UHID and phone number.");
    const patient = await supabaseAdmin.from("patients").select("id, user_id").eq("id", match.patient_id).single();
    if (patient.error || patient.data.user_id) throw new Error("This patient record is already linked to an account.");
    const profile = await supabaseAdmin.from("profiles").insert({
      id: userId, email, full_name: data.fullName, dob: data.dob, height_cm: data.heightCm, weight_kg: data.weightKg, approved: true,
    });
    if (profile.error) throw new Error("Could not save your profile.");
    const role = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "patient" });
    if (role.error) throw new Error("Could not save your role.");
    await supabaseAdmin.from("patients").update({ user_id: userId }).eq("id", match.patient_id);
    return { role: "patient" as const };
  });
