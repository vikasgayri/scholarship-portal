package com.scholarhub.api.dto;

import com.scholarhub.api.domain.DocumentStatus;
import java.time.Instant;

public record DocumentResponse(
    String id,
    String userId,
    String applicationId,
    String name,
    String storedFileName,
    String filePath,
    String category,
    String contentType,
    long size,
    DocumentStatus status,
    Instant uploadedAt) {
}
