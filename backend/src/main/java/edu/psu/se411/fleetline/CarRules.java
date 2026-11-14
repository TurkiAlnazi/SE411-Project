package edu.psu.se411.fleetline;

import java.time.Year;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

final class CarRules {
    private static final String LATIN_PLATE_LETTERS = "ABJDRSXTEGKLZNHUV";

    private CarRules() {}

    static Car normalizeAndValidate(String id, CarRequest request, Set<String> statuses) {
        Map<String, String> errors = new LinkedHashMap<>();
        Car.Plate plate = request.plate();
        String letters = clean(plate == null ? null : plate.letters()).replaceAll("(?U)\\s", "")
                .toUpperCase(Locale.ROOT);
        String digits = clean(plate == null ? null : plate.digits());
        String make = clean(request.make());
        String model = clean(request.model());
        String employee = clean(request.employee());
        String notes = clean(request.notes());
        String yearText = clean(request.year());
        int year = yearText.matches("[0-9]{4}") ? Integer.parseInt(yearText) : 0;
        String status = clean(request.status());

        if (!letters.matches("[" + LATIN_PLATE_LETTERS + "]{3}")) errors.put("letters", "errorLetters");
        if (!digits.matches("[0-9]{1,4}")) errors.put("digits", "errorDigits");
        validateRequired(errors, "make", make);
        validateRequired(errors, "model", model);
        if (year < 1900 || year > Year.now().getValue() + 1) errors.put("year", "errorYear");
        if (!statuses.contains(status)) errors.put("status", "errorStatus");
        if ("In Use".equals(status) && employee.isEmpty()) errors.put("employee", "errorEmployee");
        if (employee.length() > 80) errors.put("employee", "errorLength");
        if (notes.length() > 500) errors.put("notes", "errorNotesLength");

        if (!errors.isEmpty()) throw FleetException.invalidCar(errors);
        return new Car(id, new Car.Plate(letters, digits), make, model, year, status, employee, notes);
    }

    static boolean matches(Car car, String query) {
        String text = clean(query).toLowerCase(Locale.ROOT);
        if (text.isEmpty()) return true;
        if (List.of(car.id(), car.make(), car.model(), String.valueOf(car.year()), car.employee(), car.notes())
                .stream().anyMatch(value -> value.toLowerCase(Locale.ROOT).contains(text))) return true;

        String plateQuery = plateSearchText(text);
        return !plateQuery.isEmpty() && (
                plateSearchText(car.plate().letters() + car.plate().digits()).contains(plateQuery)
                        || plateSearchText(car.plate().digits() + car.plate().letters()).contains(plateQuery)
        );
    }

    private static void validateRequired(Map<String, String> errors, String field, String value) {
        if (value.isEmpty()) errors.put(field, "errorRequired");
        else if (value.length() > 60) errors.put(field, "errorLength");
    }

    private static String clean(String value) {
        return value == null ? "" : value.replaceAll("(?U)^\\s+|\\s+$", "");
    }

    private static String plateSearchText(String value) {
        return value.replaceAll("(?U)[\\s:-]", "").toLowerCase(Locale.ROOT);
    }
}
