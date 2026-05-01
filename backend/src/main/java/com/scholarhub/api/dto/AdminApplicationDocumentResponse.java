package com.scholarhub.api.dto;

import com.scholarhub.api.domain.DocumentStatus;
import java.time.Instant;

public record AdminApplicationDocumentResponse(
    String id,
    String name,
    String type,
    String fileUrl,
    String storedFileName,
    String category,
    String contentType,
    DocumentStatus status,
    Instant uploadedAt,
    String uploadedBy) {
}
