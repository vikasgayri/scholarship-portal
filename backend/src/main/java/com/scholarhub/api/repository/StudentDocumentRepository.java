package com.scholarhub.api.repository;

import com.scholarhub.api.domain.StudentDocument;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentDocumentRepository extends MongoRepository<StudentDocument, String> {
  long countByUserId(String userId);

  List<StudentDocument> findAllByUserId(String userId);

  List<StudentDocument> findAllByUserIdOrderByUploadedAtDesc(String userId);

  List<StudentDocument> findAllByApplicationIdOrderByUploadedAtDesc(String applicationId);

  Optional<StudentDocument> findByIdAndUserId(String id, String userId);

  Optional<StudentDocument> findByStoredFileName(String storedFileName);

  void deleteAllByUserId(String userId);
}
