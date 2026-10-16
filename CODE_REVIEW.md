# Fleetline code review

Review date: 16 October 2026. Scope: the existing Phase 1 implementation, replacement application modules, styles, test setup, and submission documentation. This was an AI-assisted code review, not an independent human audit. Review used source inspection, lint, domain/UI tests, real Edge interactions, and screenshot inspection; exact final command results are in `TEST_RESULTS.md`.

## Findings and corrections

| Area                 | Finding                                                                                         | Correction / evidence                                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data integrity       | Original plates were unstructured strings and included unsupported letters.                     | Migrated to `{ letters, digits }`, using the supplied mapping as the validation source of truth. Every sample is tested for validity and uniqueness.                                     |
| Data integrity       | Case, spaces, and Arabic digit input could bypass a simple duplicate comparison.                | Normalized structured key, exclusion of the editing record, and duplicate add/edit tests. Leading zeros are retained intentionally.                                                      |
| Validation           | `Number()` alone accepts scientific notation such as `2e3`.                                     | Require four decimal year digits before range validation; test invalid formats, both bounds, next-year limit, and Arabic digits.                                                         |
| State quality        | A shallow copy can share nested plate state with the saved record.                              | Clone plate objects when initializing app/form state; save creates a fresh object and plate; tests assert original data stays unchanged.                                                 |
| Internationalization | Literal success/error strings become stale after changing language.                             | Store error/message keys and interpolation values, translate at render time, and test draft/filter/feedback retention. Dictionary parity test checks all keys and placeholders.          |
| Plate consistency    | Invalid long draft letters could create different Arabic/Latin preview lengths.                 | Derive both rows from the same three normalized preview positions; unsupported preview characters use placeholders and cannot be saved.                                                  |
| Accessibility        | Real Edge testing found Tab from the final modal button did not wrap to its first control.      | Added explicit forward/reverse focus wrapping alongside native `showModal()`. Browser test now verifies both directions, Escape, and restoration.                                        |
| Accessibility        | Native browser validation messages would not follow the selected app language.                  | `noValidate` with shared domain validation, localized inline errors, `aria-describedby`, error summary, and focus on the first invalid field. Required semantics are retained on inputs. |
| Accessibility        | Deleting a row removes the element that opened its dialog.                                      | Restore focus to a connected opener or the main Add vehicle action. Deletion initially focuses Cancel.                                                                                   |
| Responsive UI        | The original table was difficult to use on small screens.                                       | Shared rows become cards on mobile; tablet overflow stays within the table wrapper. Browser assertions check every page in both directions at 320/768/1024/1440px.                       |
| Visual quality       | Early screenshot review showed small secondary text.                                            | Increased table, control, status, legend, and supporting text sizes and enlarged the plate. Warm backgrounds and dark text maintain clear contrast.                                      |
| Reuse / usability    | Search-clear and full-filter-reset controls had the same accessible name but different effects. | Separate translated Clear search and Clear filters names.                                                                                                                                |
| Code quality         | Dense JSX/styles impeded review.                                                                | Added Prettier configuration and scripts; formatted implementation and tests. Kept focused domain, translation, plate, shared UI, list, dialog, and page modules.                        |

## Security review

- User-provided make/model, employee, and notes are rendered through React text nodes. No `dangerouslySetInnerHTML`, dynamic HTML insertion, or `eval` is used. UI/browser tests display script-like input literally.
- Phase 1 has no authentication, database, application API requests, cookies, tokens, or bundled secrets. Records are not written to local storage. Local storage is used only for the selected language, with failures handled gracefully.
- Required values, field lengths, years, status membership, employee requirements, plate alphabet/length, and duplicate plates are checked by the domain layer as well as constrained in controls. Client checks are usability/integrity measures, not a future authorization boundary.
- Delete requires an explicit, localized confirmation identifying the selected record; cancellation does not mutate the collection.
- No real employee data or real vehicle ownership is claimed. The three supplied student identities appear only as project team information.
- Dependency installation reported zero known vulnerabilities at installation time. This is a time-specific package-manager result, not a guarantee against vulnerabilities.

## Performance review

Search/filter and counts are linear in collection size; sorting is O(n log n) on a copy. This is appropriate for the small in-memory Phase 1 collection. No unnecessary memoization, global state package, charting library, external images, or runtime translation dependency was added. The status visualization is CSS driven. Test/format dependencies are development-only; React/React DOM remain the runtime dependencies.

The final production build and compressed asset sizes are recorded in `TEST_RESULTS.md`. Larger Phase 2 fleets should use backend filtering/pagination and measure performance before adding caching or virtualization.

## Quality and reuse review

- `fleet.js` owns immutable collection operations and validation; `plate.js` owns mapping, normalization, keys, and both numeral systems.
- `i18n.js` centralizes UI text and locale formatting. Stored statuses remain stable across languages.
- `components.jsx` shares icons, plate rendering, badges, language switch, modal behavior, and empty states. `VehicleList.jsx` is reused by dashboard and directory; one form handles add and edit.
- `App.jsx` owns the saved collection, page, query/filter/sort, active dialog, and feedback. The form owns only its unsaved draft and error keys. Derived counts/results are not stored separately.
- Source, tests, and build output were checked with configured ESLint rules. Java labs and repository-root files were outside the edit scope.

## Remaining limitations and Phase 2 work

- Saved changes intentionally disappear on refresh and are not shared between tabs. No multi-user conflict handling, durable storage, authorization, or server validation exists in Phase 1.
- Leading zeros distinguish demo identifiers; an actual backend must define its authoritative identifier policy and enforce uniqueness atomically.
- “Recently added” is collection insertion order, not a historical audit log. A backend should supply creation timestamps if required.
- Real-browser checks used Edge/Chromium on Windows. Safari, Firefox, physical touch devices, screen readers, forced-colors mode, and a human Arabic language review remain manual checks. Modern native-dialog and secure-context UUID support are expected; use the localhost development server.
- No pagination is included for the small sample collection. No formal penetration test, accessibility certification, or independent human code review is claimed.
- All three required team members are now supplied and included. Repository visibility and URL submission must still be completed by the students.

AI assisted requirements, design, implementation, documentation, tests, and this review. The team must validate the final submission against the course rubric and explain the implementation themselves.
