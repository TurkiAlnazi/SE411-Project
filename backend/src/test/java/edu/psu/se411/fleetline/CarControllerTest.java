package edu.psu.se411.fleetline;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CarControllerTest {
    private static final String CARS = "/api/cars";
    private static final String BODY = """
            {"plate":{"letters":"NTA","digits":"0421"},"make":"Toyota","model":"Corolla",
             "year":"2025","status":"Available","employee":"","notes":""}
            """;
    private static final Car CAR = new Car(
            "car-4", new Car.Plate("NTA", "0421"), "Toyota", "Corolla", 2025, "Available", "", "");

    @Mock CarService service;
    MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new CarController(service))
                .setControllerAdvice(new FleetErrorHandler()).build();
    }

    @Test
    void createReturns201WithLocationAndVehicle() throws Exception {
        when(service.create(any(CarRequest.class))).thenReturn(CAR);
        mvc.perform(post(CARS).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", CARS + "/car-4"))
                .andExpect(jsonPath("$.id").value("car-4"))
                .andExpect(jsonPath("$.plate.digits").value("0421"));
        verify(service).create(argThat(request -> request.plate().digits().equals("0421")));
    }

    @Test
    void returns200ForKnownIdAnd404ForUnknownId() throws Exception {
        when(service.findById("car-4")).thenReturn(CAR);
        when(service.findById("missing")).thenThrow(FleetException.notFound());
        mvc.perform(get(CARS + "/car-4"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.model").value("Corolla"));
        mvc.perform(get(CARS + "/missing"))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("errorMissing"));
    }

    @Test
    void listBindsPageAndReturnsPaginationMetadata() throws Exception {
        when(service.list(1, 2, "Toyota", "Available", "name"))
                .thenReturn(new CarService.CarPage(List.of(CAR), 1, 2, 3, 2));
        mvc.perform(get(CARS).param("page", "1").param("size", "2").param("q", "Toyota")
                        .param("status", "Available").param("sort", "name"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    void listUsesDocumentedDefaultsAndRejectsMalformedPage() throws Exception {
        when(service.list(0, 3, "", "All", "newest"))
                .thenReturn(new CarService.CarPage(List.of(), 0, 3, 0, 0));
        mvc.perform(get(CARS)).andExpect(status().isOk()).andExpect(jsonPath("$.size").value(3));
        mvc.perform(get(CARS).param("page", "word"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("errorQuery"));
        verifyNoMoreInteractions(service);
    }

    @Test
    void updateReturns200AndPassesThePathIdToTheService() throws Exception {
        when(service.update(eq("car-4"), any(CarRequest.class))).thenReturn(CAR);
        mvc.perform(put(CARS + "/car-4").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value("car-4"));
        verify(service).update(eq("car-4"), argThat(request -> request.model().equals("Corolla")));
    }

    @Test
    void mapsValidationAndDuplicateErrorsToJson() throws Exception {
        when(service.create(any(CarRequest.class)))
                .thenThrow(FleetException.invalidCar(Map.of("make", "errorRequired")))
                .thenThrow(FleetException.duplicate());
        mvc.perform(post(CARS).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.make").value("errorRequired"));
        mvc.perform(post(CARS).contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.fields.letters").value("errorDuplicate"));
    }

    @Test
    void malformedJsonDoesNotReachTheService() throws Exception {
        mvc.perform(post(CARS).contentType(MediaType.APPLICATION_JSON).content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("errorValidation"));
        verifyNoInteractions(service);
    }

    @Test
    void deleteReturns204WithoutABody() throws Exception {
        mvc.perform(delete(CARS + "/car-4")).andExpect(status().isNoContent()).andExpect(content().string(""));
        verify(service).delete("car-4");
    }

    @Test
    void summaryHasItsOwnRouteAndReturnsCounts() throws Exception {
        when(service.summary()).thenReturn(new CarService.FleetSummary(Map.of("total", 1), List.of(CAR)));
        mvc.perform(get(CARS + "/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.counts.total").value(1))
                .andExpect(jsonPath("$.recent[0].id").value("car-4"));
        verify(service, never()).findById(anyString());
    }
}
