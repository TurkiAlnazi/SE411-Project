# Fleetline — SE411 Project Documentation

**Project:** Fleetline — Company Vehicle Fleet Management  
**Course:** SE411 — Software Construction  
**Phase:** Frontend / Phase 1  
**Team:** Turki Alanazi (222211513), Mohammed Alhindi (221110784), Faisal Alghubaini (219211021)

## 1. Project Overview
Fleetline is a React-based frontend prototype for managing a company's vehicle fleet. It provides a dashboard and a vehicle management view for creating, viewing, editing, searching, filtering, sorting, and deleting car records. The interface supports English and Arabic, including left-to-right and right-to-left layouts.

The application currently uses in-memory JavaScript objects as its data collection. It does not include a database, backend API, or server-side persistence. Changes to vehicle records are therefore reset when the application is reloaded; the selected language is stored in browser local storage.

## 2. Objectives
- Provide a clear interface for viewing fleet totals and vehicle status.
- Support basic vehicle record management (CRUD).
- Validate records and prevent duplicate license plates.
- Support Saudi-style plate entry in English and Arabic digits/letters.
- Provide bilingual UI and responsive layouts.
- Demonstrate modular React code and automated tests.

## 3. Scope
### Included
- Dashboard, Vehicles, and About the Project navigation.
- Add, view, edit, and delete vehicle records.
- Search, status filtering, and sorting.
- Vehicle details including plate, make, model, year, status, assigned employee, and notes.
- Validation for required fields, year, status, employee assignment, text lengths, plate format, and duplicate plates.
- English/Arabic translation and LTR/RTL direction.
- Responsive vehicle table/cards and keyboard-accessible dialogs.
- Unit/component tests and Playwright end-to-end tests.

### Not included in this phase
- Database or persistent vehicle storage.
- Authentication, user roles, or authorization.
- Backend API, cloud synchronization, or production deployment.
- Real company vehicle or employee data. The bundled sample records are fictional.

## 4. Technology Stack
| Technology | Purpose |
|---|---|
| React 19 | Component-based user interface |
| JavaScript ES modules | Application logic |
| Vite 8 | Development server and production bundling |
| CSS | Responsive styling and visual design |
| Vitest | Unit and component test runner |
| Testing Library | UI behavior and accessibility-oriented tests |
| Playwright | Browser-level end-to-end tests |
| ESLint | Static code-quality checks |
| Prettier | Consistent code formatting |

Exact installed versions are declared in `package.json` and `package-lock.json`.

## 5. Main Features
### Dashboard
Shows fleet totals and counts by status, with navigation to the main sections and actions to add or view vehicles.

### Vehicle Management
- Add a vehicle through a dialog.
- Open a record to view details.
- Edit an existing record.
- Delete a record after confirmation.
- Search across vehicle attributes and license plates.
- Filter by status: Available, In Use, or Maintenance.
- Sort records using supported sort choices.
- Clear search/filter state when needed.

### License Plate Handling
Plate values are stored as separate `letters` and `digits` fields. Normalization supports casing/spacing cleanup and conversion of Arabic-Indic digits to Western digits for consistent validation and duplicate detection. Leading zeroes are retained because plate digits are stored as strings. The supported letter mapping is defined in `src/plate.js`.

### Bilingual Interface
English and Arabic strings are maintained in `src/i18n.js`. The document language and text direction are updated with the selected language. Language preference is stored under the local-storage key `fleetline-language`.

### About the Project
Displays the three team members and their student IDs.

## 6. Architecture and Source Structure
- `src/main.jsx` — React application entry point.
- `src/App.jsx` — top-level application state, navigation, page-level actions, and language direction.
- `src/fleet.js` — vehicle model, seed data, validation, counts, search, sorting, save, and delete operations.
- `src/plate.js` — plate normalization, mapping, and digit conversion helpers.
- `src/i18n.js` — bilingual translation dictionary and locale helpers.
- `src/VehicleList.jsx` — vehicle list/table and row-level actions.
- `src/VehicleDialogs.jsx` — add/edit form, details dialog, and delete confirmation.
- `src/components.jsx` — reusable interface components.
- `src/App.css`, `src/index.css` — application and global styles.
- `src/fleet.test.js` — domain logic and validation tests.
- `src/App.test.jsx` — UI/component interaction tests.
- `e2e/fleet.spec.js` — Playwright end-to-end and responsive layout tests.
- `playwright.config.js`, `vite.config.js`, `eslint.config.js` — tool configuration.

The UI is separated from the fleet-domain functions so validation and collection operations can be tested without rendering the full interface.

## 7. Data Model
A vehicle record contains:
| Field | Description |
|---|---|
| `id` | Unique record identifier |
| `plate.letters` | Three supported plate letters |
| `plate.digits` | One to four decimal digits, stored as text |
| `make` | Manufacturer; required, up to 60 characters |
| `model` | Vehicle model; required, up to 60 characters |
| `year` | Four-digit year from 1900 through the next calendar year |
| `status` | `Available`, `In Use`, or `Maintenance` |
| `employee` | Assigned employee; required when status is `In Use`, maximum 80 characters |
| `notes` | Optional notes, maximum 500 characters |

The application starts with six fictional example vehicles. These are demonstration records, not live company data.

## 8. Validation Rules
- Plate must use exactly three supported letters and one to four digits.
- Duplicate normalized plates are rejected, except when retaining the same record during its edit.
- Make and model are required and trimmed before saving.
- Year must be a four-digit integer in the allowed range.
- Status must be one of the three supported values.
- An employee name is required for vehicles marked `In Use`.
- Employee and notes fields have length limits.
- Validation feedback is localized and the first invalid field receives focus.

## 9. Testing
The repository contains:
- Domain tests for immutable data operations, plate rules, validation, search, filtering, sorting, and translations.
- UI tests for add/view/edit/delete, validation, language switching, search/filter/sort, empty states, and dialog focus behavior.
- Playwright browser tests for complete flows, Arabic/RTL behavior, responsive widths, duplicate plate checks, and About page team details.

`TEST_RESULTS.md` in the repository records reported test executions. Those results are documentation from the repository; teams should rerun the commands on the submission machine before submitting.

Commands:
```bash
npm ci
npm run test
npm run test:e2e
npm run lint
npm run build
npm run format:check
```

## 10. Security, Quality, and Accessibility Notes
- React renders user-entered notes as text, and a UI test checks that markup-like input is displayed literally.
- Input validation and normalized duplicate checks reduce malformed or conflicting records.
- The application has no authentication or authorization because it is a local frontend prototype; it must not be treated as a secure multi-user production system.
- Vehicle data is held in memory and is not sent to a backend by this implementation.
- Dialog behavior includes keyboard focus handling and restoration, and the app uses localized inline validation.
- Continue manual review for keyboard navigation, screen-reader labels, contrast, and Arabic proofreading.

## 11. Limitations and Future Work
1. Add a backend API and database for durable records.
2. Add authentication and role-based access control before multi-user use.
3. Add server-side validation and audit logging when a backend is introduced.
4. Add automated backup/export and import capabilities if required.
5. Perform human accessibility and cross-browser checks.
6. Confirm final rubric requirements and AI-use disclosure expectations with the instructor.

## 12. Team
| Member | Student ID |
|---|---|
| Turki Alanazi | 222211513 |
| Mohammed Alhindi | 221110784 |
| Faisal Alghubaini | 219211021 |

## 13. AI Assistance and Submission Note
The repository includes AI-assisted project materials and testing documentation. Team members should review the source code, understand the implementation, verify reported test results locally, and disclose AI assistance according to the instructor's requirements. No public deployment or repository submission is implied by this document.
