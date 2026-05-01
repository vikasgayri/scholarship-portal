package com.scholarhub.api.dto;

import com.scholarhub.api.domain.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusRequest(
    @NotNull(message = "Status is required.")
    ApplicationStatus status,
    String reviewerNote) {
}
