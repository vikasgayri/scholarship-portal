package com.scholarhub.api.dto;

import com.scholarhub.api.domain.ApplicationStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminApplicationResponse(
    String id,
    String scholarshipId,
    String scholarshipTitle,
    String provider,
    BigDecimal amount,
    String studentId,
    String studentName,
    String studentEmail,
    String phoneNumber,
    String dateOfBirth,
    String course,
    String institution,
    String academicYear,
    String percentage,
    BigDecimal annualIncome,
    String category,
    String caste,
    String addressLine,
    String city,
    String state,
    String pincode,
    String essay,
    ApplicationStatus status,
    String reviewerNote,
    Instant submittedAt,
    Instant updatedAt,
    AdminApplicationUserResponse user,
    List<AdminApplicationDocumentResponse> documents) {
}
