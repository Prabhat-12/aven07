# Avenn UX completion

## Doctor dashboard presentation feedback
- [x] Left-align task and investigation rows, with details beneath titles and status at the far edge
- [x] Span the doctor guest banner across the page with Avenn below it
- [x] Remove metric tile edge accents across doctor pages
- [x] Replace tinted care-plan rows with subtle separators
- [x] Remove the Care loop section from patient overview

## Doctor investigation trends (approved)
- [x] Replace comparison cards with selectable trend charts, dated results, and investigation list
- [x] Add isolated fictional guest histories; keep signed-in readings factual and target-free
- [x] Verify category, range, pending, assignment and overview journeys on desktop and mobile (guest preview)

## Avenn-wide brand refresh (approved)
- [x] Map lime/neutral and separate clinical-state tokens into shared styling
- [x] Refine doctor, patient, receptionist, entry and guest visual treatments
- [x] Check desktop/mobile guest views and interaction states; confirm preview health

- [x] Audit existing navigation and controls
- [x] Add a practice dashboard
- [x] Add the follow-ups queue and assignment flow
- [x] Add the investigations queue and review flow
- [x] Add patient messaging and sending
- [x] Connect primary navigation, notifications, profile, and patient actions
- [x] Verify desktop journeys and build health
- [x] Verify compact-screen navigation and page layout

# Endocrinologist feedback (approved plan)
- [ ] A. Status terminology (Lost to Follow-up / Upcoming)
- [ ] B. Metrics: remove targets, HbA1c 6m/1y, PPG, eGFR, creatinine graph, cholesterol graph window, Ophthalmology Consult
- [ ] C. Rx popover, 3 broad tasks, next follow-up in tasks, private note label
- [ ] D. Messaging office-hours + emergency
- [ ] F. Cloud auth, onboarding, roles (doctor/receptionist/patient), RLS-protected data, receptionist minimal view, patient view
- [ ] Verify each role; receptionist blocked from clinical data
(E notifications: removed from scope by user)

## Build status (endocrinologist feedback)
- [x] A. Lost to Follow-up / Upcoming everywhere (red status box)
- [x] B. 6m/1y trend only, no target ranges, eGFR tile, PPG, creatinine graph, cholesterol value + graph window, Ophthalmology Consult
- [x] C. Rx hover popup, three broad tasks, "Next follow-up on" inside tasks, private notes shared with patient
- [x] D. In-app messaging note with office hours; patient Emergency (off-hours) button + warning signs
- [x] F. Sign-up, onboarding, role-based views (doctor / receptionist / patient), data in Lovable Cloud with row-level rules
- [ ] Verify each role with real sign-ins (blocked: email confirmation needs a real inbox)

# Judge guest journey (approved)
- [x] Add safe, isolated guest onboarding and three switchable role previews
- [x] Refine sign-in and real onboarding presentation and mismatch recovery
- [x] Verify guest flows, role isolation and mobile layout

# PRD iteration (approved plan)
- [x] Doctor: dashboard hierarchy, layered patient overview, check-ins and care tasks wired
- [x] Patient: Home / My care / Appointments / Notes with check-in
- [x] Receptionist: today's appointments, operational actions, operational-only record
- [x] Guest preview verified on desktop for all roles
- [ ] Real-role sign-in checks (blocked: email confirmation needs a real inbox)

## UI Rules audit rollout
- [x] 1. Brand tokens applied and verified; system fonts; chart palette
- [x] 2. Accessibility MUSTs: patient check-in, tasks, progress, reception no-show confirm, labels, focus offset (doctor dashboard buttons still open)
- [ ] 3. Shared components (tabs, dialogs, fields, status chip, toasts, skeletons, empty states)
- [ ] 4. Screen passes: Doctor, Patient, Receptionist, Entry/guest
- [ ] 5. Final compliance check
- [ ] Answer patient dashboard layout question without changing the agreed Home / My care / Appointments / Notes structure unless requested
