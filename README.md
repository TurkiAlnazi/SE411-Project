# Fleetline / فليت لاين

A bilingual company car fleet management frontend for **SE411 — Software Construction, Phase 1**. Built with React and Vite. The application manages company cars only, entirely in memory.

## Team

| English           | العربية      | Student ID |
| ----------------- | ------------ | ---------- |
| Turki Alanazi     | تركي العنزي  | 222211513  |
| Mohammed Alhindi  | محمد الهندي  | 221110784  |
| Faisal Alghubaini | فيصل الغبيني | 219211021  |

All three required team members are now listed in the application and documentation. See [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md).

## Run locally

Verified environment: Node.js **24.14.0** and npm **11.9.0** on Windows. Use a current Node.js 24 installation and a modern browser.

From the repository root:

```powershell
cd Project-Phase-1
npm ci
npm run dev
```

Open the localhost URL printed by Vite, normally `http://localhost:5173`. Stop the server with Ctrl+C. The app requires no account, environment variables, API key, backend, or database. Dependencies must be installed once; the running application does not depend on external data, image, or font services.

## Features

- **Dashboard:** actual fleet totals, available/in-use/maintenance counts, proportional status overview, available-car shortcut, and four most recently added cars.
- **Vehicles:** free-text search, combined status filtering, sorting by addition order, make/model, or year, and a desktop table that becomes readable mobile cards.
- **Complete CRUD:** add a car, view all details, edit the existing record, and explicitly confirm deletion of the identified car/plate. Cancel leaves saved data unchanged.
- **Validation:** required/trimmed make and model, supported plate letters, one to four digits, duplicates, four-digit years from 1900 through next year, allowed statuses, employee requirement for In Use, and bounded optional notes.
- **Saudi-style plates:** reusable white demonstration plate with derived Arabic/Latin letters, matching Arabic-Indic/Western digits, preserved leading zeros, and a narrow KSA / السعودية section. These are stylized sample plates without an official emblem.
- **Bilingual:** visible English / العربية switches, centralized translations, RTL/LTR document direction, locale-aware numbers and Gregorian dates, and translated errors/confirmations/success messages. Switching language keeps records, search, filters, sorting, and unfinished edits.
- **Accessibility:** labeled inputs, visible focus, keyboard navigation, skip link, native modal dialogs, focus wrapping/restoration, Escape cancellation, error descriptions, live announcements, text status indicators, and reduced-motion support.
- **About:** purpose, course, supplied team identities, demo behavior, and AI-assistance disclosure.

The visual system uses deep emerald, warm off-white, charcoal, restrained gold, consistent inline SVG icons, and Arabic-capable Segoe UI/Tahoma/Arial system-font fallbacks. Layouts cover desktop, tablet, and mobile without external visual assets.

## Data behavior

`App` stores the fleet as a collection of JavaScript objects in React state. Six synthetic cars initialize each fresh page load. All sample plates and employee names/assignments are fictional.

```js
{
  id: 'car-4',
  plate: { letters: 'NTA', digits: '0421' },
  make: 'Toyota',
  model: 'Corolla',
  year: 2025,
  status: 'Available', // or 'In Use' / 'Maintenance'
  employee: '',
  notes: ''
}
```

Add/update/delete return new arrays and records; they do not mutate the saved collection. Counts and views derive directly from that collection. **Refreshing restores samples and discards changes.** Tabs do not share records. Only the selected language may persist in local storage (`fleetline-language`); blocked local storage does not prevent app use.

Plate letters are normalized to uppercase with whitespace removed; digits stay strings. Arabic-Indic numeric input is converted while keeping leading zeros. The normalized duplicate key includes the full digit string, so `ABJ:0012` and `ABJ:12` are distinct demo identifiers. Search accepts Latin or mapped Arabic letters and either numeral system, including digit-first or letter-first full-plate queries. Stored statuses are language-independent values; translations are for display.

The exact supplied mapping is:

```text
A=ا B=ب J=ح D=د R=ر S=س X=ص T=ط E=ع
G=ق K=ك L=ل Z=م N=ن H=هـ U=و V=ى
```

“Recently added” follows insertion order; editing a record does not make it a new addition. No fake audit history is generated.

## Scripts and verification

| Command                | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Start the local Vite development server.                              |
| `npm run build`        | Build production assets in `dist/`.                                   |
| `npm run preview`      | Serve the production build locally; run the build first.              |
| `npm run test`         | Run Vitest domain and React UI tests once.                            |
| `npm run test:watch`   | Run Vitest in watch mode.                                             |
| `npm run test:e2e`     | Run headless Playwright browser interactions and capture screenshots. |
| `npm run lint`         | Run the existing ESLint React/hooks rules.                            |
| `npm run format`       | Format application, tests, configuration, HTML, and documentation.    |
| `npm run format:check` | Check formatting without editing files.                               |

Browser tests automatically start and stop a local test server. Windows uses installed Microsoft Edge; other operating systems use Playwright Chromium. If the selected browser is missing, install Edge on Windows, or run `npx playwright install chromium` elsewhere. Tests use local port 5173 and can reuse an existing compatible server. A restricted execution environment may require permission to launch child processes and the headless browser.

Tests cover immutable CRUD, search/filter/sort, all 17 mapped letters, unsupported letters, both numeral systems, leading zeros, normalized duplicates, required fields, years, employee rules, translation parity, UI CRUD, literal rendering of script-like text, language/draft/filter retention, local-storage failure, modal keyboard focus, and responsive RTL/LTR layout. [TEST_RESULTS.md](TEST_RESULTS.md) records actual commands, results, browser coverage, and manual checks still needed.

Browser screenshots are generated locally under ignored `artifacts/`; Playwright failure reports/traces are under ignored `test-results/`. Generated output, dependencies, and coverage are not submission source.

## Architecture and stack

Runtime dependencies are **React / React DOM 19**. **Vite 8** builds the app; development tooling includes ESLint, Prettier, Vitest, jsdom, React Testing Library, user-event, jest-dom, and Playwright. Exact resolved versions are in `package-lock.json`.

```text
src/
  App.jsx                 Saved React state, navigation, dashboard, About, composition
  VehicleList.jsx         Shared responsive table/cards and record actions
  VehicleDialogs.jsx      Add/edit form, details, and delete confirmation
  components.jsx          SVG icons, SaudiPlate, badges, switches, dialogs, empty states
  fleet.js                Immutable collection operations, validation, search, sort, counts
  plate.js                Supplied mapping, normalization, keys, numeral conversions
  i18n.js                 English/Arabic dictionary and locale helpers
  App.css / index.css     Responsive design system, RTL, focus, reduced motion
  App.test.jsx            User-visible component interactions
  fleet.test.js           Domain, plate, validation, translation contracts
  test/setup.js           jsdom setup; real dialogs are also tested in Edge
e2e/fleet.spec.js          Browser CRUD, keyboard, layout, and screenshot checks
```

The saved fleet is owned by `App`; form drafts/errors remain local to the form. Changing language does not remount the form. Validation returns message keys independently of UI language. The plate mapping is the shared source for validation, formatting, and Arabic search. No routing library or global state framework is necessary for the three menu views.

## Phase 2 boundary

Phase 1 includes **no backend implementation or simulated API**. A manually implemented Phase 2 backend can retain the structured record shape and replace collection initialization and the add/update/delete handlers with service calls. Keep plate normalization and validation behavior aligned across client/server, but perform authoritative validation, unique-plate enforcement, authorization, and ID generation on the server. Add asynchronous error/loading states and conflict handling when that backend exists. Backend language, storage, and deployment decisions remain outside this phase.

## Submission documents and AI disclosure

- [REQUIREMENTS.md](REQUIREMENTS.md): requirement-to-implementation mapping.
- [CODE_REVIEW.md](CODE_REVIEW.md): actual security, performance, quality, and reuse findings/fixes and remaining limitations.
- [TEST_RESULTS.md](TEST_RESULTS.md): executed verification and manual checks still needed.
- [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md): complete team roster, public GitHub requirement, and submission of the repository URL by one student.

**AI assisted requirements, design, implementation, documentation, automated tests, and code review.** The students are responsible for reviewing, understanding, and validating the work. Changes were confined to this project folder; existing Java labs were preserved. No commit, push, publication, or deployment was performed.
