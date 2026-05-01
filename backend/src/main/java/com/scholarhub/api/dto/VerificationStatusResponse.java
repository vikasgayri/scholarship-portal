package com.scholarhub.api.dto;

public record VerificationStatusResponse(
    String email,
    boolean emailVerified,
    String emailOtpHint,
    String fallbackEmailOtp) {
}
