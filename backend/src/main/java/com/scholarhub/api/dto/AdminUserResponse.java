package com.scholarhub.api.dto;

import com.scholarhub.api.domain.Role;
import java.time.Instant;

public record AdminUserResponse(
    String id,
    String name,
    String email,
    String phoneNumber,
    Role role,
    String course,
    String city,
    String state,
    boolean profileComplete,
    boolean emailVerified,
    Instant createdAt) {
}
