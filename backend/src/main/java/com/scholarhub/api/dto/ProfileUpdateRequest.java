package com.scholarhub.api.dto;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateRequest(
    @NotBlank(message = "Full name is required.")
    String name,

    @NotBlank(message = "Course is required.")
    String course,

    @NotBlank(message = "Phone number is required.")
    String phoneNumber,

    @NotBlank(message = "City is required.")
    String city,

    @NotBlank(message = "State is required.")
    String state) {
}
