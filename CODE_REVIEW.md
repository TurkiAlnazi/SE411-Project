# Fleetline Code Review

| Area                          | Review finding                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ownership of vehicle data     | Java owns the saved collection. React reads it through the API and reloads the page data after a successful write.                                |
| Input validation              | The service checks required fields, limits, model year, vehicle status, and employee assignment. The server enforces normalized plate uniqueness. |
| Duplicate checks during edits | The service excludes the current record from the comparison, so a vehicle can retain its existing plate.                                          |
| Pagination                    | The server applies search, filters, and sort before selecting a page. The response includes counts for the matching set.                          |
| Request ordering              | The interface cancels an obsolete list request when page or search options change.                                                                |
| Error handling                | Missing records, invalid inputs, and duplicate plates return structured errors. An unsuccessful save leaves the form open.                        |
| Keyboard access               | Dialogs label inputs, support Escape, and restore focus to the opener after closing.                                                              |

The backend stores data in memory and is intended for local use with fictional records. Production deployment would require persistent storage, authentication, and authorization. See [test results](PART_2_VERIFICATION.md).
