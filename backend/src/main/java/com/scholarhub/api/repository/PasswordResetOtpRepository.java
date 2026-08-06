package com.scholarhub.api.repository;

import com.scholarhub.api.domain.PasswordResetOtp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PasswordResetOtpRepository extends MongoRepository<PasswordResetOtp, String> {
  long countByEmailAndCreatedAtAfter(String email, Instant createdAt);

  List<PasswordResetOtp> findAllByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

  Optional<PasswordResetOtp> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
}
