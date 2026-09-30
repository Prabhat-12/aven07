ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS appointment_status text NOT NULL DEFAULT 'Scheduled';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS appointment_time text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS contact_phone text;

CREATE TABLE public.care_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  due_date date,
  status text NOT NULL DEFAULT 'Not started',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.care_tasks TO authenticated;
GRANT UPDATE (status, completed_at) ON public.care_tasks TO authenticated;
GRANT ALL ON public.care_tasks TO service_role;
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors read care tasks" ON public.care_tasks FOR SELECT TO authenticated USING (public.is_doctor_of(patient_id));
CREATE POLICY "Doctors add care tasks" ON public.care_tasks FOR INSERT TO authenticated WITH CHECK (public.is_doctor_of(patient_id));
CREATE POLICY "Doctors update care tasks" ON public.care_tasks FOR UPDATE TO authenticated USING (public.is_doctor_of(patient_id)) WITH CHECK (public.is_doctor_of(patient_id));
CREATE POLICY "Patients read own care tasks" ON public.care_tasks FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = care_tasks.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Patients update own task status" ON public.care_tasks FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = care_tasks.patient_id AND p.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = care_tasks.patient_id AND p.user_id = auth.uid()));

CREATE TABLE public.patient_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  status text NOT NULL,
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.patient_checkins TO authenticated;
GRANT ALL ON public.patient_checkins TO service_role;
ALTER TABLE public.patient_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients add own check-ins" ON public.patient_checkins FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_checkins.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Patients read own check-ins" ON public.patient_checkins FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_checkins.patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors read check-ins" ON public.patient_checkins FOR SELECT TO authenticated USING (public.is_doctor_of(patient_id));