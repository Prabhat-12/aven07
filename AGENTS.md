<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Guest previews use isolated, browser-only fictional fixtures on public routes; never reuse authenticated patient queries or writes, because judges must not access or alter clinic data.
- Real user roles remain server-assigned once and are never switchable in the signed-in workspace, because clinical data access is role-specific.
- Keep Avenn's visual roles in semantic tokens in `src/styles.css` (lime brand, neutral surfaces, separate clinical states) rather than component-local colors, so doctor, patient, reception and entry screens stay consistent.
