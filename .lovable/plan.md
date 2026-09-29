# Avenn signup, onboarding and guest experience

## Goal
A judge can enter Avenn without a clinic identity, experience both onboarding steps for any of the three roles, and explore a populated, interactive workspace. Real account setup remains secure and separate.

## What the current screen tells us
- The patient form requires a clinic UHID and phone to match the **same existing record**. The screenshot shows `AS-445`, while the bundled example patient record uses a different UHID; improving formatting tolerance alone cannot make an unrelated identifier match.
- Sign-in is currently a compact centered form, and the two onboarding steps use a centered panel. No guest route or guest dataset exists. Real records are restricted by account and role.

## Experience to build
1. **A clear fork at entry.** Keep email/Google sign-in and account creation for real users. Add a prominent **Explore as guest** action on the same screen. Explain that the guest tour uses fictional sample information and needs no account or email confirmation. An existing signed-in user can still return to their own workspace.
2. **Guest onboarding, same two-step journey.** Step 1 lets guests choose Doctor, Receptionist or Patient. Step 2 shows the matching role-specific form with **pre-filled, fictional sample details** modeled on the existing seeded examples; a persistent “Guest preview” label makes it clear these are not their own records. Guests can inspect/edit the example fields and proceed without submitting them to clinic matching. Provide Back, switch role and exit-to-sign-in actions. Do not publicly reveal a real claimable UHID/phone pair from the live database.
3. **Interactive, isolated role previews.** Doctor sees populated dashboard, patients, follow-ups, investigations and messages; receptionist sees only names and follow-up schedules; patient sees their own sample guidance, appointments and shared sample notes. Controls work against in-memory/session-scoped demo data only, with explicit demo feedback where an external action cannot actually occur. No guest write reaches the database, no real patient record is linked, and guest state resets on exit/reload. Make it easy to switch roles without starting over.
4. **Recover from a real mismatch.** Keep the real patient claim check and useful inline field error. When identifiers do not match, offer two routes: correct the clinic details, or **Explore as guest**. Never convert an unmatched person into a real patient account or automatically grant clinical access.
5. **Refine the visual journey.** Use the selected **Open trust panel** composition consistently for sign-in/sign-up and both onboarding steps: approximately 40/60 split at desktop, restrained contextual Avenn panel at left, generous form area at right; stack into a focused single-column flow on mobile. Apply the selected clinical palette (`#F7FBFD`, `#DFEAF0`, `#1C3542`, `#4C91A8`) and **Sora headings / Manrope body** to these screens via semantic tokens. Use slender borders, shallow shadows, small radii, clear progress, deliberate field grouping, refined focus/error states and subtle motion. Draw from the references’ spacing and finesse, not their brands, fake endorsements, or the prototype’s unrelated colors/fonts.

## Technical approach
- Keep guest routing outside the authenticated route group. Use a separate client-side demo fixture and state layer, with no privileged backend request or guest database role. Adapt existing role screens to use the demo layer for guest mode rather than routing guest actions through real save functions. Preserve the existing authenticated role boundaries and database policies.
- Use distinct synthetic identifiers in public demo fixtures that cannot claim existing live records. Retain real onboarding's server-side verification. Keep the guest badge/exit controls visible in role previews and prevent any public path from invoking privileged writes.
- Verify desktop and mobile sign-in, all six guest onboarding states (three choices × two steps), all three populated role previews, editing/filtering and reset behavior; test that unauthenticated guest requests cannot read clinical tables or write records, that mismatched real details still cannot claim a record, and that signed-in users keep their original route and data.

## Boundaries
No auto-confirm change, shared test credentials, new guest account, email requirement for guest access, or exposure of real patient clinical data. Actual medical or message delivery remains outside this change.
