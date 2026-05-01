package com.scholarhub.api.dto;

import com.scholarhub.api.domain.ScholarshipStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ScholarshipRequest(
    @NotBlank(message = "Title is required.")
    String title,

    @NotBlank(message = "Provider is required.")
    String provider,

    @NotBlank(message = "Description is required.")
    String description,

    @NotBlank(message = "Eligibility is required.")
    String eligibility,

    @NotBlank(message = "Category is required.")
    String category,

    @NotNull(message = "Amount is required.")
    @DecimalMin(value = "1.0", message = "Amount must be greater than zero.")
    BigDecimal amount,

    @NotNull(message = "Seats are required.")
    @Min(value = 1, message = "Seats must be at least 1.")
    Integer seats,

    @NotNull(message = "Deadline is required.")
    @FutureOrPresent(message = "Deadline must be today or in the future.")
    LocalDate deadline,

    @NotNull(message = "Status is required.")
    ScholarshipStatus status,

    boolean featured,

    @NotBlank(message = "Location is required.")
    String location) {
}
