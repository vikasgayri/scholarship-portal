package com.scholarhub.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Full name is required.")
    String name,

    @Email(message = "Enter a valid email address.")
    @NotBlank(message = "Email is required.")
    String email,

    @Size(min = 6, message = "Password must be at least 6 characters.")
    String password,

    @NotBlank(message = "Course is required.")
    String course,

    @NotBlank(message = "Phone number is required.")
    String phoneNumber,

    @NotBlank(message = "City is required.")
    String city,

    @NotBlank(message = "State is required.")
    String state) {
}
