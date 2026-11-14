package edu.psu.se411.fleetline;

import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CarRepository {
    // Replacing an entry preserves its insertion order. The latest additions are at the end.
    private final Map<String, Car> cars = new LinkedHashMap<>();

    public CarRepository() {
        seed("car-1", "ABJ", "1234", "Toyota", "Camry", 2024, "In Use", "Rami Alnour");
        seed("car-2", "DRS", "5678", "Hyundai", "Sonata", 2023, "Available", "");
        seed("car-3", "GKH", "9012", "Ford", "Explorer", 2025, "Maintenance", "");
        seed("car-4", "NTA", "0421", "Toyota", "Corolla", 2025, "Available", "");
        seed("car-5", "BLD", "2846", "Nissan", "Altima", 2024, "In Use", "Lina Alward");
        seed("car-6", "RVE", "7350", "Kia", "K5", 2025, "Available", "");
    }

    private void seed(String id, String letters, String digits, String make, String model,
                      int year, String status, String employee) {
        save(new Car(id, new Car.Plate(letters, digits), make, model, year, status, employee, ""));
    }

    public synchronized List<Car> findAll() {
        return List.copyOf(cars.values());
    }

    public synchronized Optional<Car> findById(String id) {
        return Optional.ofNullable(cars.get(id));
    }

    public synchronized Car save(Car car) {
        cars.put(car.id(), car);
        return car;
    }

    public synchronized boolean delete(String id) {
        return cars.remove(id) != null;
    }
}
