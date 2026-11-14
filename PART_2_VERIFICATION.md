# Fleetline Part 2 Verification

The checks below ran on 13 November 2026 against the updated Fleetline application. The environment used Node.js 24.22.1, Maven 3.9.11, and JDK 21 with Java 17 as the compilation target.

| Check                              | Result                                                         |
| ---------------------------------- | -------------------------------------------------------------- |
| Maven `clean verify`               | 22 tests passed. The Spring Boot JAR was built.                |
| `npm test`                         | 72 tests passed in two files.                                  |
| `npm run test:e2e`                 | Five browser tests passed against the running Spring Boot API. |
| `npm run lint` and `npm run build` | Passed.                                                        |

The Java suite contains 11 service tests with a Mockito repository, nine controller tests using Mockito and MockMvc, and two tests of the in-memory repository. The service tests cover create and update, exact ID lookup, pagination, search and sort, missing IDs, duplicate plates, and invalid inputs. The controller tests verify the routes, JSON bodies, and response statuses.

The browser suite checks adding and editing a car, finding it by ID, loading a distinct page from Java, retaining saved edits after refresh, deleting a car, and validating duplicate plates. It also checks keyboard focus in dialogs and layout at mobile, tablet, and desktop widths.

See the [test plan](docs/TEST_PLAN.md) for case details and the [README](README.md#verification-commands) for the commands to reproduce the results.
