package com.scholarhub.api.dto;

public record DashboardSummaryResponse(
    long totalScholarships,
    long applications,
    long underReview,
    long approved,
    long documents) {
}
