# Avenn UX/UI audit against UI Rules (Aven Design)

Source: the connected UI Rules brand system: 1,027 rules (417 MUST) across Styles, Components and Accessibility, plus the brand's design tokens. I compared these against the current code for the doctor, patient, reception, sign-in, onboarding and guest screens.
Rule priority, per the brand: project rules > tokens > component rules > general style rules. Standing project rules stay in place: no clinical targets, guest data kept separate, no role switching for real users, and reception never sees clinical data.

## 1. Headline findings

| # | Finding | Severity | Where |
|---|---|---|---|
| 1 | Our color and size values don't match the brand's. Our radius is 10px (brand: 12px), our page background is lighter than the brand canvas, our cards are pure white (brand: an off-white 0.989), and we have no sidebar or chart color sets. | MUST (tokens) | the app's main stylesheet |
| 2 | Charts use our "success" status green as the data line. The brand says to use a dedicated chart palette (chart-1 to chart-5). | SHOULD | Investigations trend chart, HbA1c overview chart, cholesterol dialog |
| 3 | Fonts conflict. The brand names system fonts only. We load DM Sans, plus Manrope and Sora on the entry screens. | Decision needed | page setup, entry screens |
| 4 | There are no dark-mode colors. The brand defines a full dark theme. | Brand token set | stylesheet |
| 5 | Some plain buttons don't have full keyboard or state support. Some controls give their name only through `title` or `aria-label`, or their accessible name doesn't match the visible label. | MUST (WCAG 4.1.2 / 2.5.3) | doctor dashboard (9 plain buttons, 12 `title` uses), investigation category chips |
| 6 | Focus can be hidden behind the sticky guest bar and header. | MUST (WCAG 2.4.11) | guest bar + doctor header |
| 7 | Readable text uses faded (opacity) styles, with 40 uses to check. Small muted text may fall below 4.5:1 contrast. | MUST | dashboard, patient home, reception |
| 8 | The status chip carries meaning with text plus an icon, which is correct. But "Circle" is a generic icon, and ad-hoc status pills elsewhere don't use this shared chip. | MUST (no color alone) | status chip, reception rows, patient tasks |
| 9 | Notifications (7 uses) and loading placeholders (11 uses) are inconsistent: they are placed, labelled and announced in different ways. | MUST (Sonner/Skeleton) | across roles |
| 10 | Mobile nav overflows sideways (known issue). | MUST (Layout) | dashboard shell |

## 2. Foundation (Styles)

- **Colors (41 rules, 11 MUST):** use the brand tokens as delivered for accent, background, card, border, muted, primary and ring. Keep our own tokens (success, warning, critical, information, soft lime, quiet lime) because the brand has none of its own. Check that red, amber, green and blue each have exactly one meaning. Underline text links, such as "View clinical summary" and the sign-in / sign-up switch links.
- **Typography (29 rules):** set one type scale from the brand's text tokens (xs to 5xl). Replace the 4 hardcoded pixel text sizes. Check the uppercase labels (7 uses) against the letter-spacing and readability rules.
- **Spacing (16) / Sizing (12):** use the 4px spacing unit. Make click and tap targets at least 24px (44px on patient mobile), especially icon-only buttons and the 16 small icon boxes.
- **Radius (13, 3 MUST):** set the base radius to 12px. Remove the one-off rounding sizes in the panel, metric-card and tag styles. Keep round corners for status chips and avatars only.
- **Shadows (14):** use the brand's shadow scale (xs to 2xl). Replace our custom soft shadow. Most panels stay flat with a border.
- **Layout (16, 2 MUST):** fix the sideways overflow on mobile, and fix the offset between the sticky guest bar and the header.

## 3. Components (by screen)

**Shared shell (sidebar, header, guest bar)**
- Sidebar rules (13): switch to the brand's sidebar colors. Mark the active item with more than color (for example, the page is flagged as current and a side marker is shown).
- Tabs (17, 11 MUST): the patient workspace tabs and patient Home / My care / Appointments / Notes tabs must support arrow keys and flag the selected tab. The underline style is OK.
- Tooltip / Hover Card (the Rx popover): must open on keyboard focus, not only on hover, and must not hold essential medication information that is unreachable on touch screens.

**Doctor dashboard and patient workspace**
- Card (12, 5 MUST) / Item (7): the "Today's consultations" and "Needs attention" lists should use one list-row pattern instead of custom rows.
- Table (29, 8 MUST): the follow-ups table and the investigations "recent results" table need proper captions and column headers, right-aligned numbers, and a readable layout on mobile.
- Chart (32, 12 MUST): trend charts need an accessible text summary or table alternative (the recent-results table can serve), axis labels with units, the chart palette, and a tooltip you can reach by keyboard.
- Dialog / Sheet (26 / 13): assignment, review and cholesterol dialogs need a title, a description, focus returned when they close, and one primary action.
- Field / Input / Textarea / Select / Label (41 / 26 / 10 / 18 / 9): consultation and assignment forms need visible labels (not placeholders), help and error text linked to their field, and required fields marked.
- Empty / Skeleton (10 / 8): standardize "You're all caught up" and loading layouts.
- Badge (9): the "Rx" and count badges shouldn't be used as buttons.

**Patient**
- Checkbox (18, 8 MUST): "Mark next step complete" needs a real checkbox with a label and a larger tap target.
- Radio Group (31, 11 MUST): the check-in choices (On track / Some difficulty / Haven't been able to) should be a grouped set of choices with a heading.
- Progress (13): "3 of 5" needs a text value and an accessible label.
- Alert (21, 5 MUST): the warning signs and emergency panel should use the critical alert style, visibly different from the main brand button.

**Receptionist**
- Dropdown Menu (22, 9 MUST): row actions (Confirm, Reschedule, Arrived, No-show) need keyboard support, clear action names, and a confirmation step for no-show.
- Alert Dialog (20, 11 MUST): destructive or irreversible changes should use a confirmation dialog.
- Sonner (17, 9 MUST): action feedback must be announced to screen readers and must not be the only record of what happened.

**Sign-in, onboarding, guest**
- Field / Input OTP / Button (30, 11 MUST): one primary button per step. Loading and disabled states on submit. Errors shown inline under the field, not only in a notification.
- Step progress: announce "Step 1 of 2" to screen readers. The decorative preview card is already hidden from them, which is correct.
- Buttons: one clear action per group. The guest bar's Details / Switch role / Exit use secondary styling.

## 4. Accessibility (47 rules, 34 MUST)
Contrast of 4.5:1 for text and 3:1 for controls, including dark text on lime and placeholder text. No meaning carried by color alone. Full keyboard use with no traps. Visible focus that isn't hidden. Focus returned when dialogs close. Clear control names and roles. Error messages linked to their fields. Motion respects the reduced-motion setting (already in place).

## 5. Proposed rollout (after approval)
1. **Tokens:** add the brand stylesheet while keeping our clinical status tokens, then verify it against the brand. Needs your font decision (see below).
2. **Accessibility MUSTs:** fix names, keyboard support, focus handling and contrast across all screens.
3. **Shared components:** tabs, dialogs, fields, the status chip, notifications, loading placeholders and empty states.
4. **Screen passes:** Doctor, then Patient, then Receptionist, then Entry and guest. Each pass is checked on desktop and mobile in guest preview.
5. **Compliance check:** run the brand's compliance check and report any rules we don't follow.

No workflow, data, access or copy-meaning changes. Copy gets only small wording fixes where the rules require them (button labels, error messages).

## Open decisions
- **Fonts:** keep DM Sans (and Manrope/Sora on entry screens), or switch to the brand's system fonts?
- **Dark mode:** add the brand's dark theme now, or later?
- **Report format:** is this plan enough, or do you also want a downloadable PDF of the audit?

## Technical details
- Tokens: replace the `:root` values and the font, radius, shadow and text settings in the main stylesheet with the brand's compiled blocks. Add `--chart-1..5` and `--sidebar-*` and connect them in the `@theme` block. Re-add our own success, warning, critical, information, soft lime, quiet lime and brand ink tokens after the brand blocks, then run the brand's stylesheet check until it passes.
- `components.json` (the setup file for the shared component kit) exists, but the brand has none recorded. Record it in UI Rules, then compare the two.
- Hotspots: the doctor dashboard (452 lines), patient home, reception view, investigation trends view, status chip, auth, onboarding and guest screens, and the shared button, input, tabs and dialog components.
