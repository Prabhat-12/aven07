# Plan: Apply endocrinologist feedback to the Avenn dashboard

No changes are made yet. This is a review of what was discussed and a proposal for how to act on it. Approve to start building.

## What was discussed (summary)

1. Status wording: "Overdue" and "Pending" overlap clinically. Use "Lost to Follow-up" (red box) and "Upcoming".
2. Messaging: keep it in the app (privacy, time-bound). Add an off-hours emergency option that reaches a doctor directly. Patient side shows warning signs and "Please consult your doctor immediately."
3. Patient metrics: trends matter more than single values.
4. Prescriptions, tasks, notes: show medications on hover, use three broad tasks, keep private doctor notes.
5. Roles: receptionist sees only name and follow-up schedule. Patient side gets education content.
6. AI: no AI bot for doctors. Automate follow-ups only.
7. Alerts: red dot/count on tabs instead of a bell.

## Decisions already final (build first)

- Overdue becomes "Lost to Follow-up" (red), Pending becomes "Upcoming".
- Remove target ranges from the doctor view.
- "Retinal screening" becomes "Ophthalmology Consult".
- Tasks limited to: Regular Follow-up, Lifestyle Modification, Continuous Glucose Monitoring (CGM).
- No AI bot; automation only for follow-ups.
- Receptionist view: name and follow-up schedule only.

## Proposed changes, mapped to the current app

### A. Follow-ups page and status
- Rename statuses everywhere: filter tabs, tiles, table badges, dashboard "needs attention", notifications, patient header, and the Neha task "Book overdue follow-up".
- Lost to Follow-up badge in a red box; Upcoming in blue.
- Tile "Overdue" becomes "Lost to follow-up".

### B. Patient overview metrics
- HbA1c: remove "Target: <7%" note; keep the trend as the hero. Range selector becomes 6 months and 1 year (drop 3 months).
- Add 2-hour post-prandial glucose next to fasting glucose.
- Doctor view: replace fasting glucose tile with eGFR (fasting glucose stays in the record).
- Cholesterol: show current value only; graph opens in a separate window.
- Serum creatinine: add a trend graph.
- Remove target notes from all tiles and the Investigations range bars/"inside/outside target" line, since the doctor knows targets. Keep previous vs latest and change.
- Rename Retinal screening to Ophthalmology Consult.

### C. Care Plan, Rx, tasks, notes
- Replace the "On Metformin" tag with an "Rx" chip; hover/tap opens a popover listing current medications.
- Tasks: the "Add task" dialog offers the three broad options instead of free text. Existing specific tasks are rewritten in those terms.
- "Next follow-up on [date]" lives inside the task section; remove the separate follow-up tab/row if one exists.
- Notes: mark as "Private doctor note" and show that it is also visible to the patient.

### D. Messaging and emergency
- Keep in-app only. Add a clear "Emergency (off-hours)" button that bypasses time limits and connects to the doctor directly.
- Show office-hours state on threads. Patient-facing preview shows warning signs plus "Please consult your doctor immediately."


### F. Role views (new)
- Add a simple role switcher (Doctor, Receptionist, Patient) as a prototype control.
- Receptionist: only patient name and follow-up schedule (no diagnosis, treatment, tests, messages of clinical content).
- Patient: Diet, Lifestyle, Exercise based on BMI, General awareness, Warning signs.

### G. Not doing
- No AI assistant on the doctor dashboard; no automation of prescriptions or tests.

## Suggested build order
1. Status terminology and red dot alerts (quick, decided).
2. Metrics, tasks, Rx popover, Ophthalmology rename, target removal.
3. Messaging emergency flow.
4. Receptionist and patient views.

## Open items
- Follow-up in the Vishist Kumar Khinchi review is pending; more feedback may follow.
- Patient education content (diet, exercise by BMI) will be placeholder text needing clinical sign-off.

## Technical details
- All edits in `src/components/avenn-dashboard.tsx` (mock data types, Metric notes, Comparison ranges, follow-up statuses, TopHeader, sidebar, MessagesPage, tasks dialog) plus new small components for the Rx popover, role views, and creatinine/cholesterol charts (Recharts).
- Role state kept in React state with a header switcher; no backend.
