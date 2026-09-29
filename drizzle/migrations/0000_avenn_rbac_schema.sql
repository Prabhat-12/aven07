CREATE TYPE public.app_role AS ENUM ('doctor', 'receptionist', 'patient');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  specialty text,
  clinic text,
  dob date,
  height_cm numeric,
  weight_kg numeric,
  doctor_id uuid,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (approved) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_key text,
  follow_up_date date,
  follow_up_status text NOT NULL DEFAULT 'Upcoming',
  doctor_id uuid,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.patients TO authenticated;
GRANT UPDATE (follow_up_date, follow_up_status) ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.patient_clinical (
  patient_id uuid PRIMARY KEY REFERENCES public.patients(id) ON DELETE CASCADE,
  uhid text NOT NULL UNIQUE,
  phone text NOT NULL,
  age int NOT NULL,
  gender text NOT NULL,
  condition text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  summary text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.patient_clinical TO authenticated;
GRANT UPDATE (data, summary, tags) ON public.patient_clinical TO authenticated;
GRANT ALL ON public.patient_clinical TO service_role;
ALTER TABLE public.patient_clinical ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.patient_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  note_date date NOT NULL DEFAULT current_date,
  text text NOT NULL,
  shared boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.patient_notes TO authenticated;
GRANT ALL ON public.patient_notes TO service_role;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_role text,
  patient_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_doctor_of(_patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = _patient_id AND p.doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor')
  )
$$;

CREATE OR REPLACE FUNCTION public.receptionist_doctor(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.doctor_id FROM public.profiles pr
  WHERE pr.id = _user_id AND pr.approved = true AND public.has_role(_user_id, 'receptionist')
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Doctors read their receptionists" ON public.profiles FOR SELECT TO authenticated
  USING (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Doctors approve their receptionists" ON public.profiles FOR UPDATE TO authenticated
  USING (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor') AND id <> auth.uid())
  WITH CHECK (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor') AND id <> auth.uid());

CREATE POLICY "Doctors read own patients" ON public.patients FOR SELECT TO authenticated
  USING (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Approved receptionists read schedule" ON public.patients FOR SELECT TO authenticated
  USING (doctor_id IS NOT NULL AND doctor_id = public.receptionist_doctor(auth.uid()));
CREATE POLICY "Patients read own row" ON public.patients FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Doctors update follow-up" ON public.patients FOR UPDATE TO authenticated
  USING (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'))
  WITH CHECK (doctor_id = auth.uid() AND public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Receptionists update follow-up" ON public.patients FOR UPDATE TO authenticated
  USING (doctor_id IS NOT NULL AND doctor_id = public.receptionist_doctor(auth.uid()))
  WITH CHECK (doctor_id IS NOT NULL AND doctor_id = public.receptionist_doctor(auth.uid()));

CREATE POLICY "Doctors read clinical data" ON public.patient_clinical FOR SELECT TO authenticated
  USING (public.is_doctor_of(patient_id));
CREATE POLICY "Doctors update clinical data" ON public.patient_clinical FOR UPDATE TO authenticated
  USING (public.is_doctor_of(patient_id)) WITH CHECK (public.is_doctor_of(patient_id));

CREATE POLICY "Doctors read notes" ON public.patient_notes FOR SELECT TO authenticated
  USING (public.is_doctor_of(patient_id));
CREATE POLICY "Patients read shared notes" ON public.patient_notes FOR SELECT TO authenticated
  USING (shared = true AND EXISTS (SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));
CREATE POLICY "Doctors add notes" ON public.patient_notes FOR INSERT TO authenticated
  WITH CHECK (public.is_doctor_of(patient_id));
CREATE POLICY "Doctors edit notes" ON public.patient_notes FOR UPDATE TO authenticated
  USING (public.is_doctor_of(patient_id)) WITH CHECK (public.is_doctor_of(patient_id));

CREATE POLICY "Doctors read audit log" ON public.audit_log FOR SELECT TO authenticated
  USING (patient_id IS NOT NULL AND public.is_doctor_of(patient_id));

CREATE OR REPLACE FUNCTION public.log_followup_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r text;
BEGIN
  IF NEW.follow_up_date IS DISTINCT FROM OLD.follow_up_date OR NEW.follow_up_status IS DISTINCT FROM OLD.follow_up_status THEN
    SELECT role::text INTO r FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
    INSERT INTO public.audit_log (actor_id, actor_role, patient_id, action, details)
    VALUES (auth.uid(), r, NEW.id, 'follow_up_changed',
      jsonb_build_object('from', OLD.follow_up_date, 'to', NEW.follow_up_date, 'status', NEW.follow_up_status));
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER patients_followup_audit AFTER UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.log_followup_change();

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_doctor_of(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.receptionist_doctor(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_followup_change() FROM anon, authenticated;