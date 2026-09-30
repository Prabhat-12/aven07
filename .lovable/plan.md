# Avenn-wide brand refresh

## Goal and boundaries
Bring the existing doctor, patient, receptionist, sign-in, onboarding and guest screens into one calm Avenn visual system. This is a **visual refinement, not a rebuild**: retain current navigation, information hierarchy, copy, flows, data, role permissions and working controls. Treat the supplied dashboard image as a reference for density, typography, subtle borders and alignment—not as a screen to reproduce. In particular, do not bring back elements that were previously removed simply because they appear in the reference.

## Visual language to apply

| Role | Guideline value | Application |
| --- | --- | --- |
| Brand lime | `#D8F51A` | Rare, high-value accents: primary actions, small active indicators and progress. Dark `#111714` text on lime. Never a page-wide fill. |
| Soft lime | `#EEF8C4` | Selected navigation/filters, active rows and positive highlights. |
| Very soft lime | `#F7FBE8` | Low-emphasis callouts, empty states and contextual sections. |
| App canvas | `#F8FAF7` | Main workspace background. |
| White surface | `#FFFFFF` | Tables, panels, dialogs and forms. |
| Secondary surface | `#F3F6F1` | Input areas, quiet groupings and table headers. |
| Border | `#E1E7E0` | Quiet 1px dividers and control outlines. |
| Primary text | `#111714` | Titles, names and clinical values. |
| Secondary / muted text | `#59635D` / `#87908A` | Supporting descriptions / timestamps and placeholders; check small text contrast before use. |

Keep the overall balance approximately **70–80% neutral, 10–15% soft tints and 5–10% strong accent**. These are working UI values from the guideline, not a claim about official corporate specifications. Blue remains only for information (`#EAF1F7` surface, `#45677F` text), not the brand. Keep separate clinical states: success `#E5F5D9` / `#378A3A`, warning `#FFF2D5` / `#A66A00`, critical `#FDE8E7` / `#C9362F`. Never turn warnings or lost-to-follow-up red into brand green. Pair every state with readable wording or an icon.

Preserve the existing **DM Sans** workspace typeface and the current onboarding **Sora / Manrope** hierarchy rather than introducing another font. Align sizing to the guideline: page titles 24–32px, section titles 18–20px, body 14–16px, and clinical numbers 24–32px where space permits. Use a 4px-based spacing rhythm (notably 16px inside controls, 20–24px in framed content, 24–32px between sections). Use subtle borders before shadows; a very light neutral shadow only for elevated surfaces. Apply 8–10px to buttons/navigation, 6–8px to small inputs, and restrained radii on panels; status chips may remain pill-shaped. Use the existing outlined icon family consistently.

## Rollout by screen

1. **Shared foundation.** Remap semantic colors, states, radius and shadows in the global design system; update the shared button, input, status-badge, tabs/dialog and panel treatments. Audit overrides that bypass shared tokens—including blue-tinted metric utilities, the decorative summary background, colored text and one-off emergency/warning styling—so a global palette swap does not make critical states ambiguous. Map the existing `navy` naming to the new near-black appearance without a broad component rename. No new dark-mode redesign is implied; if a dark theme is present, verify its contrast rather than letting light tokens leak into it.
2. **Doctor workspace.** Carry the reference's quiet sidebar, compact top controls, clear patient heading, underline tabs, restrained white surfaces, internal dividers and strong clinical values into the existing dashboard, patient overview, follow-ups, investigations and messages. Change the active navigation to soft lime with dark text and a small stronger indicator; keep inactive navigation neutral. Keep charts legible with neutral axes/grid, one restrained green data line and semantic color only for a medically meaningful exception. Remove gradient metric backgrounds and colored icon circles where they merely decorate. Keep lists/tables scannable rather than turning each row into a tinted card.
3. **Patient workspace.** Apply the same canvas, typography, controls and state colors with more breathing room and touch-friendly targets. Make next steps and progress easy to scan using limited lime; use warning and critical colors for due or unsafe conditions. Keep warning-sign wording and emergency action intact, visually distinct from a normal brand CTA. Keep Home / My care / Appointments / Notes as they are.
4. **Reception workspace.** Use the shared palette for the schedule, summary, search, filters, rows, menus and operational dialogs. Make dates, names and actionable statuses clear without introducing clinical details or linking into a doctor's record. Use semantic warning/critical status styling for due and lost follow-ups; keep neutral rows neutral.
5. **Entry and guest journey.** Remove the separate blue-tinted `entry-surface` palette so sign-in, sign-up, two-step onboarding and guest selection feel like the same product. Retain the existing split composition on larger screens and stacked composition on mobile; keep a single obvious primary action per step, understated step progress, clear field labels and soft lime focus treatment. The guest banner and role selector adopt the new tokens, but guest-only role switching and isolation remain unchanged.

## Technical implementation notes

- Centralize the supplied values as semantic design tokens in `src/styles.css`, expressed in the current OKLCH token format with the guideline's hex colors as the visual targets; avoid hardcoded colors inside screen components. Give success, warning, critical and information their own tokens. Tune shared component variants first, then remove only conflicting local overrides.
- Preserve the current TanStack routes and component behavior. No schema, authorization, patient data, content or service changes are part of this refresh.
- Replace decorative gradients, glass/blur, heavy shadows, oversized rounding and unnecessary colored icon backgrounds only where they appear in the existing screens. Preserve useful framing rather than flattening every tool. Keep responsive layout and progressive disclosure intact.

## Review and acceptance

- Compare current and refreshed screenshots at desktop and mobile for every doctor section, patient tab, receptionist view and auth/onboarding/guest step. Use the uploaded reference as a visual quality benchmark, not as source artwork or a request for its exact layout.
- Inspect primary/secondary buttons, selection, keyboard focus, disabled/loading/error states, search, dialogs, tables, charts and all status labels. Check contrast and legibility of small helper text, lime controls, red warnings and charts; state must not be communicated by color alone.
- Exercise guest flows for all three roles and the public entry/onboarding path to confirm visual changes did not alter actions or leak real clinic data. Check the live preview's build/runtime signals. Real-account role testing remains separately blocked if confirmed sign-in is unavailable; do not claim it was verified without a session.
- Finish only when the interface reads mostly neutral and consistently Avenn across roles—not blue-heavy, neon, gradient-heavy or overly shadowed.