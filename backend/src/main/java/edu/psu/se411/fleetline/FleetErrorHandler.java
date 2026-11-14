package edu.psu.se411.fleetline;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@RestControllerAdvice
public class FleetErrorHandler {
    @ExceptionHandler(FleetException.class)
    public ResponseEntity<ApiError> handleFleetError(FleetException error) {
        return ResponseEntity.status(error.status).body(new ApiError(error.code, error.getMessage(), error.fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleInvalidBody() {
        return ResponseEntity.badRequest()
                .body(new ApiError("errorValidation", "Invalid or missing JSON body.", Map.of()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleInvalidQuery() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiError("errorQuery", "Invalid query parameter type.", Map.of()));
    }

    public record ApiError(String code, String message, Map<String, String> fields) {}
}
