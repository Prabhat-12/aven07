# Avenn Dashboard Visual Refresh

## Goal
Bring the existing dashboard into the same visual family as the supplied pitch deck without changing any content, page structure, navigation, data, or interactions.

## Design interpretation

### Color system
The deck is built around five recurring colors:

- **Warm ivory — `#F8F8ED`**: primary page background and light content canvas.
- **Soft stone — `#E8E7DE`**: secondary surfaces, table headers, inactive controls, and quiet dividers.
- **Near-black green — `#191D15`**: primary text, navigation, strong buttons, and dark emphasis areas.
- **Electric lime — `#DCEF5B`**: primary brand accent, selected states, key actions, chart emphasis, and focused highlights.
- **Powder blue — `#B9CFD6`**: supporting information surfaces and calm data-summary areas.

A pale lime tint close to `#F1F5C1` will support subtle selected and highlighted states. Existing red, amber, and green status colors will remain only where they communicate clinical or workflow meaning; they will be softened to sit naturally beside the deck palette.

### Typography
The exact font cannot be confirmed from raster images, but the deck uses a clean, contemporary neo-grotesk with open spacing and bold editorial headlines. Use **Manrope** as the closest web-safe visual match, replacing DM Sans throughout.

Recommended dashboard scale:

- Patient and page titles: **30–32px**, weight 600
- Dashboard greeting: **28–30px**, weight 600
- Metric values: **26–30px**, weight 600
- Section titles: **16–18px**, weight 600
- Card titles and controls: **14px**, weight 500–600
- Body and table content: **14px**, weight 400–500
- Supporting labels and dates: **12px**, weight 500

Mobile sizes will step down modestly while preserving the hierarchy. Letter spacing will remain neutral rather than compressed.

## Planned updates

### 1. Replace the visual tokens
- Update the shared background, foreground, surface, border, primary, secondary, muted, accent, sidebar, overlay, and shadow tokens to the deck palette.
- Remove the current blue-first appearance and make lime the intentional interaction color.
- Use ivory and stone instead of pure white for most surfaces, with near-black green for high-contrast anchors.
- Keep all color usage semantic so the dashboard remains consistent across every page and dialog.

### 2. Apply the new typography system
- Load Manrope through the existing document-head font setup.
- Update the shared font token and rebalance title, metric, section, body, label, button, and table sizing.
- Reduce unnecessary boldness in dense areas while increasing the scale of important values and page headings.
- Preserve current wording and information density.

### 3. Restyle shared dashboard surfaces
- Refresh the sidebar, top bar, patient banner, tabs, summary tiles, cards, tables, sheets, dialogs, form fields, filters, and notification states.
- Shift large primary actions to near-black green with lime emphasis, following the deck’s dark-and-lime pairing.
- Use powder blue selectively for overview and information areas rather than across every card.
- Simplify shadows and borders so surfaces feel flatter and more editorial, matching the deck.
- Keep existing shapes and layout dimensions unless a minor visual adjustment is needed to prevent text wrapping after the type change.

### 4. Harmonize charts and clinical states
- Recolor chart lines, fills, comparison bars, target ranges, and selected filters using lime, powder blue, stone, and near-black.
- Preserve warning and out-of-range meaning with accessible semantic colors; lime will not replace warning or error states.
- Check text and controls against accessibility contrast requirements, especially lime-on-ivory combinations.

### 5. Apply consistently across all existing screens
- Dashboard
- Patients and all patient tabs
- Follow-ups
- Investigations views still reachable from patient records
- Messages
- All drawers, dialogs, notifications, search results, mobile navigation, and fixed mobile actions

No labels, data, cards, rows, workflows, or navigation destinations will be added, removed, or rewritten.

## Verification
- Compare every screen against the shared palette and type scale to prevent leftover blue-first styling.
- Check desktop and mobile views for truncation, wrapping, overlap, and readable table/card density.
- Exercise the primary navigation, patient switching, filters, expandable investigations, messages, and dialogs to confirm this remains a visual-only update.
- Confirm each page renders without build, runtime, or console errors.

## Assumption
Because the uploaded images do not contain editable font metadata, Manrope is the proposed closest match. If the original deck font is later provided, it can replace Manrope without changing this plan.
