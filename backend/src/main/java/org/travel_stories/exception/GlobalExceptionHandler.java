package org.travel_stories.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.travel_stories.common.ApiResponse;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
            ResourceNotFoundException ex) {

        log.warn("Resource not found: {}", ex.getMessage());

        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceAlreadyExistsException(
            ResourceAlreadyExistsException ex) {

        log.warn("Resource already exists: {}", ex.getMessage());

        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(
            BadRequestException ex) {

        log.warn("Bad request: {}", ex.getMessage());

        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidCredentialsException(
            InvalidCredentialsException ex) {

        log.warn("Authentication failed: {}", ex.getMessage());

        return error(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidTokenException(
            InvalidTokenException ex) {

        log.warn("Invalid token request: {}", ex.getMessage());

        return error(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalidOperationException(
            InvalidOperationException ex) {

        log.warn("Invalid operation attempted: {}", ex.getMessage());

        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler({
            ExpiredJwtException.class,
            MalformedJwtException.class,
            SignatureException.class,
            UnsupportedJwtException.class,
            IllegalArgumentException.class
    })
    public ResponseEntity<ApiResponse<Void>> handleJwtException(Exception ex) {

        log.warn("JWT validation failed: {}", ex.getMessage());

        return error(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
            AuthenticationException ex) {

        log.warn("Authentication failed: {}", ex.getMessage());

        return error(HttpStatus.UNAUTHORIZED, "Authentication failed");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex) {

        log.warn("Access denied: {}", ex.getMessage());

        return error(HttpStatus.FORBIDDEN, "Access denied");
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolationException(
            ConstraintViolationException ex) {

        Map<String, String> errors = new LinkedHashMap<>();

        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            errors.put(
                    violation.getPropertyPath().toString(),
                    violation.getMessage()
            );
        }

        log.warn(
                "Constraint validation failed with {} error(s)",
                errors.size()
        );

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new LinkedHashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        log.warn(
                "Validation failed with {} error(s)",
                errors.size()
        );

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Validation failed", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {

        log.error(
                "Unexpected server error occurred",
                ex
        );

        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred"
        );
    }

    private ResponseEntity<ApiResponse<Void>> error(
            HttpStatus status,
            String message) {

        return ResponseEntity
                .status(status)
                .body(ApiResponse.error(message));
    }
}