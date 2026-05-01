package com.scholarhub.api.config;

import com.scholarhub.api.dto.ApiResponse;
import com.scholarhub.api.service.ApiException;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException exception) {
    return ResponseEntity.status(exception.getStatus()).body(
        ApiResponse.error(exception.getMessage(), List.of(exception.getMessage())));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Void>> handleValidationException(
      MethodArgumentNotValidException exception) {
    List<String> details = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> error.getDefaultMessage())
        .toList();

    return ResponseEntity.badRequest().body(
        ApiResponse.error("Validation failed.", details));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
      ConstraintViolationException exception) {
    return ResponseEntity.badRequest().body(
        ApiResponse.error(
            "Validation failed.",
            exception.getConstraintViolations().stream()
                .map(violation -> violation.getMessage())
                .toList()));
  }

  @ExceptionHandler(MaxUploadSizeExceededException.class)
  public ResponseEntity<ApiResponse<Void>> handleUploadSize(MaxUploadSizeExceededException exception) {
    return ResponseEntity.badRequest().body(
        ApiResponse.error("Upload failed.", List.of("File size must not exceed 5 MB.")));
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException exception) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
        ApiResponse.error("Invalid email or password.", List.of("Invalid email or password.")));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception exception) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        ApiResponse.error(
            "Something went wrong. Please try again.",
            List.of("Something went wrong. Please try again.")));
  }
}
