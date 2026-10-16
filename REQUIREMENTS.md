# Fleetline requirements and implementation

This maps the supplied SE411 Phase 1 brief to the actual implementation. AI assisted requirements analysis, design, implementation, documentation, tests, and code review. The student team must review and understand the submission.

## Academic requirements

| Requirement                               | Implementation / evidence                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React application                         | React and React DOM; Vite entry in `src/main.jsx`.                                                                                                          |
| Menu navigation                           | Dashboard, Vehicles, and About buttons in `src/App.jsx`; selected page has `aria-current="page"`.                                                           |
| Add, display, search, update, delete cars | `src/VehicleList.jsx`, `src/VehicleDialogs.jsx`, and collection operations in `src/fleet.js`; UI CRUD tested in `src/App.test.jsx` and `e2e/fleet.spec.js`. |
| About page                                | Purpose, SE411 course, phase, scope, team, demo explanation, and AI disclosure in `App.jsx`.                                                                |
| Team names and IDs                        | Turki Alanazi / تركي العنزي — 222211513; Mohammed Alhindi / محمد الهندي — 221110784; Faisal Alghubaini / فيصل الغبيني — 219211021.                          |
| JavaScript objects in React state         | `cars` collection belongs to `App`; immutable array/object updates; refresh restores six synthetic sample records.                                          |
| No Phase 1 backend or database            | No application network requests, database SDK, API, Firebase, or Supabase. Only language preference uses local storage.                                     |
| Documentation                             | `README.md`, this document, `CODE_REVIEW.md`, `TEST_RESULTS.md`, and `SUBMISSION_CHECKLIST.md`.                                                             |
| Automated tests, actually run             | Vitest domain/UI tests and real headless Edge tests; observed results in `TEST_RESULTS.md`.                                                                 |
| Code review                               | Findings, corrections, scope, and limitations in `CODE_REVIEW.md`.                                                                                          |
| Phase 2 readiness                         | Shared structured record model, independent validation/plate helpers, and isolated collection updates. No speculative backend is included.                  |

## Pages and interactions

| Requirement                  | Implementation                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard counts             | Total, Available, In Use, and Maintenance derive from `fleetCounts(cars)`, including the zero-car case.                                                          |
| Useful status overview       | Proportional status bar, counts, percentages, and available-car shortcut all use the live collection.                                                            |
| Recent cars and Add Vehicle  | Latest four additions, detail dialogs, View all vehicles, and Add vehicle action. “Recent” means collection insertion order; editing does not change that order. |
| Search and status filter     | Combined free-text and status filter; car, model, employee, year, notes, and both plate scripts supported.                                                       |
| Sorting                      | Recently added, make/model alphabetically, or model year descending; source collection is never sorted in place.                                                 |
| Desktop table / mobile cards | Shared semantic table transforms to cards at 580px; accessible table/row/cell roles retained. Tablet tables can scroll within their panel.                       |
| View, Edit, Delete           | Accessible named row actions; full record details include notes and unique ID.                                                                                   |
| Confirmation / cancel        | Delete identifies the car, plate, and digits. Cancel and Escape leave the saved collection unchanged.                                                            |
| Validation / feedback        | Field-specific translated errors; first invalid field receives focus; translated success announcement after mutations.                                           |
| Immediate consistency        | Counts, records, results, recent list, and navigation count derive from the same React collection.                                                               |

## Bilingual and Saudi plate requirements

- `src/i18n.js` contains matching English/Arabic keys, including errors, empty states, confirmations, and dynamic feedback placeholders. Language choices retain their own names for discoverability.
- Document `lang`, `dir`, and title update on language/page changes. CSS logical properties mirror the shell. `Intl` formats counts, model years, percentages, and Gregorian dates for the selected locale. Student IDs and plate identifiers remain identifiers.
- Language changes preserve cars, search, filter, sorting, form drafts, and validation errors. A language switch is also available inside dialogs, since the background is inert while a modal is open.
- `SaudiPlate` in `components.jsx` derives both scripts from `{ letters, digits }`; mapping/normalization live in `plate.js`. Its direction stays LTR independently of the surrounding page.
- The exact supplied 17-letter mapping is used, including `Z=م`, `H=هـ`, and `V=ى`. Unknown letters are rejected, not silently substituted into saved data.
- Plates require exactly three supported Latin letters and one to four digits; Arabic-Indic input is converted to Western digit strings. Case and whitespace around inputs are normalized; leading zeros remain significant.
- Duplicate keys use normalized letters and the full digit string, with the current record excluded during edit. `ABJ:0012` and `ABJ:12` remain distinct demonstration identifiers.
- Arabic letters and digits are searchable, including spaced letters, `هـ`, and either letter-first or digit-first plate queries.
- White, bordered plates have a narrow `KSA / السعودية` section, without a government emblem. The form and detail view identify them as stylized demonstration plates.
- All sample plates and employee assignments are fictional; unsupported sample plates from the original app were migrated.

## Record validation

| Field             | Rules                                                                                                             |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| ID                | Stable unique sample ID or generated UUID; retained on edit.                                                      |
| Plate letters     | Three letters from the supplied mapping after whitespace/case normalization.                                      |
| Plate digits      | One to four digits; Western or Arabic-Indic input; stored as a string.                                            |
| Make / model      | Required, trimmed, not whitespace-only; at most 60 characters each.                                               |
| Model year        | Four decimal digits representing an integer from 1900 through the current year + 1. Arabic-Indic digits accepted. |
| Status            | Exactly Available, In Use, or Maintenance in the stored model.                                                    |
| Assigned employee | Required for In Use; optional otherwise; trimmed; at most 80 characters.                                          |
| Notes             | Optional, trimmed, at most 500 characters.                                                                        |

## Accessibility and presentation

Associated labels, localized accessible control names, visible focus outlines, skip link, native modal dialogs, initial focus, explicit Tab/Shift+Tab wrapping, Escape cancellation, focus restoration, safe initial focus for deletion, error descriptions, live error/success announcements, text status badges, reduced-motion CSS, and readable Arabic system-font fallbacks are implemented.

The product uses emerald, warm off-white, charcoal, restrained gold, consistent inline SVG icons, responsive spacing, and no external font/image dependency. Browser checks cover 320, 390, 768, 1024, and 1440px widths. This is not a certification of screen-reader or WCAG conformance; remaining manual checks are documented.

## Submission requirements still requiring student action

The assignment calls for three students; all three supplied team members are now included in both languages. Public GitHub visibility and submission of the repository URL by one student remain manual actions. See `SUBMISSION_CHECKLIST.md`. No commit, push, publication, or deployment was performed.
