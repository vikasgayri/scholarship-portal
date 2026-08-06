package com.scholarhub.api.domain;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("password_reset_otps")
public class PasswordResetOtp {
  @Id
  private String id;

  @Indexed
  private String email;
  private String otp;
  private Instant expiryTime;
  private Instant createdAt;
  private boolean used;
  private int verificationAttempts;
}
