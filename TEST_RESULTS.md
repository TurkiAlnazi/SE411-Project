# Fleetline test results

Executed on **16 October 2026** in `Project-Phase-1`, Windows, Node.js 24.14.0, npm 11.9.0. Tests, review, and documentation were AI assisted. Results below are observed executions, not proposed commands.

The completed three-member roster, including Faisal Alghubaini (219211021 / فيصل الغبيني), was reverified with the existing UI and browser tests. The team grid now uses three columns on desktop and adapts for tablet/mobile.

## Final verification

| Actual command                            | Observed result                                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run test`                            | **PASS** — 2 files, **75 tests passed**, no failures. Vitest 5.0.5; final observed duration 9.78s.                                                           |
| `npm run test:e2e`                        | **PASS** — **4 tests passed**, no failures, in installed headless Microsoft Edge/Chromium. Final observed duration 8.9s.                                     |
| `npm run lint`                            | **PASS** — ESLint completed with exit code 0 and no warnings/errors.                                                                                         |
| `npm run build`                           | **PASS** — Vite 8.3.4 completed with exit code 0, 23 modules transformed, production assets written to `dist/`.                                              |
| `npm run format:check`                    | **PASS** — all matched source, test, configuration, HTML, and documentation files use the configured Prettier style.                                         |
| `npm ls --depth=0`                        | **PASS** — dependency tree resolved without missing/invalid package errors.                                                                                  |
| `git status --short` from repository root | Only `?? Project-Phase-1/`; the project was already untracked when work began. No tracked Java lab or root-file changes. No staging or commit was performed. |

Final production output observed:

| Artifact          | Size      | Gzip     |
| ----------------- | --------- | -------- |
| `dist/index.html` | 0.68 kB   | 0.41 kB  |
| CSS bundle        | 25.58 kB  | 6.12 kB  |
| JavaScript bundle | 261.05 kB | 81.46 kB |

Dependency installation (`npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test`, then `npm install -D prettier`) succeeded and reported **0 vulnerabilities** at installation time. `npm ci` is documented for reproducible setup but was **not** executed during this implementation.

## Domain tests — `src/fleet.test.js`

65 expanded cases cover:

- Immutable add, normalized text, distinct IDs, nested plate copies, edit with stable ID, deletion, and immediately derived counts, including an empty fleet.
- Self-plate editing, conflicts with another car, and missing-record edits.
- Each of the exact **17** supplied Latin/Arabic letter mappings, unsupported letters, wrong letter counts, and invalid digit formats/lengths.
- Normalized duplicate detection across case, whitespace, and Arabic-Indic digits.
- Both digit systems and leading zeros; zero-padded identifiers remain strings and intentionally distinct from unpadded ones.
- Required and whitespace-only values; text/notes length limits; allowed statuses; assigned employee required for In Use.
- Four-digit year format, integer/range limits, rejection of scientific notation, both year bounds, and Arabic-Indic years.
- Latin/Arabic plate search, spaced letters, `هـ`, digit-first and letter-first queries, leading-zero searches, make/model/employee/year/notes search, status combinations, empty results, and non-mutating sorting.
- Valid, unique sample data and English/Arabic dictionary key/placeholder parity.

## React/UI tests — `src/App.test.jsx`

10 tests cover:

- Add → view details → edit with assignment → cancel deletion → confirm deletion, with live records/counts and translated success feedback.
- Script-like notes remain literal visible text.
- Language switching during a draft preserves input; filters/sort remain set; errors and document RTL/LTR update correctly.
- Duplicate errors focus the invalid field; Cancel leaves the saved record unchanged.
- Arabic plate search, combined filtering, empty results, reset, and visible sort order.
- Dialog initial focus, cancellation event, focus restoration, and all three supplied team identities in both languages.
- Deletion of the entire fleet, zero counts, available-car summary, and actionable empty states.
- Only language persists; remount restores the original sample fleet; local-storage access failure is handled.
- Plate layout is fixed LTR, derives both scripts, preserves zeros, and keeps both preview rows at three positions for an invalid long draft.

jsdom has a small dialog API shim. It does not simulate browser-native modality; the real browser tests below independently verify focus and Escape behavior.

## Real-browser verification — `e2e/fleet.spec.js`

All four tests were executed in installed headless Edge:

1. Desktop add/detail/edit/delete, employee validation, script-like literal text, delete cancellation, mid-edit Arabic switch, translated feedback, language retention on refresh, and zero uncaught page errors during that flow.
2. Native modal initial focus, **Tab and Shift+Tab wrapping**, **Escape**, and focus restoration to the opener.
3. Arabic mobile cards at **390 × 844**, combined Arabic plate search/status filter/reset, duplicate validation, retained draft when switching language, and measured plate geometry showing LTR content with the country strip on the right.
4. Dashboard, Vehicles, and About in **both languages** at **320, 768, 1024, and 1440px** widths. Assertions confirm no document-level horizontal overflow; tablet table scrolling is contained. All three supplied Arabic team names and Faisal's student ID are visible.

Screenshots were produced locally in ignored `artifacts/`:

- `dashboard-en.png`
- `dashboard-ar.png`
- `dashboard-ar-mobile.png`
- `vehicles-ar-mobile.png`
- `vehicle-form-mobile.png`

The English desktop dashboard, Arabic mobile dashboard/directory, and mobile form screenshots were visually inspected. Review led to larger supporting text/plates and a hidden-until-focused skip link. Full-page captures with an open modal include document area beyond the viewport; the actual native modal/backdrop and scrollable form were exercised in the browser.

## Failures encountered and resolved

- Initial sandboxed dependency downloads failed with npm `ENOTCACHED`. Downloads were rerun with granted network permissions and completed successfully.
- Initial sandboxed Vitest/build/browser invocations failed with `spawn EPERM` when Vite/Playwright needed child processes. They were rerun with the required process permissions. These initial attempts were not counted as passing tests.
- The first browser pass had **3 passed / 1 failed**: focus did not wrap from the final dialog button to the first button in Edge. Explicit keyboard wrapping was added; the second and final browser runs both passed **4/4**.
- Formatting initially hit `EPERM` on the existing HTML entry; it was rerun with the required file permission and succeeded.
- Final functional/test/build/lint checks have no unresolved failures. Node's test-server output included an environment-level `NO_COLOR` / `FORCE_COLOR` warning; it did not affect the passing browser results.

## Human checks still needed

- Proofread all Arabic copy and mixed Arabic/Latin identifiers with a fluent reviewer.
- Test a screen reader (for example NVDA/VoiceOver), 200% browser zoom, forced colors/high contrast, and reduced motion in a real browser. Reduced-motion CSS exists; these human checks are not claimed as executed.
- Check Firefox/Safari and physical touch devices. Edge viewport emulation is not the same as testing those engines or devices.
- Have the student team review the code and course rubric, confirm the complete three-member roster, and complete public GitHub visibility/URL submission.

No independent human accessibility audit, cross-browser certification, or penetration test was performed. No backend, deployment, commit, or push was involved in verification.
