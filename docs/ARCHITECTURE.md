# Architecture — Fleetline

## Overview
Fleetline is a single-page React frontend built and served by Vite. It keeps the vehicle collection in React state and delegates data operations to pure JavaScript functions.

## Layers
1. **Presentation:** `App.jsx`, `VehicleList.jsx`, `VehicleDialogs.jsx`, `components.jsx`.
2. **Domain logic:** `fleet.js` and `plate.js`.
3. **Localization:** `i18n.js`.
4. **Styling:** `App.css` and `index.css`.
5. **Quality tooling:** Vitest, Testing Library, Playwright, ESLint, and Prettier.

## Data Flow
1. The app initializes the vehicle list from `initialCars`.
2. User actions open forms/details/confirmation dialogs.
3. The form validates through domain functions and calls save operations.
4. `saveCar` normalizes and trims values and returns a new collection.
5. React state updates the dashboard counts and visible results.
6. Search, status filter, and sorting derive the visible list from current state.
7. Language selection updates translations, document `lang`/`dir`, title, and local-storage preference.

## Persistence
Vehicle data is held in memory only. The language preference is stored in `localStorage` under `fleetline-language`, with errors handled if browser storage is blocked.

## Key Design Decisions
- Separate plate letters and digits to preserve leading zeroes.
- Normalize plate values before duplicate checks.
- Use immutable operations to avoid mutating the original collection.
- Keep translations in a central dictionary with matching English/Arabic keys.
- Keep the domain logic independent of the UI for focused testing.
