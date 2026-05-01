package com.scholarhub.api.dto;

import com.scholarhub.api.domain.ScholarshipStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ScholarshipResponse(
    String id,
    String title,
    String provider,
    String description,
    String eligibility,
    String category,
    BigDecimal amount,
    Integer seats,
    LocalDate deadline,
    ScholarshipStatus status,
    boolean featured,
    String location) {
}
