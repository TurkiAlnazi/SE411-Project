# Fleetline Part 2 Requirements

| Course requirement                                  | Implementation                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Build a Java Spring server and connect it to Part 1 | Spring Boot serves the vehicle API. The React interface calls it through the Vite proxy during local development. |
| Add a vehicle                                       | The Add vehicle form sends `POST /api/cars`. Spring assigns an ID and returns the saved record.                   |
| Search for an element by ID                         | The Record ID form sends `GET /api/cars/{id}` and displays the matching record.                                   |
| Display paginated results                           | `GET /api/cars?page=0&size=3` returns one page and the total number of matching records and pages.                |
| Update an element                                   | The edit form sends `PUT /api/cars/{id}`. The server validates the changes and keeps the ID.                      |
| Test the backend with JUnit and Mockito             | Service, controller, and repository tests run with Maven.                                                         |
| Submit a public GitHub repository                   | One student submits the project link for the team.                                                                |
| Prepare two slides and a demo                       | The slides show architecture and REST routes. The guide includes a live demonstration.                            |

The interface also supports free-text search, status filters, sorting, delete confirmation, and a dashboard summary. See [verification](PART_2_VERIFICATION.md) for the tests that cover the requirements.
