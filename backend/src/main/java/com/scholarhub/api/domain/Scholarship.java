package com.scholarhub.api.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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
@Document("scholarships")
public class Scholarship {
  @Id
  private String id;

  private String title;
  private String provider;
  private String description;
  private String eligibility;
  private String category;
  private String officialWebsite;
  private BigDecimal amount;
  private Integer seats;
  private LocalDate deadline;
  private ScholarshipStatus status;
  private boolean featured;
  private String location;
  private Instant createdAt;
  private Instant updatedAt;
}
