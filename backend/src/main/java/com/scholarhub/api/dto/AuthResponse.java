package com.scholarhub.api.dto;

import java.time.Instant;

public record AuthResponse(
    String token,
    String tokenType,
    Instant expiresAt,
    UserProfileResponse user) {
}
