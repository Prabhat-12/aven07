# Avenn Doctor Patient Dashboard

## Goal
Build the supplied Avenn patient workspace as a polished, responsive, fully interactive prototype using realistic mock data. The uploaded dashboard image is the visual reference; the PRD is the product and content source of truth.

## What will be built

### Patient workspace shell
- Fixed desktop sidebar with Avenn navigation, active Patients state, and lower Settings/Profile actions.
- Clean top bar with patient search, date control, notifications, and Dr. Priya Sharma’s profile.
- Patient context header for Asha Sharma with avatar, identifiers, concise tags, and the two required doctor actions.
- Responsive behavior: compact tablet navigation, 2×2 metrics, and a single-column mobile view with persistent primary actions.

### Overview
- Four key-information tiles for HbA1c, fasting glucose, weight, and blood pressure.
- Interactive HbA1c chart with the required time-range selector and mock history.
- Latest investigations, open tasks, recent activity, and patient summary in the hierarchy shown by the reference.
- Clickable metrics, investigations, tasks, and activity items opening focused detail drawers.
- Clinical values will be presented without automated diagnoses, risks, or treatment recommendations.

### Patient sections
- Working in-page patient navigation for Overview, Recent Activity, Investigations, Care Plan, Previous Visits, and Notes.
- Investigations filtering and assignment, including result history details.
- Care Plan management for medications, patient tasks, investigations, and follow-up.
- Previous consultation history with visit detail views.
- Notes list with add and edit interactions.

### Doctor workflows
- Doctor-controlled follow-up modal with date, reason, notes, and saved date reflected beside Start Consultation.
- Multi-step consultation flow covering patient context, clinical notes, assessment, plan, care-plan actions, and completion.
- Add/edit/discontinue medication, add task, assign investigation, and add/edit note controls using local prototype state.
- Search across mock patients by name, phone, or UHID, with patient selection updating the workspace.

## Visual direction
- Faithfully reproduce the supplied light, airy healthcare aesthetic: pale blue canvas, white content surfaces, restrained frosted-glass context areas, navy typography, and blue interaction states.
- Use the PRD’s color values as semantic design tokens, clean sans-serif typography, subtle shadows, thin borders, and restrained motion.
- Use the uploaded screenshot only as design reference, not as an embedded image.
- Maintain accessible contrast, keyboard focus, clear icon labels/tooltips, and no color-only clinical meaning.

## Technical approach
- Replace the current blank `/` screen with the complete prototype and add route-specific title, description, Open Graph, and social metadata.
- Structure the interface into reusable shell, dashboard, chart, modal, drawer, and consultation components.
- Use Recharts for the clinical trend and the existing icon/UI libraries for controls.
- Keep all prototype information in typed mock data and React state; no database, login, or external services are required for this MVP.
- Verify the main workflows and inspect the finished layout at desktop and mobile sizes, then resolve any build or runtime errors.
