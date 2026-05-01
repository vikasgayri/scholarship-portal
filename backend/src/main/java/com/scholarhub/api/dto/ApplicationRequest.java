package com.scholarhub.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ApplicationRequest(
    @NotBlank(message = "Scholarship selection is required.")
    String scholarshipId,

    @NotBlank(message = "Full name is required.")
    String fullName,

    @NotBlank(message = "Phone number is required.")
    @Pattern(regexp = "^[0-9+\\-\\s]{10,15}$", message = "Enter a valid phone number.")
    String phoneNumber,

    @NotBlank(message = "Date of birth is required.")
    String dateOfBirth,

    @NotBlank(message = "Course is required.")
    String course,

    @NotBlank(message = "Institution is required.")
    String institution,

    @NotBlank(message = "Academic year is required.")
    String academicYear,

    @NotBlank(message = "Percentage or CGPA is required.")
    String percentage,

    @NotNull(message = "Annual family income is required.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Annual family income must be greater than zero.")
    BigDecimal annualIncome,

    @NotBlank(message = "Category is required.")
    String category,

    @NotBlank(message = "Caste/community is required.")
    String caste,

    @NotBlank(message = "Address is required.")
    String addressLine,

    @NotBlank(message = "City is required.")
    String city,

    @NotBlank(message = "State is required.")
    String state,

    @NotBlank(message = "PIN code is required.")
    @Pattern(regexp = "^[0-9]{5,6}$", message = "Enter a valid PIN code.")
    String pincode,

    @NotBlank(message = "Statement of purpose is required.")
    @Size(min = 80, message = "Statement of purpose must be at least 80 characters.")
    String essay) {
}
