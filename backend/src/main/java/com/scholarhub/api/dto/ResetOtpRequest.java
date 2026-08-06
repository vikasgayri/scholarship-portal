package com.scholarhub.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetOtpRequest(
    @Email(message = "Enter a valid email address.")
    @NotBlank(message = "Email is required.")
    String email,

    @Pattern(regexp = "\\d{6}", message = "OTP must be 6 digits.")
    @NotBlank(message = "OTP is required.")
    String otp) {
}
