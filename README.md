# Fleetline

Fleetline manages company cars for **SE411 Software Construction**. Part 2 connects the React interface to a Java Spring Boot 4.0.5 REST API. The server owns the vehicle data and serves three cars per page.

| Team member       | Student ID |
| ----------------- | ---------- |
| Turki Alanazi     | 222211513  |
| Mohammed Alhindi  | 221110784  |
| Faisal Alghubaini | 219211021  |

## Run on Windows

You need a Java **JDK 17 or later** and Node.js 24. Confirm that `java -version`, `javac -version`, and `node -v` work. The included Maven wrapper downloads Maven and the Java dependencies on the first run.

Open two PowerShell terminals at the project root.

**Terminal 1: Java backend**

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Leave Java running at `http://127.0.0.1:8080`. On macOS/Linux, use `./mvnw` instead of `.\mvnw.cmd`.

**Terminal 2: React frontend**

```powershell
npm ci
npm run dev
```

Open the URL printed by Vite, normally [http://localhost:5173](http://localhost:5173). React sends relative `/api` requests. Vite forwards them to the Java server. `npm run preview` uses the same proxy after `npm run build`; keep Java running for either mode.

## Demo

1. Open **Vehicles**. Select **Next** to load the second page from Java and **Previous** to return.
2. In **Record ID**, enter `car-4` and select **Find by ID**. It opens the Toyota Corolla, whose plate is `NTA 0421`. Try `missing-car` to show the not-found message.
3. Add a **Lexus ES**, year **2025**, status **Available**, plate letters **ABK**, digits **0077**. Open its details and copy its generated Record ID.
4. Find the new record by its ID. Edit **ES** to **ES 350** and save. Refresh the browser and look it up again to show the change remains on the running server.
5. Optionally delete the demo car and confirm that the ID returns no result. Restart Java to reset the fleet.

## REST API

The request body for POST and PUT contains the editable vehicle fields. The server assigns an ID on POST and keeps the URL's ID on PUT. Plate digits are strings so leading zeros are preserved.

| Method | Route                     | Behavior                                      | Response           |
| ------ | ------------------------- | --------------------------------------------- | ------------------ |
| POST   | `/api/cars`               | Create a vehicle                              | 201, 400, 409      |
| GET    | `/api/cars/{id}`          | Fetch one vehicle by its exact ID             | 200, 404           |
| GET    | `/api/cars?page=0&size=3` | Return one page with counts                   | 200, 400           |
| PUT    | `/api/cars/{id}`          | Update all editable fields, keeping the ID    | 200, 400, 404, 409 |
| DELETE | `/api/cars/{id}`          | Delete the vehicle (existing Part 1 feature)  | 204, 404           |
| GET    | `/api/cars/summary`       | Fetch total counts and up to four recent cars | 200                |

List defaults: `page=0`, `size=3`, `q=`, `status=All`, and `sort=newest`. Size must be 1–50. Sort may be `newest`, `name`, or `year`. The response has `content`, `page`, `size`, `totalElements` and `totalPages`. Totals are for the matching set. The dashboard total is for the entire fleet.

```json
{
  "plate": { "letters": "ABK", "digits": "0077" },
  "make": "Lexus",
  "model": "ES",
  "year": "2025",
  "status": "Available",
  "employee": "",
  "notes": ""
}
```

## Where to read the code

| File                                        | Role                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| `FleetlineApplication.java`                 | Starts Spring Boot and discovers the application's components.         |
| `Car.java` and `CarRequest.java`            | Define saved data and the fields received from React.                  |
| `CarController.java`                        | Maps HTTP routes to service calls and sets response statuses.          |
| `CarService.java`                           | Creates IDs, checks duplicates, updates records and selects pages.     |
| `CarRules.java`                             | Normalizes plates and years, validates inputs and matches search text. |
| `CarRepository.java`                        | Stores vehicles by ID in an insertion-ordered Java map.                |
| `FleetErrorHandler.java`                    | Returns error codes and field errors for the interface.                |
| `src/api.js` and `vite.config.js`           | Send requests from React and connect Vite to Java.                     |
| `src/App.jsx` and `src/useFleetResource.js` | Display responses, request pages and ignore obsolete requests.         |

Java files are under `backend/src/main/java/edu/psu/se411/fleetline/`. A browser refresh reads the same server data. A **server restart** restores six sample records because the server stores them in memory. The application uses no database.

## Verification commands

```powershell
cd backend
.\mvnw.cmd verify
cd ..
npm ci
npm test
npm run lint
npm run build
npm run test:e2e
```

JUnit and Mockito cover service and controller behavior. MockMvc verifies route binding, JSON and status codes. Repository tests exercise the real in-memory storage. The browser tests start their own packaged Java server and Vite on separate ports; run Maven `verify` first. They use installed Edge on Windows. For other platforms, run `npx playwright install chromium` or set `FLEETLINE_CHROMIUM_PATH` to an installed browser executable.

## Project documents

- [Implementation guide](PART_2_GUIDE.md): explains each operation, the code layers, and the demo.
- [Verification results](PART_2_VERIFICATION.md): Java, React, and browser test results.
- [Project report](docs/Fleetline-Project-Documentation.docx): architecture, validation, and REST routes.
- [Presentation](docs/Fleetline-Part-2.pptx): architecture and REST routes, with speaker notes.
