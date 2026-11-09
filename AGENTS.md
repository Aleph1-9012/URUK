# Working in Uruk

Read `README.md` for commands and task entry points. Start with the feature's
entry point and follow its imports; avoid reading every film for a local change.

- Apply the `anti-slop` skill for JavaScript and TypeScript work. The user's skill
  is at `/home/silverhand9012/.codex/skills/anti-slop/SKILL.md`. There is no
  configured repository lint command; do not claim one passed.
- Keep a visual's math, storyboard, rendering, worker, and styles in its feature
  directory. Shared film controls and browser lifecycle belong in
  `src/components/plate/`. Stable calculations belong below browser code.
- Register visuals only in `src/content/visuals.ts`. Review labels and public
  filter keys belong only in `src/content/review-status.ts`.
- Use the roll's public filtering/scroll API from other components. Keep its
  internal selectors and layout measurements inside `components/roll`.
- Preserve article wording, mathematical scope, citations, review dates, drawing
  choreography, and artwork unless the task requests a change. Use the
  `uruk-paper-content` skill for article prose when available.
- Use `bun run verify` for a structural change. Add `check:interactions` after a
  build for browser behavior, and `check:screens` for affected layouts. The
  README explains route selection and browser prerequisites.
- Test observable behavior and independent mathematical facts. Do not add
  source-text snapshots, module mocks, or assertions about constant arithmetic.
- Do not edit generated `dist/`, `.astro/`, or dependency files to fix source.

The refactor's decisions, justified special cases, and verification record are
in `docs/untangle-decisions.md`.
