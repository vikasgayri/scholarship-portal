package com.scholarhub.api.dto;

import com.scholarhub.api.domain.Role;

public record UserProfileResponse(
    String id,
    String name,
    String email,
    Role role,
    String course,
    String phoneNumber,
    String city,
    String state,
    boolean profileComplete,
    boolean emailVerified) {
}
