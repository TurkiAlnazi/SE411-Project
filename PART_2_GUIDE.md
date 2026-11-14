# Fleetline Part 2 Guide

Fleetline is a React application for managing company cars. The browser displays the dashboard, forms, and vehicle list. A Java Spring Boot server owns the vehicle records and handles requests to read or change them.

## Follow one request

Enter `car-4` in **Record ID** and select **Find by ID**.

1. The lookup form in `src/App.jsx` passes the ID to `fleetApi.find()`.
2. `src/api.js` sends `GET /api/cars/car-4`. The local Vite proxy forwards the request to Java on port 8080.
3. `CarController` matches the route and calls `CarService.findById("car-4")`.
4. `CarRepository` looks up the ID in a map. Spring returns the Toyota Corolla as JSON with status `200`.
5. React opens the vehicle details dialog. If the ID is missing, the server returns `404` and the form shows a message.

A record ID identifies a car in the system. For example, `car-4` is the ID and `NTA 0421` is the license plate. Changing the plate does not change the ID.

## What each file does

| File or module                                 | Responsibility                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `FleetlineApplication.java`                    | Starts Spring Boot.                                                            |
| `Car.java`                                     | Defines a stored vehicle and its plate fields.                                 |
| `CarRequest.java`                              | Defines the editable fields the browser sends.                                 |
| `CarController.java`                           | Maps each HTTP method and path to a service operation.                         |
| `CarService.java`                              | Generates IDs, prevents duplicate plates, applies changes, and returns pages.  |
| `CarRules.java`                                | Normalizes inputs, validates vehicle fields, and matches search text.          |
| `CarRepository.java`                           | Stores vehicle records by ID and preserves their insertion order.              |
| `FleetException.java`                          | Defines expected failures, including missing vehicles and duplicate plates.    |
| `FleetErrorHandler.java`                       | Converts those failures into HTTP responses with error codes and field errors. |
| `src/api.js`                                   | Sends requests and reads JSON from Spring.                                     |
| `src/useFleetResource.js`                      | Loads dashboard or list data and cancels stale requests.                       |
| `src/App.jsx`                                  | Manages navigation, filters, pages, and the current dialog.                    |
| `src/VehicleDialogs.jsx`                       | Handles vehicle forms, details, and delete confirmation.                       |
| `src/VehicleList.jsx` and `src/components.jsx` | Render the vehicle list, plates, status badges, and dialogs.                   |
| `src/labels.js`                                | Keeps English labels and messages in one place.                                |
| `src/plate.js`                                 | Normalizes plate letters and preserves plate digits as text.                   |
| `vite.config.js`                               | Sends local `/api` requests to the running Java server.                        |
| `backend/pom.xml`                              | Declares dependencies and the Maven build.                                     |
| `backend/mvnw.cmd`                             | Runs the Maven wrapper on Windows.                                             |

Java source is in `backend/src/main/java/edu/psu/se411/fleetline/`.

## What happens during each operation

| Action         | Request                       | What the server does                                                                                        |
| -------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Add vehicle    | `POST /api/cars`              | Validates the body, checks for duplicate plates, generates an ID, and returns the saved vehicle with `201`. |
| Find by ID     | `GET /api/cars/{id}`          | Looks up an exact ID. Returns the vehicle with `200` or an error with `404`.                                |
| List vehicles  | `GET /api/cars?page=0&size=3` | Filters and sorts all matching cars, then returns three records and the page totals.                        |
| Save changes   | `PUT /api/cars/{id}`          | Checks that the ID exists, validates the changes, and saves them under the same ID.                         |
| Delete vehicle | `DELETE /api/cars/{id}`       | Removes the specified vehicle after the user confirms. Returns `204` without a response body.               |
| Open Dashboard | `GET /api/cars/summary`       | Returns total counts by status and the four most recently added cars.                                       |

**Plate validation.** The form and server check the supported letters, numeric digits, required fields, model year, and employee assignment. The server checks duplicates after normalization. For example, `a b k` becomes `ABK`; `0077` stays `0077` because the digits are stored as a string.

**Pagination.** For seven matching cars and a page size of three, API page `0` contains three cars, page `1` contains three, and page `2` contains one. The interface displays these as pages 1, 2, and 3. The list endpoint also accepts a search query, status filter, and sort option. Spring applies them before selecting the page, so search covers the full fleet.

**Storage.** The repository uses a Java `LinkedHashMap`. Changes remain visible after a browser refresh while Java is running. Restarting the backend loads the six sample cars again.

## What the tests check

- **JUnit** runs the Java tests. The repository tests use the real map and verify storage, order, and deletion.
- **Mockito** substitutes the repository in service tests and the service in controller tests. This isolates the logic in the layer under test.
- **MockMvc** checks controller URLs, parameters, JSON, and HTTP statuses without starting a network server.
- **Vitest and Testing Library** check form behavior, validation, pagination controls, and errors in React.
- **Playwright** opens the site in a browser against the running Java server. One test adds a car, edits it, refreshes the page, and checks that the edit remains.

## Presentation and demonstration

Slide 1 shows the React interface, the Java server, and the controller, service, and repository inside it. Slide 2 lists the REST routes and HTTP responses. One suggested split is for Turki to introduce React and the request flow, Mohammed to explain the server layers, and Faisal to cover the routes and run the demo.

1. Open **Vehicles** and select **Next** to show the next server page.
2. Enter `car-4` in **Record ID** and select **Find by ID**.
3. Add a **Lexus ES**, year **2025**, plate **ABK 0077**, with status **Available**.
4. Open its details and copy the generated Record ID. Use **Find by ID** to open the same record.
5. Edit the model to **ES 350**, save, and refresh the browser. Search by the same ID to show the update is still saved.

## Questions to prepare for

| Question                                    | Answer                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Why do you have a controller and a service? | The controller handles HTTP. The service handles vehicle rules and can be tested independently.                  |
| Why keep plate digits as text?              | A number would drop the leading zeros in a plate such as `0077`.                                                 |
| How is a duplicate plate detected?          | Normalize the letters and digits, then compare with other vehicles. On edit, exclude the current ID.             |
| How can you prove the server paginates?     | Selecting Next sends a new `page` value. Each response contains at most three cars and includes the total pages. |
| What do 400, 404, and 409 mean?             | Invalid input, missing record, and a duplicate plate, respectively.                                              |
| What happens on refresh or restart?         | A browser refresh reloads saved server data. A server restart restores the sample fleet.                         |

For submission, one member of the three-student team submits the public GitHub repository link. Prepare the two slides and the live demo before presenting.
