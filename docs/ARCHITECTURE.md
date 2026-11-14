# Fleetline Architecture

The React interface sends requests through `src/api.js`. During local development, Vite forwards the `/api` path to Java on port 8080. `CarController` maps each request to a `CarService` method. The service checks the request and uses `CarRepository` to read or change a car.

| Layer             | Responsibilities                                                                      |
| ----------------- | ------------------------------------------------------------------------------------- |
| React             | Shows the dashboard, forms, and pages returned by the server.                         |
| API client        | Sends HTTP requests and reads JSON responses.                                         |
| Spring controller | Binds routes and parameters and returns the appropriate HTTP status.                  |
| Service           | Validates inputs, checks duplicate plates, and filters, sorts, and paginates results. |
| Repository        | Stores records by ID in an insertion-ordered map.                                     |

A browser refresh does not clear server data. Restarting the server reloads the original six sample vehicles.
