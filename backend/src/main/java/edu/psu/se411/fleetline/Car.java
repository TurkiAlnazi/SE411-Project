package edu.psu.se411.fleetline;

// The same JSON structure is used by the existing React vehicle components.
public record Car(
        String id, Plate plate, String make, String model, int year,
        String status, String employee, String notes
) {
    public record Plate(String letters, String digits) {
        String key() {
            return letters + ":" + digits;
        }
    }
}
