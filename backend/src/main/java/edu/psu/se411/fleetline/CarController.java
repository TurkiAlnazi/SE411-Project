package edu.psu.se411.fleetline;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/cars")
public class CarController {
    private final CarService service;

    public CarController(CarService service) {
        this.service = service;
    }

    @GetMapping
    public CarService.CarPage list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "All") String status,
            @RequestParam(defaultValue = "newest") String sort
    ) {
        return service.list(page, size, q, status, sort);
    }

    @GetMapping("/summary")
    public CarService.FleetSummary summary() {
        return service.summary();
    }

    @GetMapping("/{id}")
    public Car findById(@PathVariable String id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<Car> create(@RequestBody CarRequest request) {
        Car car = service.create(request);
        return ResponseEntity.created(URI.create("/api/cars/" + car.id())).body(car);
    }

    @PutMapping("/{id}")
    public Car update(@PathVariable String id, @RequestBody CarRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
