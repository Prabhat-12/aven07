# Aven UX and Feature Iteration (from the PRD)

Principle: one shared care loop, three views. Doctor decides, patient acts, receptionist coordinates. This is an iteration on the existing screens, not a rebuild. Existing names, sample data, branding and guest preview stay.

## Decisions confirmed
- New data is saved properly in the database for signed-in users, and works the same in guest preview (browser-only fictional data).
- Keep current sample patient names and doctor; follow the PRD workflow, not its names.
- Build order: Doctor, then Patient, then Receptionist.
- Visual cleanup: soften shared tokens once, then flatten only screens being touched.

## Phase 1 - Doctor
1. Dashboard: make Today's consultations the primary block; a compact "Needs attention" list (lost to follow-up, results to review, messages needing reply) that deep-links into the patient; counts become quiet tertiary text. Empty state "You're all caught up".
2. Patient workspace Overview reordered into layers: header (name, age, sex, condition, follow-up date, Start Consultation) -> Since last visit (HbA1c, weight, key investigation, patient update) -> Needs attention -> Care loop (Planned, Completed, Pending, Next) -> 3-4 recent investigations -> Previous visit summary. Full detail stays in existing tabs.
3. Patient-reported check-ins appear in Since last visit and Needs attention.
4. Consultation flow: Review -> Document -> Update care plan -> Assign tasks -> Request investigation -> Set follow-up -> Save; saving creates the operational follow-up for reception and the plan for the patient.
5. Clear separation of internal clinical notes vs patient-facing notes in the notes tab.
6. Skeleton loading and plain-language error states (what happened, whether saved, what next).

## Phase 2 - Patient
Small navigation: Home, My Care, Appointments, Notes.
- Home: greeting, next appointment with status, "Your next steps" as primary checklist with status and due date, progress preview (3 of 5), latest doctor note, existing approved warning signs unchanged.
- My Care: progress, care-action timeline, task states (Not started, In progress, Completed, Due, Overdue) with text and icon, and the check-in ("On track / Some difficulty / Haven't been able to follow it" with short explanation).
- Appointments: upcoming and previous; no reception-only metadata.
- Notes: patient-facing notes only.
- Empty state "You're up to date".

## Phase 3 - Receptionist
Keep the existing schedule and privacy statement ("names and follow-up dates only").
- Summary: due this week, upcoming, lost to follow-up, today.
- Compact Today's appointments list with operational statuses (Scheduled, Confirmed, Arrived, Waiting, Completed, No-show, Reschedule requested).
- Row actions: Confirm, Reschedule, Mark arrived, Mark no-show, Contact patient, Contact clinic team. No link to any clinical record.
- Opening a patient shows an operational record only (name, contact, appointment, status).
- Empty state "No overdue follow-ups".

## Visual pass
Soften shared radius and shadow tokens; use dividers, lists and tables instead of card grids on touched screens; pills only for statuses; no gradients or glass; status always text plus icon.

## Technical details
- Database (additive migrations with grants and RLS): `appointments` (patient, date/time, status, arrival), `care_tasks` (patient, title, status, due date, completed at; patient may update status only), `patient_checkins` (patient, status, message; patient inserts own, doctor reads own patients), plus optional `operational_notes`. Receptionist policies cover appointments only, never tasks, check-ins or clinical tables. Patient-facing vs internal notes use the existing `shared` flag on `patient_notes`; internal notes are never readable by patients.
- Follow-up changes already log via existing trigger; extend to create/update an appointment row.
- Existing tables (`patients`, `patient_clinical`, `patient_notes`) stay unchanged.
- Guest: extend `guest-data.ts` with tasks, appointments and check-ins; all writes stay in React state, never the database.
- Reuse `avenn-dashboard.tsx`, `receptionist-view.tsx`, `patient-home.tsx`; patient tabs via in-page state or small routes under `_authenticated`/guest, each with its own head metadata where routed.
- Verify each role in guest preview on desktop and mobile; real-role checks remain limited by email confirmation.

## Out of scope
Billing, pharmacy, full EMR, diagnostic or risk AI, notification centre, analytics dashboard, wellness tracker.
