# Test Plan — Fleetline

## Test Objectives
Verify core vehicle-management workflows, input validation, plate normalization, bilingual behavior, responsive layouts, and basic keyboard accessibility.

## Test Types
- Unit/domain tests (`src/fleet.test.js`)
- Component/UI tests (`src/App.test.jsx`)
- End-to-end browser tests (`e2e/fleet.spec.js`)
- Static checks (`npm run lint`)
- Production compilation (`npm run build`)
- Formatting check (`npm run format:check`)

## Test Cases
| ID | Scenario | Expected result |
|---|---|---|
| TC-01 | Add a valid vehicle | New vehicle appears and counts update |
| TC-02 | Submit missing make/model | Localized validation appears; save is blocked |
| TC-03 | Enter a duplicate plate | Duplicate is rejected |
| TC-04 | Edit a vehicle | Changes appear; ID remains stable |
| TC-05 | Cancel an edit | Original record remains unchanged |
| TC-06 | Delete a vehicle and cancel | Record remains |
| TC-07 | Confirm deletion | Selected record is removed and counts update |
| TC-08 | Search by Latin plate | Matching vehicle is shown |
| TC-09 | Search by Arabic plate/digits | Matching vehicle is shown |
| TC-10 | Combine search and status filter | Only matching records appear |
| TC-11 | Sort by a supported criterion | Visible rows follow selected order |
| TC-12 | Switch English/Arabic | Text and document direction update |
| TC-13 | Switch language with a form open | Draft values remain |
| TC-14 | Use narrow viewport | No horizontal overflow in tested layouts |
| TC-15 | Keyboard-operate a dialog | Focus enters, wraps as implemented, and restores on close |
| TC-16 | Delete all records | Zero counts and useful empty states appear |

## Execution
Use:
```bash
npm ci
npm run test
npm run test:e2e
npm run lint
npm run build
npm run format:check
```
Record actual environment, command, result, failures, and date in `TEST_RESULTS.md`. Do not mark a test passed unless it was executed and observed.
