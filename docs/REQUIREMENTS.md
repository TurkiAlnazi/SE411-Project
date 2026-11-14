# Fleetline Requirements Specification

The [course requirements](../REQUIREMENTS.md) map the assignment to the implemented routes and screens.

## Functional behavior

- View fleet counts and recent additions on the dashboard.
- Add a vehicle and open its details using the generated ID.
- List vehicles on pages, search, filter by status, and sort.
- Update editable vehicle fields without changing the ID.
- Confirm before deleting a vehicle.
- Preserve leading plate zeros and reject a duplicate normalized plate.
- Display the project team on the About page.

## Operating constraints

The application is a local demonstration. It uses fictional vehicles and employee names. The server stores the collection in memory and reloads sample data on restart. The frontend and Java server are both required to run the integrated app.
