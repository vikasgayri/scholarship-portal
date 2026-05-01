package com.scholarhub.api.dto;

public record AdminOverviewResponse(
    long totalStudents,
    long totalScholarships,
    long totalApplications,
    long pendingDocuments,
    long pendingReviews) {
}
