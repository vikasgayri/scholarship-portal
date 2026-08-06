package com.scholarhub.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @Email(message = "Enter a valid email address.")
    @NotBlank(message = "Email is required.")
    String email,

    @Pattern(regexp = "\\d{6}", message = "OTP must be 6 digits.")
    @NotBlank(message = "OTP is required.")
    String otp,

    @Size(min = 8, message = "Password must be at least 8 characters.")
    @NotBlank(message = "New password is required.")
    String newPassword) {
}
