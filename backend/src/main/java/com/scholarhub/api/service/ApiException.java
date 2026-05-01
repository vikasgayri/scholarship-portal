package com.scholarhub.api.service;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
  private final @NonNull HttpStatus status;

  public ApiException(String message) {
    this(HttpStatus.BAD_REQUEST, message);
  }

  public ApiException(@NonNull HttpStatus status, String message) {
    super(message);
    this.status = status;
  }
}
