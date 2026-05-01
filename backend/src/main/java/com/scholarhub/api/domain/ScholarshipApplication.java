package com.scholarhub.api.domain;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("applications")
public class ScholarshipApplication {
  @Id
  private String id;

  private String scholarshipId;
  private String scholarshipTitle;
  private String provider;
  private BigDecimal amount;
  private String studentId;
  private String studentName;
  private String studentEmail;
  private String phoneNumber;
  private String dateOfBirth;
  private String course;
  private String institution;
  private String academicYear;
  private String percentage;
  private BigDecimal annualIncome;
  private String category;
  private String caste;
  private String addressLine;
  private String city;
  private String state;
  private String pincode;
  private String essay;
  private ApplicationStatus status;
  private String reviewerNote;
  private Instant submittedAt;
  private Instant updatedAt;
}
