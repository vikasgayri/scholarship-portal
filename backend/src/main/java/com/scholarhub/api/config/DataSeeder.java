package com.scholarhub.api.config;

import com.scholarhub.api.domain.Role;
import com.scholarhub.api.domain.Scholarship;
import com.scholarhub.api.domain.ScholarshipStatus;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.repository.ScholarshipRepository;
import com.scholarhub.api.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
  private static final String DEFAULT_ADMIN_EMAIL = "vikasgayri05@gmail.com";
  private static final String DEFAULT_ADMIN_PASSWORD = "vikas1234";
  private static final List<String> LEGACY_ADMIN_EMAILS = List.of(
      "admin@scholarhub.com",
      "vikasgayri@gmail.com");

  private final UserRepository userRepository;
  private final ScholarshipRepository scholarshipRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) {
    seedAdmin();
    seedScholarships();
  }

  private void seedAdmin() {
    if (userRepository.findByEmail(DEFAULT_ADMIN_EMAIL).isPresent()) {
      userRepository.findByEmail(DEFAULT_ADMIN_EMAIL)
          .ifPresent(admin -> saveAdmin(admin, DEFAULT_ADMIN_EMAIL));
      return;
    }

    for (String legacyEmail : LEGACY_ADMIN_EMAILS) {
      if (userRepository.findByEmail(legacyEmail).isPresent()) {
        userRepository.findByEmail(legacyEmail)
            .ifPresent(admin -> saveAdmin(admin, DEFAULT_ADMIN_EMAIL));
        return;
      }
    }

    userRepository.save(User.builder()
        .name("ScholarHub Admin")
        .email(DEFAULT_ADMIN_EMAIL)
        .passwordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
        .role(Role.ADMIN)
        .course("Administration")
        .phoneNumber("+91 99999 00000")
        .city("Udaipur")
        .state("Rajasthan")
        .profileComplete(true)
        .emailVerified(true)
        .createdAt(Instant.now())
        .updatedAt(Instant.now())
        .build());
  }

  private void saveAdmin(User admin, String email) {
    admin.setEmail(email);
    admin.setPasswordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
    admin.setRole(Role.ADMIN);
    admin.setEmailVerified(true);
    admin.setUpdatedAt(Instant.now());
    userRepository.save(admin);
  }

  private void seedScholarships() {
    if (scholarshipRepository.count() > 0) {
      return;
    }

    scholarshipRepository.saveAll(List.of(
        buildScholarship(
            "Merit Future Scholarship",
            "National Education Trust",
            "For high-performing students who need support to continue undergraduate studies.",
            "Students with 75% or higher academic score and strong attendance.",
            "Merit",
            new BigDecimal("50000"),
            120,
            LocalDate.now().plusMonths(2),
            true,
            "Pan India"),
        buildScholarship(
            "Women in STEM Grant",
            "Innovation Council",
            "Supports women pursuing engineering, technology, and applied science programs.",
            "Open to women enrolled in STEM-focused undergraduate and postgraduate programs.",
            "STEM",
            new BigDecimal("80000"),
            60,
            LocalDate.now().plusMonths(3),
            true,
            "National"),
        buildScholarship(
            "Rural Rising Fund",
            "Community Growth Foundation",
            "Need-based financial support for students from rural communities.",
            "Applicants from rural communities with household income below the threshold.",
            "Need Based",
            new BigDecimal("35000"),
            200,
            LocalDate.now().plusMonths(1),
            false,
            "Rural Districts"),
        buildScholarship(
            "Global Leaders Fellowship",
            "Aspire International",
            "Leadership-oriented scholarship for community builders and changemakers.",
            "Students with leadership roles, community contribution, and strong personal essays.",
            "Leadership",
            new BigDecimal("100000"),
            35,
            LocalDate.now().plusMonths(4),
            true,
            "International Exchange")));
  }

  private Scholarship buildScholarship(
      String title,
      String provider,
      String description,
      String eligibility,
      String category,
      BigDecimal amount,
      int seats,
      LocalDate deadline,
      boolean featured,
      String location) {
    return Scholarship.builder()
        .title(title)
        .provider(provider)
        .description(description)
        .eligibility(eligibility)
        .category(category)
        .amount(amount)
        .seats(seats)
        .deadline(deadline)
        .status(ScholarshipStatus.OPEN)
        .featured(featured)
        .location(location)
        .createdAt(Instant.now())
        .updatedAt(Instant.now())
        .build();
  }
}
