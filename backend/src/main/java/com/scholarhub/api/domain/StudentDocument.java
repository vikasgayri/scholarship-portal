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
@Document("documents")
public class StudentDocument {
  @Id
  private String id;

  private String userId;
  private String applicationId;
  private String name;
  private String storedFileName;
  private String filePath;
  private String category;
  private String contentType;
  private long size;
  private DocumentStatus status;
  private Instant uploadedAt;
}
