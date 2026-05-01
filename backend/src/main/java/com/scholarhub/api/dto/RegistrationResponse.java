package com.scholarhub.api.dto;

public record RegistrationResponse(
    UserProfileResponse user,
    VerificationStatusResponse verification) {
}
