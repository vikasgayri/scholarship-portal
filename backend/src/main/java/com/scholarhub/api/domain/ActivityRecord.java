package com.scholarhub.api.domain;

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
@Document("activities")
public class ActivityRecord {
  @Id
  private String id;

  private String userId;
  private String message;
  private Instant createdAt;
}
