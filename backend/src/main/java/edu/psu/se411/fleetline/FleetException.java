package edu.psu.se411.fleetline;

import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

final class FleetException extends RuntimeException {
    final HttpStatus status;
    final String code;
    final Map<String, String> fields;

    private FleetException(HttpStatus status, String code, String message, Map<String, String> fields) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = Collections.unmodifiableMap(new LinkedHashMap<>(fields));
    }

    static FleetException notFound() {
        return new FleetException(HttpStatus.NOT_FOUND, "errorMissing", "Vehicle not found.", Map.of());
    }

    static FleetException invalidQuery() {
        return new FleetException(HttpStatus.BAD_REQUEST, "errorQuery",
                "Invalid pagination, search, status or sort parameter.", Map.of());
    }

    static FleetException invalidCar(Map<String, String> fields) {
        return new FleetException(HttpStatus.BAD_REQUEST, "errorValidation", "Invalid vehicle.", fields);
    }

    static FleetException duplicate() {
        return new FleetException(HttpStatus.CONFLICT, "errorDuplicate", "Plate already registered.",
                Map.of("letters", "errorDuplicate"));
    }
}
