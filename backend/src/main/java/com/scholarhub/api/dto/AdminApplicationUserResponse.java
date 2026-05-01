package com.scholarhub.api.dto;

public record AdminApplicationUserResponse(
    String id,
    String name,
    String email,
    String phoneNumber) {
}
