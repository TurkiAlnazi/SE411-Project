package edu.psu.se411.fleetline;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class CarService {
    private static final Set<String> STATUSES = Set.of("Available", "In Use", "Maintenance");
    private static final Set<String> SORTS = Set.of("newest", "name", "year");
    private final CarRepository repository;

    public CarService(CarRepository repository) {
        this.repository = repository;
    }

    public Car findById(String id) {
        return repository.findById(id).orElseThrow(FleetException::notFound);
    }

    // Lock the duplicate check and write together so concurrent requests cannot save the same plate.
    public synchronized Car create(CarRequest request) {
        return repository.save(validatedCar("car-" + UUID.randomUUID(), request));
    }

    public synchronized Car update(String id, CarRequest request) {
        findById(id);
        return repository.save(validatedCar(id, request));
    }

    public synchronized void delete(String id) {
        if (!repository.delete(id)) {
            throw FleetException.notFound();
        }
    }

    public CarPage list(int page, int size, String query, String status, String sort) {
        if (page < 0 || size < 1 || size > 50 || query.length() > 160
                || (!"All".equals(status) && !STATUSES.contains(status)) || !SORTS.contains(sort)) {
            throw FleetException.invalidQuery();
        }

        // Filter and order the full fleet before slicing. Search covers every page.
        List<Car> matches = new ArrayList<>();
        for (Car car : repository.findAll()) {
            if (("All".equals(status) || car.status().equals(status)) && CarRules.matches(car, query)) {
                matches.add(car);
            }
        }
        Collections.reverse(matches);
        if ("name".equals(sort)) {
            matches.sort(Comparator.comparing(car -> (car.make() + " " + car.model()).toLowerCase(Locale.ROOT)));
        } else if ("year".equals(sort)) {
            matches.sort(Comparator.comparingInt(Car::year).reversed());
        }

        int total = matches.size();
        int from = (int) Math.min((long) page * size, total);
        int to = (int) Math.min((long) from + size, total);
        int totalPages = total == 0 ? 0 : (total - 1) / size + 1;
        return new CarPage(List.copyOf(matches.subList(from, to)), page, size, total, totalPages);
    }

    public FleetSummary summary() {
        List<Car> cars = repository.findAll();
        List<Car> recent = new ArrayList<>(cars);
        Collections.reverse(recent);
        Map<String, Integer> counts = new LinkedHashMap<>();
        counts.put("total", cars.size());
        for (String status : List.of("Available", "In Use", "Maintenance")) {
            counts.put(status, (int) cars.stream().filter(car -> car.status().equals(status)).count());
        }
        return new FleetSummary(counts, List.copyOf(recent.subList(0, Math.min(4, recent.size()))));
    }

    private Car validatedCar(String id, CarRequest request) {
        Car car = CarRules.normalizeAndValidate(id, request, STATUSES);
        boolean duplicate = repository.findAll().stream()
                .anyMatch(other -> !id.equals(other.id()) && car.plate().key().equals(other.plate().key()));
        if (duplicate) {
            throw FleetException.duplicate();
        }
        return car;
    }

    public record CarPage(List<Car> content, int page, int size, int totalElements, int totalPages) {}

    public record FleetSummary(Map<String, Integer> counts, List<Car> recent) {}
}
