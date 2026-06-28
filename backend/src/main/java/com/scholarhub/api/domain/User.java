package com.scholarhub.api.domain;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("users")
public class User {
  @Id
  private String id;

  private String name;
  @Indexed(unique = true)
  private String email;
  private String passwordHash;
  private Role role;
  private String course;
  @Field("phone")
  private String phoneNumber;
  private String city;
  private String state;
  private boolean profileComplete;
  private boolean emailVerified;
  private String emailVerificationOtp;
  private Instant emailVerificationOtpExpiresAt;
  private Instant lastLoginAt;
  private Instant createdAt;
  private Instant updatedAt;

  public Role getRole() {
    return role == null ? Role.USER : role.normalized();
  }

  public boolean isFullyVerified() {
    return emailVerified;
  }
}
