# Untangle decisions

Status: completed on 9 November 2026. Independent reviews found no remaining
structural issue worth fixing within the audited scope. The final verification
and browser interaction runs passed after the standard-map reconnect fix.

Baseline: `d21d19f6f3b5e22fd4fcd9ab6e97b8a0399976f8`, clean checkout.
The user selected both optional comment and test cleanup areas.
The initial checks passed: 99 tests, TypeScript/Astro checks, 73 content documents,
and a production build with 78 pages. Astro also inspected generated `dist`
JavaScript and reported one hint, which belongs outside source checking.
Baseline source, dependency evidence, rule trials, and build output live in
`../uruk-untangle-audit/`.

The problem list was recorded before source changes. File/line references in
that list refer to the baseline. Decisions, outcomes, and verification results
below describe the completed refactor.

## Share narrated film behavior, keep drawings local

- Eighteen film `element.ts` files repeat playback, cue stepping, subtitles,
  keyboard controls, range/clock updates, resize, density, font, and motion setup.
  Representative sites: `fair-average/element.ts:5`,
  `fraction-rulers/element.ts:6`, `caustic-collar/element.ts:6`.
- Disconnect cleanup differs between older and newer copies. Older copies retain
  readiness and fields, while newer copies reset them.
- Eighteen `story.ts` files repeat cue lookup, still-frame selection, and time
  formatting. The settling offsets vary intentionally between 180 and 300 ms.
- Film controls, subtitle parsing, transcripts, and their CSS repeat across
  eighteen Astro templates. One accessibility change currently needs many edits.
- Label bounds and placement repeat across renderers, but some return widths,
  use different margins, and perform different choreography. Extract only exact
  stable calculations; retain drawing-specific placement rules.

Decision: let `components/plate` own narrated-film lifecycle, timeline, and common
markup. Feature adapters own renderer creation, worker messages, and disposal.
Keep the three interactive plates on their existing player/track contracts.

Outcome: all eighteen narrated elements now register feature adapters with
`defineFilm`. `FilmControls`, `FilmSubtitles`, `FilmTranscript`, and `film.css`
own their shared markup and presentation. One paired-math text renderer replaces
four historical parsing implementations and preserves unmatched currency as
literal text. Thirteen renderers use `FilmLabels` for centered label measurement,
clamping, and visibility, with their original margins. Specialized label
placement remains with the drawings that need it. Storyboards expose `TIMELINE`
directly instead of forwarding its individual helper methods.

## Put shared mathematics below features

- `grid-products/math.ts:1` imports easing from its volatile storyboard.
- `five-colours/math.ts:1` imports its colouring model from `unit-ruler/tiling`.
- `prime-waves` imports its private number-theory helpers from a sibling
  `zeta-map` directory that has no independent component.
- `standard-map` sends and returns incrementing job IDs that no consumer reads.

Decision: share stable animation calculations and the colouring model, move
prime-wave helpers into their owning feature, and remove unused worker metadata.
Keep the latest-pending-job queue and the 250 ms refinement debounce because they
bound expensive drawing work.

Lifecycle follow-up: the standard map keeps the reader's parameter across a
reconnect. Its track and player now initialize from that retained model value.
Disconnect clears the old worker's busy/pending state so a new worker can draw.
The browser regression checks parameter changes against canvas redraws, reset,
and another parameter change after reconnecting.

## Define review status and visual registration once

- Review labels, URL/sign keys, and display order repeat in `schema.ts:10`,
  `status-sign/StatusSign.astro:10`, `results/index.astro:11`, and
  `menu/matching.ts:19`. Formatting lives in `content/results.ts:14`, which also
  loads the Astro collection.
- `content/visuals.ts:2` and `visuals/ResultVisual.astro:30` maintain separate
  registrations. Recent film commits repeatedly change both.

Decision: use a pure review-status model and one typed visual catalog. The
content schema must remain usable by the Bun content checker without importing
Astro components. Keep component loading at the rendering boundary.

Outcome: `content/review-status.ts` owns labels, filter keys, order, and the
evidence-link policy. The schema, filters, and status signs consume that model.
`content/visuals.ts` owns the only visual catalog. `ResultVisual.astro` resolves
every registration through an eager component glob and fails if a path is
missing. Its component type comes from Astro's public `AstroInstance` contract.

## Validate content contracts at their owning boundary

- `content/render.ts:169` looks for a review URL in serialized HTML. HTML escaping
  changes valid URLs with query parameters.
- Only `scripts/check-content.ts:19` checks filename/family agreement. Route
  generation assumes every family is unique without checking that invariant.

Decision: validate review destinations in the Markdown tree, and share result
identity validation between the collection boundary and the content command.
Preserve article text, source order, section requirements, and published URLs.

Outcome: `content/render.ts` validates review destinations in the Markdown tree
and carries reference definitions into each rendered section. `content/identity.ts`
checks filename/family agreement and uniqueness for both collection loading and
`check:content`. Regression tests cover escaped URLs, reference links, duplicate
families, and missing visual entry points.

## Keep the home-page explanation and menu contracts explicit

- `dig/Dig.astro:14` mixes result 248 editorial data with rendering and checks
  the fourth layer by Roman numeral.
- `menu/element.ts` directly mutates the roll's slot, heading, help, and filtering
  attributes. `back-to-top/element.ts` knows its internal scroll-window selector.
- `PageLayout.astro` chooses the `uruk-menu` root for the results workflow.

Decision: give the Dig data explicit review metadata and give the roll a small
public filtering/scroll contract. Keep the menu root in the layout if moving it
only replaces the current explicit composition with a more complex protocol.

Review follow-up: back-to-top must wait until the roll's custom element is
defined before using its public methods. Its connection signal guards the
asynchronous setup so a removed element cannot attach listeners later.

Outcome: `dig/content.ts` owns the existing home-page explanation and explicit
review metadata. The menu uses the roll's `filterResults` API; back-to-top uses
`scrollToStart` and `scrolledBeyondPage`. The roll owns its internal selectors,
messages, and layout measurements. The existing layout composition remains.

## Make routine work discoverable

- No repository README or AGENTS file explains commands, feature entry points,
  content validation, or which generated files to avoid.
- Root TypeScript configuration does not exclude build output.

Decision: document the actual task paths and checks, add concise agent guidance,
and limit source checking to source. Keep audit tooling outside the checkout;
do not install a new lint stack as part of this refactor.

Outcome: [README.md](../README.md) maps common tasks to their owning files and
documents the commands. [AGENTS.md](../AGENTS.md) gives future agents the same
boundaries. `bun run verify` combines type, content, test, and build checks.
`check:interactions` exercises browser behavior; `check:screens` checks layouts.
Source checking excludes generated build output.

## Preserve requirements that look like special cases

- Reduced-motion stills, font/density remeasurement, reader announcements, finite
  film end frames, and off-screen/hidden-tab pauses are accessibility and resource
  requirements.
- A failed hero-water image decode leaves the approved still image visible.
- Screen checks exempt deliberately clipped screen-reader labels and marked
  artwork bleed; scroll-end has a bounded timeout for browser completion.
- Mathematical exceptions and numerical tolerances represent the depicted
  mathematics. They are not generic control-flow cleanup targets.

## Finish with evidence

Run the same tested ast-grep rules and inclusion policy on both snapshots,
retain parser coverage and raw matches, and report exact counts separately from
contextual findings. Check rendered content, browser film controls and lifecycle,
navigation, production output, and the existing layout checks. Review comments
and tests last. Ask independent reviewers to inspect remaining coupling before
closing the work.

## Verification results

- `bun run verify` passes with zero Astro/TypeScript diagnostics, 108 tests,
  73 valid result documents, and a production build containing 78 pages.
- All 73 article bodies produce exactly the same rendered result as the baseline.
  No result Markdown changed.
- A browser comparison of 144 states covers all 18 narrated films at widths
  390 and 1440, at 0, 40, 80, and 120 seconds. Subtitle text, exact canvas pixels,
  label transforms/visibility/opacity, opened transcripts, and sampled layout
  and computed styles match the baseline.
- `bun run check:interactions` covers all 18 narrated films in 36 phone/desktop
  sessions, plus seeking, cue stepping, reconnect cleanup, playback pauses,
  motion preference changes, standard-map worker/reset/reconnect behavior,
  search, review filters, and phone back-to-top.
  The runner asserts its expected film inventory so missing pages cannot silently
  reduce coverage.
- `bun run check:screens` passes 121 viewport checks across eleven representative
  routes, including the home page, result index, film layout variants, workers,
  and the standard map. Screenshots are in
  `/tmp/uruk-work/screens/20261109-091045/`.
- All eighteen complete cue inventories match the baseline, including text,
  timings, source numbers, and cue titles.
- The optional cleanup removed 351 reviewed redundant or orphaned comment blocks
  and two assertions that checked only constant arithmetic. Existing mathematical
  and content behavior tests remain. Nine boundary/text regression tests were added.
- Existing anti-slop guidance was applied manually. The repository has no
  configured lint command; no lint dependency or CI configuration was installed.
- Independent structural reviews finished without another issue worth fixing.
  Deliberate mathematical exceptions, layout variants, worker refinement, and
  browser fallbacks remain documented above.

The six ast-grep trial rules use version 0.51.1 and the same definitions and
inclusion policy for both snapshots. All fixture suites pass.

| Pattern | Before | After |
| --- | ---: | ---: |
| Feature density watchers | 18 | 0 |
| Story cue lookup functions | 18 | 0 |
| Story clock formatters | 18 | 0 |
| Imports between sibling visuals | 8 | 0 |
| Review-link checks against serialized HTML | 1 | 0 |
| Repeated status inventories | 3 | 0 |

Coverage grew from 222 source files and 251 parsed TypeScript units to 238 source
files and 267 parsed units. The scan includes extracted Astro front matter and
client scripts, with zero skipped units or parser diagnostics. It excludes
Astro template expressions, generated output, dependencies, Markdown, CSS, and
binary/data assets. Rules are audit candidates, not installed lint gates.
Both dependency graphs have zero cycles. The final graph has 592 local edges,
including 21 resolved visual-component imports and six worker URLs.

A shared keyboard-control change now lands in `plate/controller.ts` instead of
eighteen feature elements. Adding a visual updates its feature, article, test,
and one catalog entry; it no longer needs a second registration in ResultVisual.
The raw rule fixtures, JSON, parse coverage, comparisons, and reproduction
scripts remain in `../uruk-untangle-audit/`.

## Working from this refactor

Start with the README's task map and read the relevant feature and its imports.
Shared playback, keyboard, resizing, or accessibility changes belong in
`components/plate`. A visual's mathematical explanation and choreography stay
with that visual. Update the catalog when adding a visual and the review-status
model when changing status policy.

These ownership changes reduce the number of implementations a maintainer must
inspect for a shared change. They do not remove the need to understand the
mathematics. Change time and LLM token savings have not been benchmarked.

The [audit report](../../uruk-untangle-audit/report.md) retains the complete
measurements, scan limitations, and reproduction commands. Its raw evidence is
outside the checkout; this log and the contributor guides remain in the repository.

# Second refactor, 14 November 2026

Status: completed on 14 November 2026. The first refactor covered
18 films. By this one the site had 50, built one at a time from scratch, and
each new film had copied the same markup, stage styles, canvas sizing, colour
reading, text helpers and worker handling. An audit with 22 ast-grep rules and
a duplicate-function scan produced a plan; this section records what was done.

Baseline: the uncommitted working tree of 14 November, kept as a source
snapshot and a drafts build in `../uruk-untangle-audit/round2/`. Before any
edit the frame comparison was run on the baseline against itself and reported
zero differences in 2,600 states.

## One name per film

- Folder, catalog key and element now match: `prime-waves` (was key
  `zero-free-strip`, element `uruk-prime-film`), `uruk-catalan-bounds`,
  `uruk-switch-groups`. Result 003 selects `visual: prime-waves`.
- Every film's stylesheet is `style.css` and its storyboard is `story.ts`.
- The film constructor's first argument is `root` in every film.

## Films share one shell

- Fifty templates repeated the plate, stage, canvas, label layer, subtitles,
  controls and transcript in 30 slightly different skeletons.
- Fifty stylesheets repeated the same seven stage rules.

Decision: `plate/Film.astro` owns the markup and `plate/film.css` the stage
rules. A film's template passes its formulas, texts and method notes; its
stylesheet keeps only label sizes, tones and the phone aspect ratio, scoped by
its element name. Nine films' identical review stamp became
`.film-label--stamp`.

Two visible-in-principle changes were accepted, both invisible in the frame
comparison apart from the first:

- Ten films placed labels directly in the stage. They now sit in the shared
  label layer, which ignores the pointer as it already did in the other 40
  films. Formula text in those ten films can no longer be selected by mouse.
- Four early films hid the canvas with `opacity` until ready; all films now use
  `visibility`. The stage was already transparent until ready.

## The controller measures; films draw

- Fifty `resize` methods sized the canvas backing store and read the four
  colour tokens, in 14 variants, each with fallback hex values. The fallback
  ink differed from the token.

Decision: the controller calls `readFrame`, sizes the canvas and passes a
`FilmFrame` (width, height, density, tones) to `resize`. Films no longer touch
`getComputedStyle` or `canvas.width` except for their own off-screen caches
and the seven pigments of `five-colours`. `PAGE_TONES` holds the token values
until the first resize. `PHONE_STAGE_WIDTH` names the 600-pixel threshold.

Kept as they are, with reasons:

- Films keep their own `width`, `height`, `density` and colour fields. Moving
  them behind a shared object would rewrite thousands of drawing lines for no
  change in where edits land.
- The two-line frame reset (`setTransform`, `clearRect`) stays in each film.
  Its variants differ in caps, joins and dash, and a shared `begin()` would
  need threading through every constructor.
- Each film constructs its own `FilmLabels`, because the margins differ.

## A small drawing kit

Only word-for-word copies moved to `plate/canvas/`: the wrapped-text module
(six films), the partial `line` (17 films) and the fitted caption writer
(12 films, each passing its own font rule). Left in place: `hatch` (two
behaviours), `polar-product`'s wrapped text (its line spacing multiplies in a
different order), the font-stack strings (199 literals in three spellings) and
17 local easing helpers. Share one of these only when a film is next edited
and the comparison stays at zero.

## One worker lifecycle

Twelve films start their worker through `runNumerics`. It owns the two
`data-numerics-*` attributes, construction failure, `error` and `messageerror`,
and termination. Success paths are unchanged. Failure paths are now the same
everywhere: the film records the reason, the error attribute is set, the worker
stops and the film redraws. The standard map keeps its own lifecycle because
it survives reconnects with reader state.

## Removed

`unit-ruler/` and `thompson/` (no result selected them), `StepControl.astro`,
the stylesheet rules only they used, `lib/engraving-patterns.ts` (its list
moved into `five-colours`) and their seven tests. They remain in Git history.

## Tests beside films, scripts for builders

- Fifty-two film test files and their fixtures moved into the film folders.
  `tests/` keeps the seven cross-feature files.
- `scripts/site-browser.ts` starts the preview and browser for both checks.
- `bun run film:frames` captures stills; `bun run check:subtitles` reports
  subtitles against the article. Twenty-six of 50 films meet both subtitle
  rules; the others predate them. Re-cueing is content work.

## Verification

- `bun run verify`: zero diagnostics, 201 tests (208 less the seven removed
  with the plates), 73 documents, 78 pages.
- Frame comparison of all 50 films at widths 390 and 1440, 26 times each:
  canvas pixels, label placement, subtitle and transcript text, and computed
  layout of the plate, stage, controls, transcript and every label. Zero
  differences after each step, apart from the accepted pointer change. Widths
  700 and 1024 were also compared after the shell step.
- `check:interactions`: 50 films in 100 sessions, plus the standard map,
  search, filters and back-to-top. `check:screens`: 99 viewports on nine
  representative routes, zero failures.
- No lint command is configured; the anti-slop guidance was applied by hand.

| Pattern (ast-grep 0.51.1, same rules both sides) | Before | After |
| --- | ---: | ---: |
| Canvas backing store sized in a film | 52 | 2 |
| Colour token read in a film | 61 | 2 |
| Fallback colour literal | 209 | 9 |
| `width < 600` literal | 98 | 1 |
| `data-numerics-*` string | 67 | 7 |
| Swallowed worker-construction error | 4 | 1 |
| Film size fields | 44 | 44 |
| Frame reset | 51 | 51 |
| Font literal | 217 | 199 |
| Local easing helper | 17 | 17 |

Identical top-level functions across films fell from 24 groups (933 redundant
lines) to 16 groups (155 lines). Source under `src`, `scripts` and `tests`
fell from 82,999 to 80,187 lines.

A new film now needs its own drawing, story, mathematics and a short template
and stylesheet. A change to every film's markup, stage, canvas sizing or
worker handling lands in one file under `components/plate/`.

## Left open

- Timing: about 5,300 time literals sit in drawing code outside the
  storyboards. Move a film's timing into its `story.ts` when that film is
  re-cued, under the frame comparison.
- The remaining items under "A small drawing kit".
- Comment and test review of the films added since 9 November was not done.
- The workspace folder `Uruk-assets` has its own housekeeping list; the plan
  and its evidence are kept in `../uruk-untangle-audit/round2/`.

## Cone wall navigation

- The source and destination compose the same native-resolution pixels from the
  checked-in head and glyph packs. This single compositor (T2) keeps the wall
  identical across navigation in browsers that randomize canvas readback.
- The release checks the reported maximum texture size before uploading the face.
  Protected Zen can report a 2,048-pixel limit. A face exceeding the device limit
  opens in Canvas 2D using the same cone positions, word backings and gravity.
- A tab normally stages the wall in session storage. If storage fails, a short
  query parameter carries the route and viewport geometry. The destination
  removes the parameter immediately and validates the referrer, route and
  dimensions before rebuilding from the static packs.
- On 2026-11-25 the user chose to play Cone on its routes for readers with
  reduced motion enabled. Count and the home voyage retain their own preferences.
- Astro prerenders each `/cone-data/` file under a hash of its own emitted
  bytes, so Vercel can cache it as immutable without invalidating the packs when
  an entry script changes. Rolldown builds the two classic scripts in-process.
  The same manifest supplies the arrival boot, accepted cone clicks, and
  low-priority warming after the page and its entry motion settle. Warming skips
  Save-Data and does not delay a click.
- In the emulated 390×844 Zen RFP viewport, a plain navigation with no head
  scripts and a Cone navigation each showed two grey compositor samples on one
  trip out of 30. Real-window checks are recorded separately.
