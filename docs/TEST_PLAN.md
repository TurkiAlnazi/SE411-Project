# Fleetline Test Plan

| Scenario                                                  | Expected result                                              | Test layer                   |
| --------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| Create a vehicle with plate `ABK 0077`                    | Server assigns an ID and preserves all four digits           | Service, controller, browser |
| Submit a duplicate plate with spaces or lowercase letters | Server rejects it with `409`; the form remains open          | Service, controller, browser |
| Look up `car-4` and an unknown ID                         | Known ID opens vehicle details; unknown ID returns `404`     | Service, controller, browser |
| Request the first and second pages                        | Each response has distinct records and correct page metadata | Service, controller, browser |
| Update a record and refresh the browser                   | Edited data remains saved under the same ID                  | Service, browser             |
| Cancel and then confirm deletion                          | Cancel keeps the record; confirmation removes it             | Frontend, browser            |
| Use Tab and Escape in a dialog                            | Focus stays inside, then returns to the opener               | Browser                      |
| Open each screen at different widths                      | Content stays within the viewport                            | Browser                      |

See [Part 2 verification](../PART_2_VERIFICATION.md) for the executed results.
