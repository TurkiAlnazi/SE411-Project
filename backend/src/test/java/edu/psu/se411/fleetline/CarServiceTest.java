package edu.psu.se411.fleetline;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarServiceTest {
    @Mock CarRepository repository;
    @InjectMocks CarService service;

    private static final Car CAMRY = new Car(
            "car-1", new Car.Plate("ABJ", "1234"), "Toyota", "Camry", 2024, "Available", "", "");
    private static final Car COROLLA = new Car(
            "car-4", new Car.Plate("NTA", "0421"), "Toyota", "Corolla", 2025, "Available", "", "");
    private static final Car EXPLORER = new Car(
            "car-3", new Car.Plate("GKH", "9012"), "Ford", "Explorer", 2025, "Maintenance", "", "");

    private CarRequest request(String letters, String digits) {
        return new CarRequest(new Car.Plate(letters, digits), " Lexus ", " ES ", "2024",
                "Available", " ", "Demo");
    }

    @Test
    void createsAnIdAndSavesNormalizedDataWithoutLosingLeadingZeros() {
        when(repository.findAll()).thenReturn(List.of(CAMRY));
        when(repository.save(any(Car.class))).thenAnswer(call -> call.getArgument(0));
        Car created = service.create(request(" ab k ", " 0077 "));
        assertTrue(created.id().startsWith("car-"));
        assertEquals(new Car.Plate("ABK", "0077"), created.plate());
        assertEquals("Lexus", created.make());
        assertEquals("", created.employee());
        verify(repository).save(created);
    }

    @Test
    void rejectsANormalizedDuplicateWithoutSaving() {
        when(repository.findAll()).thenReturn(List.of(CAMRY));
        FleetException error = assertThrows(FleetException.class,
                () -> service.create(request(" a b j ", " 1234 ")));
        assertEquals(HttpStatus.CONFLICT, error.status);
        assertEquals("errorDuplicate", error.fields.get("letters"));
        verify(repository, never()).save(any());
    }

    @Test
    void collectsValidationErrorsBeforeAccessingStorage() {
        CarRequest bad = new CarRequest(new Car.Plate("XYZ", "12x"), " ", "", "1800",
                "In Use", "", "n".repeat(501));
        FleetException error = assertThrows(FleetException.class, () -> service.create(bad));
        assertEquals(HttpStatus.BAD_REQUEST, error.status);
        assertEquals(7, error.fields.size());
        assertEquals("errorEmployee", error.fields.get("employee"));
        assertEquals("errorYear", error.fields.get("year"));
        assertEquals("errorNotesLength", error.fields.get("notes"));
        verifyNoInteractions(repository);
    }

    @Test
    void findsTheExactId() {
        when(repository.findById("car-4")).thenReturn(Optional.of(COROLLA));
        assertSame(COROLLA, service.findById("car-4"));
        verify(repository).findById("car-4");
    }

    @Test
    void reportsAMissingIdAndDoesNotUpsert() {
        when(repository.findById("missing")).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(FleetException.class, () -> service.findById("missing")).status);
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(FleetException.class, () -> service.update("missing", request("ABK", "0077"))).status);
        verify(repository, never()).save(any());
    }

    @Test
    void updatesWithTheSameIdAndAllowsTheExistingPlate() {
        when(repository.findById(CAMRY.id())).thenReturn(Optional.of(CAMRY));
        when(repository.findAll()).thenReturn(List.of(CAMRY, COROLLA));
        when(repository.save(any(Car.class))).thenAnswer(call -> call.getArgument(0));
        Car changed = service.update(CAMRY.id(), request("ABJ", "1234"));
        ArgumentCaptor<Car> saved = ArgumentCaptor.forClass(Car.class);
        verify(repository).save(saved.capture());
        assertEquals(CAMRY.id(), saved.getValue().id());
        assertEquals(CAMRY.plate(), saved.getValue().plate());
        assertEquals("ES", changed.model());
    }

    @Test
    void returnsDistinctPagesAndTotalsFromTheFullFilteredSet() {
        when(repository.findAll()).thenReturn(List.of(CAMRY, EXPLORER, COROLLA));
        var first = service.list(0, 2, "", "All", "newest");
        var second = service.list(1, 2, "", "All", "newest");
        assertEquals(List.of(COROLLA, EXPLORER), first.content());
        assertEquals(List.of(CAMRY), second.content());
        assertEquals(3, second.totalElements());
        assertEquals(2, second.totalPages());
        assertEquals(1, second.page());

        var filtered = service.list(0, 1, "Toyota", "Available", "name");
        assertEquals(List.of(CAMRY), filtered.content());
        assertEquals(2, filtered.totalElements());
        assertEquals(List.of(COROLLA), service.list(0, 3, "0421 N T A", "All", "newest").content());
        assertEquals(List.of(COROLLA), service.list(0, 3, "car-4", "All", "newest").content());
        assertEquals(List.of(COROLLA, EXPLORER, CAMRY), service.list(0, 3, "", "All", "year").content());
    }

    @Test
    void handlesEmptyAndOutOfRangePagesWithoutOverflow() {
        when(repository.findAll()).thenReturn(List.of(CAMRY));
        var pastEnd = service.list(Integer.MAX_VALUE, 50, "", "All", "newest");
        assertTrue(pastEnd.content().isEmpty());
        assertEquals(1, pastEnd.totalPages());
        var empty = service.list(0, 3, "no such car", "All", "newest");
        assertEquals(0, empty.totalElements());
        assertEquals(0, empty.totalPages());
    }

    @Test
    void rejectsInvalidPageSizeStatusAndSort() {
        assertThrows(FleetException.class, () -> service.list(-1, 3, "", "All", "newest"));
        assertThrows(FleetException.class, () -> service.list(0, 51, "", "All", "newest"));
        assertThrows(FleetException.class, () -> service.list(0, 3, "", "Invalid", "newest"));
        assertThrows(FleetException.class, () -> service.list(0, 3, "", "All", "other"));
        verifyNoInteractions(repository);
    }

    @Test
    void calculatesDashboardFromAllRecords() {
        when(repository.findAll()).thenReturn(List.of(CAMRY, EXPLORER, COROLLA));
        var summary = service.summary();
        assertEquals(3, summary.counts().get("total"));
        assertEquals(2, summary.counts().get("Available"));
        assertEquals(0, summary.counts().get("In Use"));
        assertEquals(List.of(COROLLA, EXPLORER, CAMRY), summary.recent());
    }

    @Test
    void deletesAnExistingRecordAndReportsAnUnknownRecord() {
        when(repository.delete("car-1")).thenReturn(true);
        when(repository.delete("missing")).thenReturn(false);
        assertDoesNotThrow(() -> service.delete("car-1"));
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(FleetException.class, () -> service.delete("missing")).status);
        verify(repository).delete("car-1");
    }
}
