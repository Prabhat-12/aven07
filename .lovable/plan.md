# Avenn Dashboard Color and Typography Update

## Objective
Restyle the existing Avenn dashboard to match the supplied color-system PDF and pitch deck. This is a presentation-only update: all copy, clinical data, pages, navigation, controls, and workflows remain unchanged.

## Confirmed color system

The PDF defines the following exact palette:

### Core colors
- **Page canvas:** `#F8F8ED` — warm ivory
- **Primary dark:** `#1A1D16` — deep green-black
- **Secondary dark:** `#11130F` — near-black
- **Primary text:** `#11130F`
- **Secondary text:** `#565A50`
- **Card surface:** `#E7E7DE` — warm stone
- **Elevated surface:** `#FFFFFF`
- **Muted / information surface:** `#BACFD6` — powder blue
- **Primary accent:** `#DCEF5B` — electric lime
- **Accent hover:** `#C0D446`
- **Accent pressed:** `#9EB533`

### Clinical and workflow states
- **Success:** `#59C071`
- **Warning:** `#EFC144`
- **Error:** `#E04F4F`
- **Information:** `#BACFD6`

### Intended dashboard usage
- Warm ivory becomes the main page background.
- Green-black anchors the sidebar, high-emphasis areas, and primary text.
- Lime marks selected navigation, primary actions, active filters, chart focus, and progress.
- Warm stone is used for standard cards, table headers, inactive controls, and dividers.
- White is reserved for raised elements such as dialogs, menus, search results, and important foreground panels.
- Powder blue supports informational summaries and selected secondary states.
- Status colors remain reserved for actual success, warning, error, and information meaning.

## Typography direction

The deck uses a clean modern grotesk with rounded forms, open counters, and an editorial scale. The source images do not contain editable font metadata, so the closest practical web match will be **Manrope**.

### Proposed type scale
- Main patient and page titles: **30–32px / 600**
- Dashboard greeting: **28–30px / 600**
- Large metric values: **26–30px / 600**
- Section headings: **16–18px / 600**
- Card titles and primary controls: **14px / 600**
- Body copy, tables, and form content: **14px / 400–500**
- Supporting labels, dates, and metadata: **12px / 500**

Mobile sizes will reduce modestly where needed. Letter spacing will stay neutral, with uppercase labels used sparingly as in the deck.

## Implementation plan

### 1. Replace the shared theme tokens
- Translate every PDF primitive and semantic color into the existing global design-token system.
- Replace the current blue-first theme with the confirmed ivory, green-black, lime, stone, white, and powder-blue palette.
- Define clear roles for page backgrounds, cards, elevated layers, text, borders, interaction states, and status colors.
- Keep all visual colors centralized rather than styling individual screens independently.

### 2. Update the font and hierarchy
- Load Manrope through the existing document font setup and make it the dashboard-wide typeface.
- Apply the proposed size and weight hierarchy to page titles, patient names, metrics, section headings, rows, buttons, forms, and supporting labels.
- Reduce excessive boldness in dense areas while making key values and headings more prominent.
- Preserve every word and data point currently shown.

### 3. Restyle shared interface elements
- Apply the new system to the sidebar, top bar, search, patient banner, tabs, cards, summary tiles, lists, tables, filters, buttons, forms, notifications, drawers, and dialogs.
- Use lime for intentional emphasis rather than as a large default background everywhere.
- Use the dark palette for high-emphasis buttons and navigation, with lime for active and focused states.
- Replace the current soft blue gradients with flatter stone, ivory, white, and powder-blue surfaces inspired by the deck.
- Simplify shadows and borders for the deck’s cleaner editorial feel.

### 4. Recolor charts and data visuals
- Update chart lines, fills, comparison bars, target ranges, delta indicators, and selected filters to the new palette.
- Keep warning and out-of-range states semantically distinct; lime will not replace warning or error colors.
- Ensure every text/background pairing remains readable and accessible, especially dark text on lime.

### 5. Apply across every current screen
- Dashboard
- Patients and all patient sections
- Follow-ups
- Investigations views within patient records
- Messages
- Search results, notifications, dialogs, drawers, mobile navigation, and mobile action bar

## What will not change
- No wording, labels, clinical values, mock records, counts, dates, or messages
- No cards, rows, pages, navigation items, or tabs added or removed
- No workflow or click behavior changes
- No use of the attached slides as in-app images; they remain visual references only

## Verification
- Review all current screens at desktop and mobile sizes for consistent colors and typography.
- Check for wrapping, truncation, overlap, and density changes caused by the new font and sizes.
- Exercise navigation, patient switching, filters, expandable investigations, messages, and dialogs to confirm behavior is unchanged.
- Verify accessible contrast for normal, selected, disabled, warning, and error states.
- Confirm the app has no build, runtime, or console errors.

## Assumption
Manrope is the proposed closest match because the supplied PDF defines colors but does not identify the deck font. If the original font name or font file is supplied later, it can replace Manrope without altering the rest of this plan.
