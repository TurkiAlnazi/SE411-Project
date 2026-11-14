package edu.psu.se411.fleetline;

// The server assigns the ID on create and takes it from the URL on update.
public record CarRequest(
        Car.Plate plate, String make, String model, String year,
        String status, String employee, String notes
) {}
