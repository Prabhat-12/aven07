# Doctor investigation screen: trend-first redesign

## Goal
Make the patient’s **Investigations** tab easier to scan and compare over time, using the supplied layout as a structural reference. Keep Avenn’s current lime-and-neutral brand, patient navigation, clinical privacy rules, and existing care workflows. The screenshot is a reference, not an image to place in the app.

## What will change
1. Replace the current summary tiles, status-filter row, and stack of expandable comparison cards with a compact investigation selector and a trend-first workspace. Categories will include HbA1c, Glucose, Kidney Function, Lipids, and Others; only actual investigations for the selected patient appear in each category.
2. On desktop, place the selected investigation’s large interactive trend chart and its dated results on the left, with a concise **All investigations** list on the right. On narrow screens, stack these areas without horizontal scrolling. List rows show the latest value or pending state, a small trend when readings exist, a text-and-icon change indicator, and select the corresponding chart or pending detail.
3. Provide the existing **6 months / 1 year** range control for charts. The main panel shows the latest value, change since the prior reading, measurement dates, and a recent-results table built only from recorded points. Pending/non-numeric investigations get a clear status/detail view instead of a misleading graph; missing or single-point histories get an honest limited-data state. Remove the old before/after bars from this tab.
4. Add a short factual interpretation strip based on measured direction and available history, with a **View clinical summary** action that takes the doctor back to the patient overview. Do not generate diagnoses or clinical advice.
5. Keep the existing assignment action and dialog accessible from this screen, and leave the clinic-wide investigations queue and other role screens unchanged.

## Clinical and data rules
- **No targets**: the reference’s 7% target line, “Above target,” and range-based labels will not be copied. Show observed values, change, and pending status without asserting a universal clinical threshold.
- Guest preview: add explicitly fictional month-by-month glucose and kidney/lipid histories so judges can explore each graph. Keep them in the isolated browser-only sample data; align latest values with the existing guest record.
- Signed-in doctor: plot only readings actually present in that patient’s existing clinical data. Existing HbA1c history and any stored creatinine/cholesterol series can be used; two known comparison readings remain two points, not invented intermediate months. If only part of a selected date window exists, label the available dates honestly.
- Chart points, table values, deltas, mini-trends and interpretation must derive from the same selected investigation data. Never infer a status or result from the mockup alone.

## Technical approach
- Refactor the doctor patient-tab presentation in `avenn-dashboard.tsx` into focused trend, recent-results and investigation-list pieces, reusing the existing Recharts dependency and patient record types. Introduce a small typed adapter that maps current `trend`, `creatTrend`, `cholesterol.trend` and `comparisons` into dated series without changing stored clinical records or access rules.
- Extend only the fictional guest fixtures for additional histories. Use semantic tokens in `src/styles.css` for chart and status roles; keep selectors and actions in existing design-system controls. Keep chart labels, values, and no-data states accessible without relying on color alone.
- Check the doctor guest flow at desktop and mobile sizes: switch categories and date ranges, inspect chart/table consistency, open a pending investigation, use the assignment action and clinical-summary link, and confirm no layout or runtime errors. Check signed-in rendering when an accessible doctor session is available; otherwise report that limitation explicitly.

## Outside this change
No targets, new medical thresholds, patient/receptionist redesign, new database tables, AI interpretation, or alteration of role access.
