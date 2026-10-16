# Requirements Specification — Fleetline

## Purpose
Define the requirements visible in the current Fleetline frontend implementation.

## Functional Requirements
- **FR-01 Navigation:** The user can navigate Dashboard, Vehicles, and About the Project.
- **FR-02 Dashboard:** The application displays total vehicles and status counts.
- **FR-03 Add:** The user can add a vehicle using a form.
- **FR-04 View:** The user can inspect a vehicle's details.
- **FR-05 Update:** The user can edit an existing vehicle.
- **FR-06 Delete:** The user must confirm before a vehicle is deleted.
- **FR-07 Search:** The user can search vehicle attributes and license plate values.
- **FR-08 Filter:** The user can filter the list by vehicle status.
- **FR-09 Sort:** The user can sort the displayed results using the available sort options.
- **FR-10 Plate normalization:** Plate entry supports the defined Latin/Arabic letter mapping and Arabic-Indic digits.
- **FR-11 Duplicate prevention:** The application rejects a plate that duplicates another normalized plate.
- **FR-12 Validation:** The application validates required fields, year, status, assignment, and text lengths.
- **FR-13 Localization:** The user can switch between English and Arabic.
- **FR-14 Direction:** English uses LTR and Arabic uses RTL.
- **FR-15 About:** The About page shows the three team members and IDs.

## Non-Functional Requirements
- **NFR-01 Usability:** Common tasks are available through clear navigation, forms, and confirmation dialogs.
- **NFR-02 Responsive layout:** Main screens adapt to mobile, tablet, and desktop widths.
- **NFR-03 Accessibility:** Dialogs support keyboard interactions and focus restoration; forms expose labels and validation messages.
- **NFR-04 Maintainability:** Domain logic, translations, UI components, and styles are separated into modules.
- **NFR-05 Testability:** Domain, component, and browser tests are included.
- **NFR-06 Data persistence limitation:** Vehicle records are intentionally in-memory for this phase; changes do not persist after reload.
- **NFR-07 Privacy:** Seed records are fictional demonstration data.

## Constraints
- React frontend; no database/backend in this phase.
- Only the supplied vehicle fields and status values are supported.
- Production use would require backend persistence, authentication, authorization, and server-side validation.
