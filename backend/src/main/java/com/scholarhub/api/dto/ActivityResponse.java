package com.scholarhub.api.dto;

import java.time.Instant;

public record ActivityResponse(String id, String message, Instant createdAt) {
}
