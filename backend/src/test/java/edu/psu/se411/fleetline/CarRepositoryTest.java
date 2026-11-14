package edu.psu.se411.fleetline;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CarRepositoryTest {
    @Test
    void seedDataUsesSixDistinctIdsAndPreservesPlateZeros() {
        var repository = new CarRepository();
        var cars = repository.findAll();
        assertEquals(6, cars.size());
        assertEquals(6L, cars.stream().map(Car::id).distinct().count());
        assertEquals("0421", repository.findById("car-4").orElseThrow().plate().digits());
        assertThrows(UnsupportedOperationException.class, () -> cars.clear());
    }

    @Test
    void replacingAnEntryPreservesOrderAndPreviouslyReadSnapshots() {
        var repository = new CarRepository();
        var snapshot = repository.findAll();
        var replacement = new Car("car-1", new Car.Plate("ABJ", "1234"), "Toyota", "Camry",
                2024, "Maintenance", "", "");
        repository.save(replacement);
        assertEquals("In Use", snapshot.get(0).status());
        assertEquals(replacement, repository.findAll().get(0));
        assertEquals(List.of("car-2", "car-3", "car-4", "car-5", "car-6"),
                repository.findAll().subList(1, 6).stream().map(Car::id).toList());
        assertTrue(repository.delete("car-1"));
        assertFalse(repository.delete("car-1"));
        assertTrue(repository.findById("car-1").isEmpty());
    }
}
